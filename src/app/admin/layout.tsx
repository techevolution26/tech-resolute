// src/app/admin/layout.tsx
'use client'
import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { getAdminToken, clearAdminToken, adminFetch } from '@/lib/adminApi'
import { useRouter, usePathname } from 'next/navigation'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

function useViewport(): Breakpoint {
  const getBp = (w: number) => {
    if (w < 640) return 'xs'
    if (w < 768) return 'sm'
    if (w < 1024) return 'md'
    if (w < 1280) return 'lg'
    return 'xl'
  }

  const [bp, setBp] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'md'
    return getBp(window.innerWidth)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setBp(getBp(window.innerWidth)))
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return bp
}

/** Try to decode JWT payload in browser; return parsed payload or null. */
function tryDecodeJwt(token?: string | null) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((payload.length + 3) % 4)
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const bp = useViewport()

  // null = not yet checked, boolean afterwards
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)

  // Mobile menu toggle for small screens (xs/sm)
  const [mobileOpen, setMobileOpen] = useState(false)

  const checkLogin = useCallback(() => {
    try {
      const token = getAdminToken()
      const has = !!token
      setIsLoggedIn(has)

      if (has) {
        const payload = tryDecodeJwt(token)
        if (payload) {
          if (typeof payload.email === 'string') setEmail(payload.email)
          if (typeof payload.name === 'string') setName(payload.name)
        } else {
          // will fetch from server later
          setEmail(null)
          setName(null)
        }
      } else {
        setEmail(null)
        setName(null)
      }
    } catch {
      setIsLoggedIn(false)
      setEmail(null)
      setName(null)
    }
  }, [])

  useEffect(() => {
    // initial check
    checkLogin()

    const onStorage = (_e: StorageEvent) => {
      // If your token key is custom, you can check e.key === 'ADMIN_TOKEN'
      checkLogin()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [checkLogin])

  // re-check on route changes (login redirect, etc.) and close mobile menu
  useEffect(() => {
    checkLogin()
    setMobileOpen(false)
  }, [pathname, checkLogin])

  // If logged in but name/email are not available from token payload, fetch /v1/admin/me
  useEffect(() => {
    if (!isLoggedIn) return
    if (name && email) return // already have both

    let mounted = true
    const ac = new AbortController()

    async function loadProfile() {
      try {
        const res = await adminFetch('/v1/admin/me', { signal: ac.signal })
        if (!mounted) return
        if (!res.ok) {
          // if unauthorized -> clear token + redirect
          if (res.status === 401 || res.status === 403) {
            clearAdminToken()
            setIsLoggedIn(false)
            setEmail(null)
            setName(null)
            router.replace('/admin/login')
            return
          }
          return
        }
        const data = await res.json().catch(() => null)
        if (!mounted) return
        if (data) {
          if (typeof data.email === 'string') setEmail(data.email)
          if (typeof data.name === 'string') setName(data.name)
        }
      } catch {
        // aborted or network failure — ignore
      }
    }

    loadProfile()

    return () => {
      mounted = false
      ac.abort()
    }
  }, [isLoggedIn, name, email, router])

  const logout = () => {
    clearAdminToken()
    setIsLoggedIn(false)
    setEmail(null)
    setName(null)
    setMobileOpen(false)
    router.push('/admin/login')
  }

  // Helper: link active detection
  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin'
    return pathname.startsWith(path)
  }

  // Header brand subtitle: Name before email when available
  const subtitle = (() => {
    if (!isLoggedIn) return 'Admin Dashboard'
    if (name && email) return `${name} — ${email}`
    if (name) return name
    if (email) return email
    return 'Admin Dashboard'
  })()

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
              <div className="text-sm text-gray-600 font-medium">{subtitle}</div>
            </div>
          </div>

          {/* NAV: render only when we've checked and the user is logged in */}
          {isLoggedIn && (
            <>
              {bp === 'xs' || bp === 'sm' ? (
                // Mobile: hamburger button + dropdown panel
                <div className="relative">
                  <button
                    aria-label="Open menu"
                    aria-expanded={mobileOpen}
                    onClick={() => setMobileOpen(v => !v)}
                    className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border border-gray-300"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                  </button>

                  {/* mobile menu panel */}
                  {mobileOpen && (
                    <div
                      role="menu"
                      aria-label="Mobile navigation"
                      className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-gray-200 z-50"
                      style={{ minWidth: 200 }}
                    >
                      <nav className="flex flex-col gap-2">
                        <Link href="/admin" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg ${isActive('/admin') ? 'bg-amber-100 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                          Dashboard
                        </Link>
                        <Link href="/admin/orders" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg ${isActive('/admin/orders') ? 'bg-amber-100 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                          Orders
                        </Link>
                        <Link href="/admin/products" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg ${isActive('/admin/products') ? 'bg-amber-100 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                          Products
                        </Link>
                        <Link href="/admin/sellers" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg ${isActive('/admin/sellers') ? 'bg-amber-100 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                          Sellers
                        </Link>
                        <button onClick={() => { setMobileOpen(false); logout() }} className="mt-2 px-3 py-2 rounded-lg bg-gradient-to-br from-rose-700 to-rose-800 text-white font-medium">
                          Log out
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              ) : (
                // Desktop/tablet: full inline nav
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
              )}
            </>
          )}
        </header>

        <main className="mt-8">{children}</main>
      </div>
    </div>
  )
}
