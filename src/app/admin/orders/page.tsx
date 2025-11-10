'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import { normalizeSrc } from '@/lib/normalizeSrc'
import {
  ArrowPathIcon,
  EyeIcon,
  EnvelopeIcon,
  XMarkIcon,
  ShoppingBagIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

type ProductMini = {
  id?: number
  title?: string
  image_url?: string | null
  slug?: string | null
}

type OrderItem = {
  id?: number
  product_id?: number
  title?: string
  quantity?: number
  unit_price?: number
  total_price?: number
  product?: ProductMini | null
  extra?: Record<string, unknown>
}

type Order = {
  id: number
  status: string
  total?: number
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  shipping_address?: string | null
  notes?: string | null
  items?: OrderItem[]
  created_at?: string | null
  product?: { title?: string } | null
  extra?: Record<string, unknown>
}

type FilterState = {
  search: string
  status: string
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom'
  customer: string
  minAmount: number
  maxAmount: number
}

type SortOption = 'newest' | 'oldest' | 'total-high' | 'total-low' | 'customer-asc' | 'customer-desc'

type PaginationMode = 'load-more' | 'pages'

const STATUS_OPTIONS = ['new', 'pending', 'contacted', 'completed', 'cancelled'] as const

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  contacted: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
}

const STATUS_ICONS: Record<string, string> = {
  new: '🆕',
  pending: '⏳',
  contacted: '💬',
  completed: '✅',
  cancelled: '❌'
}

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({})
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [paginationMode, setPaginationMode] = useState<PaginationMode>('load-more')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    dateRange: 'all',
    customer: '',
    minAmount: 0,
    maxAmount: 100000
  })

  // Debounce search to avoid too many re-renders
  const debouncedSearch = useDebounce(filters.search, 300)

  // helper: safe message extractor from unknown JSON bodies
  function extractMessage(body: unknown, fallback = ''): string {
    if (typeof body === 'object' && body !== null) {
      const b = body as Record<string, unknown>
      const m = b['message']
      if (typeof m === 'string') return m
    }
    return fallback
  }

  // helper: try to coerce body to Order or list of Orders when possible
  function parseOrders(body: unknown): Order[] {
    if (Array.isArray(body)) {
      return body as Order[]
    }
    if (typeof body === 'object' && body !== null) {
      const b = body as Record<string, unknown>
      if (Array.isArray(b['data'])) return b['data'] as Order[]
      // maybe single order or paginated object — if it has id treat as single
      if (typeof b['id'] === 'number') return [b as Order]
    }
    return []
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch('/v1/admin/orders')
      if (res.status === 401 || res.status === 403) {
        clearAdminToken()
        window.location.href = '/admin/login'
        return
      }

      // parse JSON as unknown
      const body = await res.json().catch(() => null) as unknown
      if (!res.ok) {
        const msg = extractMessage(body, res.statusText || 'Failed to load orders')
        throw new Error(msg)
      }

      const list = parseOrders(body)
      setOrders(list)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      // Search filter (order ID, customer name, email, product title)
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase()
        const matchesId = order.id.toString().includes(searchTerm)
        const matchesCustomer = order.customer_name?.toLowerCase().includes(searchTerm) || false
        const matchesEmail = order.customer_email?.toLowerCase().includes(searchTerm) || false
        const matchesProduct = order.items?.some(item =>
          item.title?.toLowerCase().includes(searchTerm)
        ) || false

        if (!matchesId && !matchesCustomer && !matchesEmail && !matchesProduct) {
          return false
        }
      }

      // Status filter
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false
      }

      // Customer filter
      if (filters.customer && !order.customer_name?.toLowerCase().includes(filters.customer.toLowerCase())) {
        return false
      }

      // Amount range filter
      const total = order.total || 0
      if (total < filters.minAmount || total > filters.maxAmount) {
        return false
      }

      // Date range filter
      if (filters.dateRange !== 'all' && order.created_at) {
        const orderDate = new Date(order.created_at)
        const today = new Date()
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        switch (filters.dateRange) {
          case 'today':
            if (orderDate < startOfToday) return false
            break
          case 'week':
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay())
            if (orderDate < startOfWeek) return false
            break
          case 'month':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            if (orderDate < startOfMonth) return false
            break
        }
      }

      return true
    })

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        case 'total-high':
          return (b.total || 0) - (a.total || 0)
        case 'total-low':
          return (a.total || 0) - (b.total || 0)
        case 'customer-asc':
          return (a.customer_name || '').localeCompare(b.customer_name || '')
        case 'customer-desc':
          return (b.customer_name || '').localeCompare(a.customer_name || '')
        default:
          return 0
      }
    })

    return filtered
  }, [orders, filters, sortBy, debouncedSearch])

  // Pagination logic
  const paginatedOrders = useMemo(() => {
    if (paginationMode === 'load-more') {
      return filteredOrders.slice(0, currentPage * itemsPerPage)
    } else {
      const startIndex = (currentPage - 1) * itemsPerPage
      return filteredOrders.slice(startIndex, startIndex + itemsPerPage)
    }
  }, [filteredOrders, currentPage, itemsPerPage, paginationMode])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const hasMore = paginatedOrders.length < filteredOrders.length
  const showingCount = paginatedOrders.length
  const totalCount = filteredOrders.length

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy, paginationMode])

  const loadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      dateRange: 'all',
      customer: '',
      minAmount: 0,
      maxAmount: 100000
    })
  }

  // Calculate order statistics - UPDATED VERSION
  // Calculate order statistics - UPDATED VERSION WITH PROPER NUMBER HANDLING
  const stats = useMemo(() => {
    const total = orders.length

    // Only count revenue from completed orders with proper number conversion
    const completedOrders = orders.filter(order => order.status === 'completed')

    // Safely convert order totals to numbers, defaulting to 0 for invalid values
    const totalRevenue = completedOrders.reduce((sum, order) => {
      const orderTotal = order.total;
      // Handle different possible types: number, string, null, undefined
      const numericTotal = typeof orderTotal === 'number'
        ? orderTotal
        : typeof orderTotal === 'string'
          ? parseFloat(orderTotal) || 0
          : 0;

      return sum + numericTotal;
    }, 0);

    const averageOrderValue = completedOrders.length > 0
      ? totalRevenue / completedOrders.length
      : 0;

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      totalRevenue,
      averageOrderValue,
      statusCounts,
      filtered: filteredOrders.length,
      completedCount: completedOrders.length
    }
  }, [orders, filteredOrders])

  async function updateStatus(id: number, newStatus: string) {
    if (newStatus === 'cancelled' && !confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return

    const prev = orders.find(o => o.id === id)
    if (!prev) return
    const prevStatus = prev.status

    // optimistic UI
    setOrders(list => list.map(o => (o.id === id ? { ...o, status: newStatus } : o)))
    setUpdatingIds(s => ({ ...s, [id]: true }))

    try {
      const res = await adminFetch(`/v1/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.status === 401 || res.status === 403) {
        clearAdminToken()
        window.location.href = '/admin/login'
        return
      }

      const body = await res.json().catch(() => null) as unknown
      if (!res.ok) {
        const msg = extractMessage(body, res.statusText || 'Failed to update order')
        throw new Error(msg)
      }

      // if API returned an updated order object, merge it
      if (typeof body === 'object' && body !== null && typeof (body as Record<string, unknown>)['id'] === 'number') {
        const updated = body as Partial<Order> & { id: number }
        setOrders(list => list.map(o => (o.id === id ? { ...o, ...(updated as Partial<Order>) } : o)))
      }
    } catch (err: unknown) {
      // rollback on error
      setOrders(list => list.map(o => (o.id === id ? { ...o, status: prevStatus } : o)))
      const msg = err instanceof Error ? err.message : String(err)
      alert('Failed to update status: ' + (msg || 'Unknown error'))
    } finally {
      setUpdatingIds(s => {
        const copy = { ...s }
        delete copy[id]
        return copy
      })
    }
  }

  function prettyDate(ds?: string | null) {
    if (!ds) return '—'
    try {
      const date = new Date(ds)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ds || '—'
    }
  }

  const Thumbnail: React.FC<{ src?: string | null; alt?: string }> = ({ src, alt }) => {
    const url = src ? normalizeSrc(src) : null
    if (!url) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-300 flex items-center justify-center text-gray-400">
          <ShoppingBagIcon className="w-5 h-5" />
        </div>
      )
    }

    return <img src={url} alt={alt ?? ''} className="w-12 h-12 object-cover rounded-xl border border-gray-200" />
  }

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {STATUS_ICONS[status] || '📦'} {status.toUpperCase()}
    </span>
  )

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxVisiblePages - 1)

      if (start > 1) {
        pages.push(1)
        if (start > 2) pages.push('...')
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 font-semibold hover:from-amber-100 hover:to-amber-200 border border-amber-200 disabled:opacity-50 transition-all duration-200"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards - UPDATED VERSION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
          <div className="text-sm font-semibold text-amber-800 mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-amber-900">{stats.total}</div>
          <div className="text-xs text-amber-600 mt-2">All orders received</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="text-sm font-semibold text-blue-800 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-900">
            KES {typeof stats.totalRevenue === 'number'
              ? Math.round(stats.totalRevenue).toLocaleString()
              : '0'}
          </div>
          <div className="text-xs text-blue-600 mt-2">From {stats.completedCount} completed orders</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="text-sm font-semibold text-green-800 mb-1">Average Order</div>
          <div className="text-2xl font-bold text-green-900">
            KES {typeof stats.averageOrderValue === 'number'
              ? Math.round(stats.averageOrderValue).toLocaleString()
              : '0'}
          </div>
          <div className="text-xs text-green-600 mt-2">Average completed order value</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6">
          <div className="text-sm font-semibold text-purple-800 mb-1">Showing</div>
          <div className="text-2xl font-bold text-purple-900">{showingCount}</div>
          <div className="text-xs text-purple-600 mt-2">of {totalCount} orders</div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {STATUS_OPTIONS.map(status => (
            <div key={status} className="text-center">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${STATUS_COLORS[status]}`}>
                {STATUS_ICONS[status]} {status.toUpperCase()}
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{stats.statusCounts[status] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers, products..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Items Per Page */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="total-high">Total: High to Low</option>
              <option value="total-low">Total: Low to High</option>
              <option value="customer-asc">Customer: A to Z</option>
              <option value="customer-desc">Customer: Z to A</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${showFilters
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-gray-300 text-gray-700 hover:border-amber-300'
                }`}
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
              {Object.values(filters).some(val =>
                val !== '' &&
                val !== 'all' &&
                val !== 0 &&
                val !== 100000
              ) && (
                  <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                )}
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter - FIXED VERSION */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterState['dateRange'] }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Customer Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
                <input
                  type="text"
                  placeholder="Filter by customer..."
                  value={filters.customer}
                  onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                />
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount Range: KES {filters.minAmount} - {filters.maxAmount}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {showingCount} of {totalCount} orders
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-medium hover:from-gray-200 hover:to-gray-300 border border-gray-300 transition-all duration-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3">
          <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0"></div>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
          <div className="text-gray-600 font-medium">Loading orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 font-medium mb-2">No orders yet</div>
          <div className="text-gray-500 text-sm">Orders will appear here once customers start purchasing</div>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {paginatedOrders.map(o => (
              <div key={o.id} className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 hover:border-amber-300 transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Order Info */}
                  <div className="flex-1 flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {o.items && o.items[0]?.product?.image_url ? (
                        <Thumbnail src={o.items[0].product?.image_url} alt={o.items[0].title} />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 flex items-center justify-center">
                          <ShoppingBagIcon className="w-5 h-5 text-amber-400" />
                        </div>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-sm font-semibold text-gray-700">#{o.id}</div>
                        <StatusBadge status={o.status} />
                      </div>

                      <div className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {o.product?.title ?? (o.items && o.items[0]?.title) ?? 'Untitled Order'}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          {o.customer_name ?? 'Anonymous'}
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {prettyDate(o.created_at)}
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      {o.items && o.items.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items ({o.items.length})</div>
                          <div className="space-y-2">
                            {o.items.slice(0, 2).map(it => (
                              <div key={it.id ?? `${o.id}-${it.product_id}`} className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 overflow-hidden rounded-lg border">
                                  <Thumbnail src={it.product?.image_url} alt={it.title} />
                                </div>
                                <span className="flex-1 truncate">{it.title ?? `Product ${it.product_id ?? '—'}`}</span>
                                <span className="text-gray-500 text-xs">x{it.quantity ?? 1}</span>
                              </div>
                            ))}
                            {o.items.length > 2 && (
                              <div className="text-xs text-amber-600 font-medium">
                                +{o.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Total */}
                  <div className="flex flex-col items-start lg:items-end gap-4">
                    {/* Total Amount */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-700">
                        {o.total != null ? `KES ${typeof o.total === 'number' ? o.total : parseFloat(o.total as string) || 0}` : '—'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Total amount</div>
                    </div>


                    {/* Status Update */}
                    <div className="flex flex-col gap-3 w-full lg:w-auto">
                      <div className="flex items-center gap-2">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="flex-1 lg:w-48 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm"
                          disabled={!!updatingIds[o.id]}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>

                        {updatingIds[o.id] && (
                          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 border border-gray-300 transition-all duration-200 flex-1 justify-center"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Details
                        </button>

                        <a
                          href={`mailto:${o.customer_email || 'techevo404@gmail.com'}?subject=${encodeURIComponent(`Order #${o.id} Update`)}&body=${encodeURIComponent(`Hi ${o.customer_name || 'there'},\n\nRegarding your order #${o.id}, we wanted to provide an update...\n\nBest regards,\nTech Resolute Team`)}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 font-medium hover:from-amber-100 hover:to-amber-200 border border-amber-300 transition-all duration-200 flex-1 justify-center"
                        >
                          <EnvelopeIcon className="w-4 h-4" />
                          Email
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredOrders.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Pagination Mode Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">View:</span>
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setPaginationMode('load-more')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${paginationMode === 'load-more'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Load More
                    </button>
                    <button
                      onClick={() => setPaginationMode('pages')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${paginationMode === 'pages'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Pages
                    </button>
                  </div>
                </div>

                {/* Page Info */}
                <div className="text-sm text-gray-600">
                  Showing {showingCount} of {totalCount} orders
                </div>

                {/* Pagination Controls */}
                {paginationMode === 'pages' ? (
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && goToPage(page)}
                          disabled={page === '...'}
                          className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl font-medium transition-all duration-200 ${page === currentPage
                            ? 'bg-amber-600 text-white shadow-sm'
                            : page === '...'
                              ? 'text-gray-400 cursor-default'
                              : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Load More Button */
                  <div className="flex justify-center w-full">
                    {hasMore && (
                      <button
                        onClick={loadMore}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-sm"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Load More ({totalCount - showingCount} remaining)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedOrder(null)} />
          <div className="relative z-50 max-w-4xl w-full bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                  <ShoppingBagIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedOrder.status} />
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      {prettyDate(selectedOrder.created_at)}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl hover:bg-white/50 transition-colors duration-200"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <UserIcon className="w-5 h-5 text-amber-600" />
                      Customer Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Name</div>
                        <div className="text-gray-900">{selectedOrder.customer_name ?? '—'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Email</div>
                        <div className="text-gray-900">{selectedOrder.customer_email ?? '—'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Phone</div>
                        <div className="text-gray-900 flex items-center gap-1">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          {selectedOrder.customer_phone ?? '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <MapPinIcon className="w-5 h-5 text-amber-600" />
                      Shipping Address
                    </h4>
                    <div className="text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {selectedOrder.shipping_address ?? 'No shipping address provided'}
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                        <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                        Order Notes
                      </h4>
                      <div className="text-gray-900 bg-amber-50 p-4 rounded-xl border border-amber-200">
                        {selectedOrder.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                    <ShoppingBagIcon className="w-5 h-5 text-amber-600" />
                    Order Items
                  </h4>

                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.items.map(it => (
                        <div key={it.id ?? `${it.product_id}-${it.title}`} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-xl border">
                            <Thumbnail src={it.product?.image_url} alt={it.title} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {it.title ?? `Product ${it.product_id ?? '—'}`}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Quantity: {it.quantity ?? 1}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-sm text-gray-500">
                                Unit: KES {it.unit_price ?? '—'}
                              </div>
                              <div className="font-semibold text-amber-700">
                                KES {it.total_price ?? '—'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Order Total */}
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                          <span>Total Amount</span>
                          <span className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-5 h-5 text-amber-600" />
                            KES {selectedOrder.total ?? '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                      <ShoppingBagIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      No items found in this order
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-300 border border-gray-300 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}