// src/app/admin/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminFetch, clearAdminToken, verifyAdmin, getAdminToken } from '@/lib/adminApi'

export default function AdminHome() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let mounted = true
    async function init() {
      setChecking(true)

      // quick local check: if no token -> immediate redirect
      const token = getAdminToken()
      if (!token) {
        // make sure we don't flash UI — go to login
        router.replace('/admin/login')
        return
      }

      // Verify token with backend (this will also catch revoked tokens)
      try {
        const ok = await verifyAdmin()
        if (!mounted) return
        if (!ok) {
          clearAdminToken()
          router.replace('/admin/login')
          return
        }
        setIsAdmin(true)
      } catch (err) {
        clearAdminToken()
        router.replace('/admin/login')
        return
      } finally {
        if (mounted) setChecking(false)
      }
    }
    init()
    return () => { mounted = false }
  }, [router])

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-3 mx-auto" style={{ width: 36, height: 36, border: '3px solid rgba(0,0,0,0.08)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div className="text-sm text-gray-500">Verifying admin session…</div>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg) } }
          `}</style>
        </div>
      </div>
    )
  }

  // If verification passed, show the admin home UI
  if (!isAdmin) {
    // fallback — should be redirected already but keep safe UI
    return null
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/orders" className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md">
          <div className="text-sm text-gray-500">Orders</div>
          <div className="mt-2 text-2xl font-semibold">View & manage orders</div>
        </Link>

        <Link href="/admin/products" className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md">
          <div className="text-sm text-gray-500">Products</div>
          <div className="mt-2 text-2xl font-semibold">Create / edit products</div>
        </Link>

        <Link href="/admin/sellers" className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md">
          <div className="text-sm text-gray-500">Sellers</div>
          <div className="mt-2 text-2xl font-semibold">Applications & approvals</div>
        </Link>
      </div>
    </div>
  )
}
