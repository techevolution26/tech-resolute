// src/app/admin/orders/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/adminApi'

type Order = {
  id: number
  product: { title: string }
  buyer_name?: string
  buyer_phone?: string
  status: string
  created_at?: string
}

const STATUS_OPTIONS = ['new','pending','contacted','completed','cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await adminFetch('/orders')
      const data = res.data ?? res
      setOrders(data)
    } catch (e: any) {
      alert('Failed to load orders: ' + e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: number, status: string) {
    try {
      const res = await adminFetch(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      setOrders((list) => list.map(o => o.id === id ? res : o))
      alert('Status updated')
    } catch (e: any) {
      alert('Failed to update: ' + e.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {loading && <div>Loading…</div>}

      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">#{o.id} — {o.product?.title}</div>
              <div className="text-lg font-medium">{o.buyer_name ?? '—'} • {o.buyer_phone}</div>
              <div className="text-xs text-gray-400">Created: {new Date(o.created_at || '').toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={o.status}
                onChange={(e) => updateStatus(o.id, e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
