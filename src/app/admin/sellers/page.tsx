// src/app/admin/sellers/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import ApproveModal from './components/ApproveModal'
import SellerCard from './components/SellerCard'
import type { Application } from './types'
import {
  UserGroupIcon,
  ArrowPathIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'

export default function AdminSellerApplications() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

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

  const filteredApps = apps.filter(app => {
    if (filter === 'all') return true
    if (filter === 'pending') return app.status !== 'approved'
    if (filter === 'approved') return app.status === 'approved'
    return true
  })

  const stats = {
    total: apps.length,
    pending: apps.filter(app => app.status !== 'approved').length,
    approved: apps.filter(app => app.status === 'approved').length
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Applications</h1>
          <p className="text-gray-600">Review and approve seller applications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 font-semibold hover:from-gray-100 hover:to-gray-200 border border-gray-300 disabled:opacity-50 transition-all duration-200"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-sm font-semibold text-amber-800">Total Applications</div>
          </div>
          <div className="text-2xl font-bold text-amber-900">{stats.total}</div>
          <div className="text-xs text-amber-600 mt-2">All seller applications</div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-rose-700" />
            </div>
            <div className="text-sm font-semibold text-rose-800">Pending Review</div>
          </div>
          <div className="text-2xl font-bold text-rose-900">{stats.pending}</div>
          <div className="text-xs text-rose-600 mt-2">Awaiting approval</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckBadgeIcon className="w-5 h-5 text-green-700" />
            </div>
            <div className="text-sm font-semibold text-green-800">Approved</div>
          </div>
          <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
          <div className="text-xs text-green-600 mt-2">Active sellers</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 bg-white p-2 rounded-2xl border border-gray-200 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${filter === 'all'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${filter === 'pending'
            ? 'bg-rose-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${filter === 'approved'
            ? 'bg-green-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Approved ({stats.approved})
        </button>
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
          <div className="text-gray-600 font-medium">Loading applications...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredApps.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 font-medium mb-2">
            {filter === 'all' ? 'No applications yet' :
              filter === 'pending' ? 'No pending applications' :
                'No approved applications'}
          </div>
          <div className="text-gray-500 text-sm">
            {filter === 'all' ? 'Seller applications will appear here when submitted' :
              filter === 'pending' ? 'All applications have been reviewed' :
                'No applications have been approved yet'}
          </div>
        </div>
      )}

      {/* Applications Grid */}
      {!loading && filteredApps.length > 0 && (
        <div className="grid gap-6">
          {filteredApps.map(a => (
            <SellerCard key={a.id} app={a} onReview={(id) => setSelectedAppId(id)} />
          ))}
        </div>
      )}

      {/* Approve Modal */}
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