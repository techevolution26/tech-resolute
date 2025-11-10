// src/app/admin/layout.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import { setAdminToken, getAdminToken } from '@/lib/adminApi'
import { useRouter, usePathname } from 'next/navigation'
import { clearAdminToken } from '@/lib/adminApi'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const logout = () => {
    clearAdminToken()
    router.push('/admin/login')
  }

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 flex items-center justify-center font-bold shadow-lg border border-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">Tech Resolute</div>
              <div className="text-sm text-gray-600 font-medium">Admin Dashboard</div>
            </div>
          </div>

          <nav className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-gray-300">
            <Link
              href="/admin"
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive('/admin')
                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm'
                : 'text-gray-700 hover:bg-amber-100 hover:text-amber-800'
                }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/orders"
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive('/admin/orders')
                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm'
                : 'text-gray-700 hover:bg-amber-100 hover:text-amber-800'
                }`}
            >
              Orders
            </Link>
            <Link
              href="/admin/products"
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive('/admin/products')
                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm'
                : 'text-gray-700 hover:bg-amber-100 hover:text-amber-800'
                }`}
            >
              Products
            </Link>
            <Link
              href="/admin/sellers"
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive('/admin/sellers')
                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm'
                : 'text-gray-700 hover:bg-amber-100 hover:text-amber-800'
                }`}
            >
              Sellers
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-rose-700 to-rose-800 text-white font-medium hover:from-rose-800 hover:to-rose-900 transition-all duration-200 shadow-sm"
            >
              Log out
            </button>
          </nav>
        </header>

        <main className="mt-8">{children}</main>
      </div>
    </div>
  )
}