'use client'

import React, { useEffect, useState } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import { normalizeSrc } from '@/lib/normalizeSrc'

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

const STATUS_OPTIONS = ['new', 'pending', 'contacted', 'completed', 'cancelled'] as const

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({})
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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

  async function updateStatus(id: number, newStatus: string) {
    if (newStatus === 'cancelled' && !confirm('Mark this order as CANCELLED?')) return

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
    try { return new Date(ds).toLocaleString() } catch { return ds || '—' }
  }

  const Thumbnail: React.FC<{ src?: string | null; alt?: string }> = ({ src, alt }) => {
    const url = src ? normalizeSrc(src) : null
    if (!url) {
      return (
        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
          </svg>
        </div>
      )
    }

    return <img src={url} alt={alt ?? ''} className="w-12 h-12 object-cover rounded" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading && orders.length === 0 ? (
        <div className="text-gray-500">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1 flex gap-4">
                <div className="flex-shrink-0">
                  {o.items && o.items[0]?.product?.image_url ? (
                    <Thumbnail src={o.items[0].product?.image_url} alt={o.items[0].title} />
                  ) : (
                    <div className="w-12 h-12 bg-gray-50 rounded border flex items-center justify-center text-xs text-gray-400">—</div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-600">#{o.id} • {o.product?.title ?? (o.items && o.items[0]?.title) ?? '—'}</div>
                  <div className="text-lg font-medium mt-1">
                    {o.customer_name ?? '—'} <span className="text-sm text-gray-500">• {o.customer_phone ?? o.customer_email ?? '—'}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Created: {prettyDate(o.created_at)}</div>

                  <div className="mt-3 text-sm text-gray-700">
                    <div>Total: {o.total != null ? `KES ${o.total}` : '—'}</div>
                    {o.items && o.items.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Items:</div>
                        <ul className="text-sm">
                          {o.items.slice(0, 3).map(it => (
                            <li key={it.id ?? `${o.id}-${it.product_id}`} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 overflow-hidden rounded">
                                  <Thumbnail src={it.product?.image_url} alt={it.title} />
                                </div>
                                <span>{it.title ?? `Product ${it.product_id ?? '—'}`}</span>
                              </div>
                              <span className="text-xs text-gray-500">x{it.quantity ?? 1}</span>
                            </li>
                          ))}
                          {o.items.length > 3 && <li className="text-xs text-gray-400">…and {o.items.length - 3} more</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3">
                <div className="flex items-center gap-2">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                    disabled={!!updatingIds[o.id]}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  {updatingIds[o.id] && (
                    <div className="text-sm text-gray-500">Updating…</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                  >
                    View
                  </button>

                  <a
                    href={`mailto:techevo404@gmail.com?subject=${encodeURIComponent('Order enquiry: #' + o.id)}&body=${encodeURIComponent(`Hi,\n\nPlease provide an update for order #${o.id}.\n\nThanks`)}`}
                    className="px-3 py-2 rounded bg-white border text-sm"
                  >
                    Email customer
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedOrder(null)} />
          <div className="relative z-50 max-w-2xl w-full bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{selectedOrder.id}</h3>
                <div className="text-xs text-gray-500">Placed: {prettyDate(selectedOrder.created_at)}</div>
              </div>
              <div>
                <button onClick={() => setSelectedOrder(null)} className="text-sm text-gray-500">Close</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Buyer</h4>
                <div className="text-sm">{selectedOrder.customer_name ?? '—'}</div>
                <div className="text-sm">{selectedOrder.customer_email ?? '—'}</div>
                <div className="text-sm">{selectedOrder.customer_phone ?? '—'}</div>

                <h4 className="font-medium text-gray-700 mt-4 mb-2">Shipping address</h4>
                <div className="text-sm">{selectedOrder.shipping_address ?? '—'}</div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <ul className="text-sm space-y-2">
                    {selectedOrder.items.map(it => (
                      <li key={it.id ?? `${it.product_id}-${it.title}`} className="flex gap-3 items-start">
                        <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded border">
                          <Thumbnail src={it.product?.image_url} alt={it.title} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{it.title ?? `Product ${it.product_id ?? '—'}`}</div>
                            <div className="text-xs text-gray-500">x{it.quantity ?? 1}</div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Unit: {it.unit_price ?? '—'} • Total: {it.total_price ?? '—'}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">No items found</div>
                )}

                <div className="mt-4 text-sm">
                  <div className="font-medium">Order total</div>
                  <div>{selectedOrder.total != null ? `KES ${selectedOrder.total}` : '—'}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 rounded bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
