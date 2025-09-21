'use client'
import React, { useEffect, useState } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import ApproveModal from './components/ApproveModal'
import SellerCard from './components/SellerCard'

export type Item = {
  title?: string
  condition?: string
  quantity?: number
  estimated_price?: string | number
  description?: string
  image_url?: string | null
  image?: string | null
}

export type Application = {
  id: number
  application_type?: 'business' | 'one_time'
  business_name?: string
  contact_name?: string
  email?: string
  phone?: string
  website?: string
  message?: string
  status?: string
  created_at?: string
  items?: Item[]
}

export default function AdminSellerApplications() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch('/v1/admin/seller-applications')
      if (res.status === 401 || res.status === 403) {
        clearAdminToken()
        window.location.href = '/admin/login'
        return
      }
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.message || res.statusText)
      const list: Application[] = Array.isArray(body) ? body : (body.data ?? [])
      setApps(list)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function onApproved(updatedApp: Application) {
    setApps(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a))
    setSelectedAppId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Seller applications</h1>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && apps.length === 0 && <div className="text-gray-500">No applications yet.</div>}

      <div className="grid gap-4">
        {apps.map(a => (
          <SellerCard key={a.id} app={a} onReview={(id) => setSelectedAppId(id)} />
        ))}
      </div>

      {selectedAppId !== null && (
        <ApproveModal
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onSuccess={(body) => {
            if (body && body.id) onApproved(body as Application)
            else load()
          }}
        />
      )}
    </div>
  )
}
