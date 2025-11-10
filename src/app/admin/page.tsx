// src/app/admin/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminFetch, clearAdminToken, verifyAdmin, getAdminToken } from '@/lib/adminApi'
import {
  ShoppingBagIcon,
  CubeIcon,
  TagIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'


export default function AdminHome() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let mounted = true
    async function init() {
      setChecking(true)

      const token = getAdminToken()
      if (!token) {
        router.replace('/admin/login')
        return
      }

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
          <div className="spinner mb-4 mx-auto" style={{
            width: 48,
            height: 48,
            border: '4px solid rgba(180, 83, 9, 0.1)',
            borderTopColor: '#b45309',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div className="text-sm text-gray-600 font-medium">Verifying admin session…</div>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg) } }
          `}</style>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const dashboardCards = [
    {
      href: "/admin/orders",
      title: "Orders",
      description: "View & manage orders",
      icon: "📦",
      gradient: "from-amber-600 to-amber-700"
    },
    {
      href: "/admin/products",
      title: "Products",
      description: "Create / edit products",
      icon: "🛍️",
      gradient: "from-gray-600 to-gray-700"
    },
    {
      href: "/admin/categories",
      title: "Categories",
      description: "Manage product categories",
      icon: "📑",
      gradient: "from-rose-700 to-rose-800"
    },
    {
      href: "/admin/sellers",
      title: "Sellers",
      description: "Applications & approvals",
      icon: "👥",
      gradient: "from-amber-700 to-amber-800"
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your store operations and monitor activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-amber-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform duration-200`}>
              {card.icon}
            </div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {card.title}
            </div>
            <div className="text-lg font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-200">
              {card.description}
            </div>
            <div className="mt-4 text-xs text-amber-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Explore →
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-sm font-semibold text-amber-800">Today&apos;s Orders</div>
          </div>
          <div className="text-2xl font-bold text-amber-900">24</div>
          <div className="text-xs text-amber-600 mt-2">↑ 12% from yesterday</div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-gray-700" />
            </div>
            <div className="text-sm font-semibold text-gray-800">Pending Reviews</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">8</div>
          <div className="text-xs text-gray-600 mt-2">Requires attention</div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <UserPlusIcon className="w-5 h-5 text-rose-700" />
            </div>
            <div className="text-sm font-semibold text-rose-800">New Sellers</div>
          </div>
          <div className="text-2xl font-bold text-rose-900">3</div>
          <div className="text-xs text-rose-600 mt-2">Awaiting approval</div>
        </div>
      </div>
    </div>
  )
}