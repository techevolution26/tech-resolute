// src/app/admin/products/page.tsx
'use client'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import AdminProductCard from '@/components/AdminProductsCard'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PlusIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

type Product = {
  id: number
  title: string
  price: string
  category?: string
  condition?: string
  image_url?: string
  created_at?: string
  stock?: number
  status?: 'active' | 'draft' | 'archived'
}

type FilterState = {
  search: string
  category: string
  condition: string
  status: string
  priceRange: [number, number]
  inStock: boolean | 'all'
}

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title-asc' | 'title-desc'

type ViewMode = 'grid' | 'list'
type PaginationMode = 'load-more' | 'pages'

/** Narrow API product shape we expect (but keep robust to variations) */
type RawApiProduct = Record<string, unknown>

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [paginationMode, setPaginationMode] = useState<PaginationMode>('load-more')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loadingMore, setLoadingMore] = useState(false)
  const router = useRouter()

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    condition: 'all',
    status: 'all',
    priceRange: [0, 100000],
    inStock: 'all'
  })

  // Debounce search to avoid too many re-renders
  const debouncedSearch = useDebounce(filters.search, 300)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await adminFetch('/v1/admin/products')
        if (res.status === 401 || res.status === 403) {
          clearAdminToken()
          router.replace('/admin/login')
          return
        }

        const body = (await res.json().catch(() => null)) as unknown
        if (!res.ok) {
          const msg = (typeof body === 'object' && body !== null && 'message' in (body as Record<string, unknown>))
            ? String((body as Record<string, unknown>).message)
            : res.statusText
          throw new Error(msg)
        }

        // body may be paginated { data: [...] } or plain array
        const listRaw = Array.isArray(body) ? body : (typeof body === 'object' && body !== null ? ((body as Record<string, unknown>)['data'] ?? body) : [])

        // helper: extract image url from various shapes
        function extractImageUrl(obj: unknown): string | undefined {
          if (!obj || typeof obj !== 'object') return undefined
          const r = obj as Record<string, unknown>

          const candidate = r['image_url'] ?? r['image'] ?? r['images'] ?? r['pictures'] ?? r['photo'] ?? r['thumbnail'] ?? r['image_path'] ?? r['img']
          // direct string
          if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()

          // array of images (strings or objects)
          if (Array.isArray(candidate) && candidate.length > 0) {
            const first = candidate[0]
            if (typeof first === 'string' && first.trim()) return first.trim()
            if (typeof first === 'object' && first !== null) {
              const f = first as Record<string, unknown>
              return String(f['url'] ?? f['path'] ?? f['full_url'] ?? f['publicUrl'] ?? f['image_url'] ?? '').trim() || undefined
            }
          }

          // nested object with common keys: { url, path, full_url, publicUrl, key }
          const maybeObj = r['image'] ?? r['image_url'] ?? r['photo'] ?? r['picture']
          if (maybeObj && typeof maybeObj === 'object') {
            const m = maybeObj as Record<string, unknown>
            const val = String(m['url'] ?? m['path'] ?? m['full_url'] ?? m['publicUrl'] ?? m['key'] ?? '').trim()
            if (val) return val
          }

          // nested product / variant structure: product: { image_url }
          if (r['product'] && typeof r['product'] === 'object') {
            const p = r['product'] as Record<string, unknown>
            if (typeof p['image_url'] === 'string' && String(p['image_url']).trim()) return String(p['image_url']).trim()
            if (typeof p['image'] === 'string' && String(p['image']).trim()) return String(p['image']).trim()
          }

          return undefined
        }

        function normalize(item: unknown): Product {
          if (!item || typeof item !== 'object') {
            return { id: 0, title: '', price: '' }
          }
          const it = item as RawApiProduct
          const id = Number(it.id ?? 0)
          const title = String(it.title ?? it.name ?? '')
          const price = (typeof it.price === 'number') ? String(it.price) : String(it.price ?? '')
          let category: string | undefined = undefined
          const rawCategory = it.category
          if (rawCategory && typeof rawCategory === 'object') {
            category = String((rawCategory as Record<string, unknown>)['name'] ?? '')
          } else if (typeof rawCategory === 'string') {
            category = rawCategory
          }

          let condition: string | undefined = undefined
          const rawCondition = it.condition
          if (rawCondition && typeof rawCondition === 'object') {
            condition = String((rawCondition as Record<string, unknown>)['name'] ?? '')
          } else if (typeof rawCondition === 'string') {
            condition = rawCondition
          }

          const image_url = extractImageUrl(it)
          const created_at = String(it.created_at ?? it.createdAt ?? '')
          const stock = Number(it.stock ?? it.quantity ?? 0)
          const status = String(it.status ?? 'active') as 'active' | 'draft' | 'archived'

          return { id, title, price, category, condition, image_url, created_at, stock, status }
        }

        if (!mounted) return
        const arr = Array.isArray(listRaw) ? (listRaw as unknown[]).map(normalize) : []
        setProducts(arr)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [router])

  // Extract unique filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[]
    const conditions = [...new Set(products.map(p => p.condition).filter(Boolean))] as string[]
    const maxPrice = Math.max(...products.map(p => parseFloat(p.price) || 0), 1000)

    return {
      categories,
      conditions,
      maxPrice: Math.ceil(maxPrice / 100) * 100 // Round up to nearest 100
    }
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Search filter
      if (debouncedSearch && !product.title.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false
      }

      // Category filter
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false
      }

      // Condition filter
      if (filters.condition !== 'all' && product.condition !== filters.condition) {
        return false
      }

      // Status filter
      if (filters.status !== 'all' && product.status !== filters.status) {
        return false
      }

      // Price range filter
      const price = parseFloat(product.price) || 0
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false
      }

      // Stock filter
      if (filters.inStock !== 'all') {
        const hasStock = (product.stock ?? 0) > 0
        if (filters.inStock === true && !hasStock) return false
        if (filters.inStock === false && hasStock) return false
      }

      return true
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        case 'price-low':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)
        case 'price-high':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

    return filtered
  }, [products, filters, sortBy, debouncedSearch])

  // Pagination logic
  const paginatedProducts = useMemo(() => {
    if (paginationMode === 'load-more') {
      return filteredProducts.slice(0, currentPage * itemsPerPage)
    } else {
      const startIndex = (currentPage - 1) * itemsPerPage
      return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
    }
  }, [filteredProducts, currentPage, itemsPerPage, paginationMode])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const hasMore = paginatedProducts.length < filteredProducts.length
  const showingCount = paginatedProducts.length
  const totalCount = filteredProducts.length

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy, paginationMode])

  const loadMore = () => {
    setLoadingMore(true)
    // Simulate loading delay for better UX
    setTimeout(() => {
      setCurrentPage(prev => prev + 1)
      setLoadingMore(false)
    }, 500)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      condition: 'all',
      status: 'all',
      priceRange: [0, filterOptions.maxPrice],
      inStock: 'all'
    })
  }

  const stats = {
    total: products.length,
    filtered: filteredProducts.length,
    outOfStock: products.filter(p => (p.stock ?? 0) <= 0).length,
    active: products.filter(p => p.status === 'active').length
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 font-semibold hover:from-gray-100 hover:to-gray-200 border border-gray-300 disabled:opacity-50 transition-all duration-200"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/admin/products/create"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Create Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
          <div className="text-sm font-semibold text-amber-800 mb-1">Total Products</div>
          <div className="text-2xl font-bold text-amber-900">{stats.total}</div>
          <div className="text-xs text-amber-600 mt-2">All products in catalog</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="text-sm font-semibold text-blue-800 mb-1">Showing</div>
          <div className="text-2xl font-bold text-blue-900">{showingCount}</div>
          <div className="text-xs text-blue-600 mt-2">of {totalCount} products</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="text-sm font-semibold text-green-800 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-900">{stats.active}</div>
          <div className="text-xs text-green-600 mt-2">Active products</div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-2xl p-6">
          <div className="text-sm font-semibold text-rose-800 mb-1">Out of Stock</div>
          <div className="text-2xl font-bold text-rose-900">{stats.outOfStock}</div>
          <div className="text-xs text-rose-600 mt-2">Need restocking</div>
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
                placeholder="Search products..."
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
              <option value={100}>100 per page</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>

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
                !(Array.isArray(val) && val[0] === 0 && val[1] === filterOptions.maxPrice) &&
                val !== 'all'
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
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  {filterOptions.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                >
                  <option value="all">All Conditions</option>
                  {filterOptions.conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Status</label>
                <select
                  value={filters.inStock === 'all' ? 'all' : filters.inStock ? 'in-stock' : 'out-of-stock'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    inStock: e.target.value === 'all' ? 'all' : e.target.value === 'in-stock'
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                >
                  <option value="all">All Stock</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Price Range: KES {filters.priceRange[0]} - {filters.priceRange[1]}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max={filterOptions.maxPrice}
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                  }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max={filterOptions.maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                  }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {showingCount} of {totalCount} products
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

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3">
          <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0"></div>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
          <div className="text-gray-600 font-medium">Loading products...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-gray-600 font-medium mb-2">
            {products.length === 0 ? 'No products yet' : 'No products match your filters'}
          </div>
          <div className="text-gray-500 text-sm mb-6">
            {products.length === 0
              ? 'Create your first product to get started'
              : 'Try adjusting your search or filters'
            }
          </div>
          {products.length === 0 ? (
            <Link
              href="/admin/products/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Create First Product
            </Link>
          ) : (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-sm"
            >
              <XMarkIcon className="w-5 h-5" />
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Products Grid/List */}
      {!loading && paginatedProducts.length > 0 && (
        <>
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            : "space-y-4 mb-8"
          }>
            {paginatedProducts.map((product) => (
              <AdminProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onDelete={async (id) => {
                  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return
                  try {
                    const res = await adminFetch(`/v1/admin/products/${id}`, { method: 'DELETE' })
                    if (res.status === 401 || res.status === 403) {
                      clearAdminToken()
                      router.replace('/admin/login')
                      return
                    }
                    if (!res.ok) {
                      const b = await res.json().catch(() => null)
                      throw new Error((b && typeof b === 'object' && 'message' in b) ? String((b as Record<string, unknown>).message) : res.statusText)
                    }
                    setProducts((list) => list.filter(x => x.id !== id))
                  } catch (err) {
                    alert('Delete failed: ' + (err as Error).message)
                  }
                }}
              />
            ))}
          </div>

          {/* Pagination Controls */}
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
                Showing {showingCount} of {totalCount} products
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
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          Load More ({totalCount - showingCount} remaining)
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}