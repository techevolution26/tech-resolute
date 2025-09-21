'use client'
import React, { useEffect, useState } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import ApproveModal from './components/ApproveModal'

type Application = {
  id: number
  business_name: string
  contact_name?: string
  email?: string
  phone?: string
  website?: string
  message?: string
  status?: string
  created_at?: string
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
        // redirect to admin login client-side
        window.location.href = '/admin/login'
        return
      }
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.message || res.statusText)
      // supports paginated {data:[]} or plain array
      const list = Array.isArray(body) ? body : (body.data ?? [])
      setApps(list)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function onApproved(updatedApp: Application) {
    setApps((prev) => prev.map(a => (a.id === updatedApp.id ? updatedApp : a)))
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
        {apps.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-start">
            <div>
              <div className="text-lg font-semibold">{a.business_name}</div>
              <div className="text-sm text-gray-600">{a.contact_name} • {a.email ?? a.phone}</div>
              <div className="text-xs text-gray-400 mt-1">Applied: {a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</div>
              {a.message && <div className="mt-2 text-sm text-gray-700">{a.message}</div>}
            </div>

            <div className="flex flex-col gap-2">
              {a.status === 'approved' ? (
                <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">Approved</div>
              ) : (
                <button
                  onClick={() => setSelectedAppId(a.id)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                >
                  Review & Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedAppId !== null && (
        <ApproveModal
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onSuccess={(body) => {
            // Expect body to contain updated application or id/status
            // reload or patch local state
            if (body && body.id) onApproved(body)
            else load()
          }}
        />
      )}
    </div>
  )
}
