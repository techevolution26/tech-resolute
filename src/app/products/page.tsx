// src/app/products/page.tsx
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Layout from '@/components/Layout'
import ProductCard, { Product as ProductType } from '@/components/ProductCard'
import { MarketplaceBanner } from '@/components/MarketplaceBanner'
import Link from 'next/link'
import SkeletonCard from '@/components/SkeletonCard'

type ApiProduct = any

// Small inline Loader component (used as IntersectionObserver sentinel)
function Loader({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-6">
      <svg
        className="animate-spin"
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="#e5e7eb" fill="none" />
        <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" stroke="#6366f1" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function ProductsPage() {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')

  // UI state
  const [products, setProducts] = useState<ProductType[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string; slug?: string }[]>([])
  const [loading, setLoading] = useState(false) // initial load / filters
  const [loadingMore, setLoadingMore] = useState(false) // infinite scroll load more
  const [error, setError] = useState<string | null>(null)

  // filters / pagination
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState(q)
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 12

  // pagination metadata (Laravel paginator)
  const [currentPage, setCurrentPage] = useState<number | null>(null)
  const [lastPage, setLastPage] = useState<number | null>(null)
  const [total, setTotal] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(true)

  // sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // SIMPLE IN-MEM CACHE: key is queryString + page
  // value: { items: ProductType[], meta?: { current_page, last_page, total }, ts }
  const cacheRef = useRef<Map<string, { items: ProductType[]; meta?: any; ts: number }>>(new Map())

  // LOCAL STORAGE CONFIG
  const LOCAL_KEY = 'tm_products_cache_v1'
  const CACHE_TTL = 1000 * 60 * 5 // 5 minutes TTL

  // Debounce q input (updates debouncedQ after delay)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350)
    return () => clearTimeout(t)
  }, [q])

  // Fetch categories for filter dropdown
  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await fetch(`${apiBase}/v1/categories`)
          if (!mounted) return
          if (!res.ok) return
          const body = await res.json().catch(() => null)
          const list = Array.isArray(body) ? body : (body.data ?? [])
          if (mounted) setCategories(list)
        } catch (e) {
          // non-fatal
        }
      })()
    return () => { mounted = false }
  }, [apiBase])

  // Persist helpers
  const saveLocalCache = useCallback(() => {
    try {
      const obj: Record<string, any> = {}
      cacheRef.current.forEach((v, k) => {
        obj[k] = v
      })
      localStorage.setItem(LOCAL_KEY, JSON.stringify(obj))
    } catch (e) {
      // ignore storage errors
      // console.warn('saveLocalCache failed', e)
    }
  }, [])

  const loadLocalCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw || '{}') as Record<string, { items: ProductType[]; meta?: any; ts: number }>
      const now = Date.now()
      const map = new Map<string, { items: ProductType[]; meta?: any; ts: number }>()
      for (const k of Object.keys(parsed)) {
        const v = parsed[k]
        if (!v || !v.ts) continue
        if (now - v.ts > CACHE_TTL) {
          // expired — skip
          continue
        }
        map.set(k, v)
      }
      if (map.size > 0) cacheRef.current = map
    } catch (e) {
      // console.warn('loadLocalCache failed', e)
    }
  }, [])

  // Utility to set cache and persist
  const setCacheEntry = useCallback((qs: string, value: { items: ProductType[]; meta?: any }) => {
    try {
      cacheRef.current.set(qs, { ...value, ts: Date.now() })
      saveLocalCache()
    } catch (e) {
      // ignore
    }
  }, [saveLocalCache])

  // load local cache once on mount
  useEffect(() => {
    loadLocalCache()
  }, [loadLocalCache])

  // When filters (debounced) change -> reset page/list
  useEffect(() => {
    setPage(1)
    setProducts([])
    setHasMore(true)
  }, [debouncedQ, category, condition])

  // Build query string helper
  const buildQueryString = useCallback((pageNum: number) => {
    const params = new URLSearchParams()
    if (debouncedQ) params.set('q', debouncedQ)
    if (category) params.set('category', category)
    if (condition) params.set('condition', condition)
    if (pageNum) params.set('page', String(pageNum))
    if (perPage) params.set('per', String(perPage))
    return params.toString()
  }, [debouncedQ, category, condition, perPage])

  // load page from cache if available (checks TTL and removes expired)
  const readCache = useCallback((qs: string) => {
    const v = cacheRef.current.get(qs)
    if (!v) return null
    if (!v.ts) return null
    if (Date.now() - v.ts > CACHE_TTL) {
      cacheRef.current.delete(qs)
      try { saveLocalCache() } catch { }
      return null
    }
    return v
  }, [saveLocalCache])

  // Fetch products when page or filters change (uses cache with stale-while-revalidate)
  useEffect(() => {
    let mounted = true
    if (abortRef.current) {
      try { abortRef.current.abort() } catch { }
    }
    const ac = new AbortController()
    abortRef.current = ac

    async function load() {
      const qs = buildQueryString(page)
      // try cache first
      const cached = readCache(qs)
      if (cached && cached.items && cached.items.length > 0) {
        // use cached instantly (stale-while-revalidate)
        if (mounted) {
          if (page === 1) setProducts(cached.items)
          else setProducts(prev => [...prev, ...cached.items].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i))
          if (cached.meta) {
            setCurrentPage(cached.meta.current_page ?? null)
            setLastPage(cached.meta.last_page ?? null)
            setTotal(cached.meta.total ?? null)
            if (cached.meta.last_page != null) setHasMore((cached.meta.current_page ?? 1) < cached.meta.last_page)
            else setHasMore((cached.items.length ?? 0) >= perPage)
          }
        }
        // continue to revalidate in background
      } else {
        // no cache — show appropriate loader
        if (page === 1) {
          setLoading(true)
          setError(null)
        } else {
          setLoadingMore(true)
        }
      }

      try {
        const url = `${apiBase}/v1/products${qs ? `?${qs}` : ''}`
        const res = await fetch(url, { signal: ac.signal })
        if (!mounted) return
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.message || res.statusText || 'Failed to load products')
        }
        const body = await res.json().catch(() => null)
        const list = Array.isArray(body) ? body : (body.data ?? body)
        const mapped: ProductType[] = (list || []).map((p: ApiProduct) => ({
          id: p.id,
          title: p.title,
          price: typeof p.price === 'number' ? p.price.toLocaleString() : (p.price ?? ''),
          category: p?.category?.name ?? p?.category ?? '',
          image: p?.image_url ?? p?.image ?? null,
          condition: p.condition ?? null,
          slug: p.slug ?? String(p.id),
        }))

        // update cache (and persist to localStorage)
        const meta = (!Array.isArray(body) && body) ? {
          current_page: body.current_page ?? body.page ?? 1,
          last_page: body.last_page ?? null,
          total: body.total ?? null
        } : undefined

        setCacheEntry(qs, { items: mapped, meta })

        // apply results (replace for page 1, append otherwise)
        if (mounted) {
          setProducts(prev => page === 1 ? mapped : [...prev, ...mapped].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i))

          if (meta) {
            setCurrentPage(meta.current_page)
            setLastPage(meta.last_page)
            setTotal(meta.total)
            if (meta.last_page != null) setHasMore((meta.current_page ?? 1) < meta.last_page)
            else setHasMore((mapped?.length ?? 0) >= perPage)
          } else {
            setCurrentPage(null)
            setLastPage(null)
            setTotal(Array.isArray(list) ? list.length : null)
            setHasMore((mapped?.length ?? 0) >= perPage)
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        if (mounted) setError(err?.message ?? 'Failed to load products')
      } finally {
        if (mounted) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
      try { ac.abort() } catch { }
    }
  }, [apiBase, buildQueryString, page, readCache, setCacheEntry])

  // IntersectionObserver for infinite scroll (observes loader element)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    if (!hasMore) return

    const obs = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setPage(prev => {
            if (lastPage && prev >= lastPage) return prev
            return prev + 1
          })
        }
      }
    }, {
      root: null,
      rootMargin: '400px',
      threshold: 0.1
    })

    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, lastPage])

  // Load more button fallback (but replaced by skeleton loader)
  function loadMore() {
    if (loadingMore || loading) return
    if (lastPage && currentPage != null && currentPage >= lastPage) return
    setPage(prev => prev + 1)
  }

  const showingDebounceIndicator = q !== debouncedQ

  return (
    <Layout>
      <div className="mb-10">
        <nav className="text-sm text-gray-500 mb-6 flex items-center">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">Products</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Tech Mall — Products</h1>
          <p className="mt-2 text-gray-600">Browse digital and physical tech products. Want to sell on our mall? <a href="#seller-info" className="text-indigo-600 hover:underline font-medium">Become a seller</a></p>
        </header>

        <MarketplaceBanner />

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 my-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                placeholder="Search products..."
                value={q}
                onChange={(e) => { setQ(e.target.value) }}
                className="px-3 py-2 border rounded-md w-64 pr-10"
              />
              {/* debounce small spinner indicator */}
              {showingDebounceIndicator && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="#e5e7eb" fill="none" />
                    <path d="M22 12a10 10 0 00-10-10" strokeWidth="2" stroke="#6366f1" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>

            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-md">
              <option value="">All categories</option>
              {categories.map(c => <option key={c.id} value={c.slug ?? String(c.id)}>{c.name}</option>)}
            </select>

            <select value={condition} onChange={(e) => { setCondition(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-md">
              <option value="">Any condition</option>
              <option value="New">New</option>
              <option value="Refurbished">Refurbished</option>
              <option value="Digital">Digital</option>
            </select>
          </div>

          <div className="text-xs text-gray-500">{total != null ? `${total} product${total === 1 ? '' : 's'}` : 'Products'}</div>
        </div>

        {/* Products grid */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: perPage }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😢</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
              {/* While loadingMore, show a few skeletons appended to grid for UX */}
              {loadingMore && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`s-more-${i}`} />)}
            </section>

            {/* Loader sentinel & status */}
            <div className="mt-8 flex flex-col items-center gap-3">
              {!hasMore && <div className="text-sm text-gray-500">No more products</div>}

              {hasMore && (
                <>
                  {/* sentinel for IntersectionObserver (rendered as Loader component) */}
                  <div ref={sentinelRef} aria-hidden>
                    <Loader />
                  </div>

                  {/* fallback only: when IntersectionObserver fails (user can still click to load more) */}
                  {!loadingMore && (
                    <button
                      onClick={loadMore}
                      className="px-4 py-2 rounded border bg-white"
                      aria-hidden
                    >
                      Load more
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Seller information */}
        <section id="seller-info" className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-sm border border-indigo-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Become a Seller</h2>
            <p className="mt-2 text-gray-600">Join our marketplace and reach thousands of potential customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Easy Setup', description: 'Create your seller account in minutes and start listing products', icon: '⚡' },
              { title: 'Reach Customers', description: 'Access our growing customer base interested in tech products', icon: '👥' },
              { title: 'Secure Payments', description: 'Access our growing customer base interested in tech products', icon: '💳' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-gray-800 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a href="mailto:techevo404@gmail.com?subject=Interested in becoming a seller" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Apply to Sell
            </a>
          </div>
        </section>
      </div>
    </Layout>
  )
}
