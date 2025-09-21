// src/app/admin/layout.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import { setAdminToken, getAdminToken } from '@/lib/adminApi'
import { useRouter } from 'next/navigation'
import { clearAdminToken } from '@/lib/adminApi'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const logout = () => {
    clearAdminToken()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">TR</div>
            <div>
              <div className="text-lg font-semibold">Tech Resolute — Admin</div>
              <div className="text-xs text-gray-500">Manage products, orders & sellers</div>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Link href="/admin" className="px-3 py-2 rounded-md hover:bg-indigo-50">Dashboard</Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded-md hover:bg-indigo-50">Orders</Link>
            <Link href="/admin/products" className="px-3 py-2 rounded-md hover:bg-indigo-50">Products</Link>
            <Link href="/admin/sellers" className="px-3 py-2 rounded-md hover:bg-indigo-50">Sellers</Link>
            <button onClick={logout} className="px-3 py-2 rounded-md bg-red-50 text-red-600">Log out</button>
          </nav>
        </header>

        <main className="mt-8">{children}</main>
      </div>
    </div>
  )
}
