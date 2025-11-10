// src/app/admin/products/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import AdminProductCard from '@/components/AdminProductsCard'

type Product = {
  id: number
  title: string
  price: string
  category?: string
  condition?: string
  image_url?: string
}

/** Narrow API product shape we expect (but keep robust to variations) */
type RawApiProduct = Record<string, unknown>

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await adminFetch('/v1/admin/products')
        if (res.status === 401 || res.status === 403) {
          clearAdminToken()
          router.replace('/admin/login')
          return
        }

        const body = (await res.json().catch(() => null)) as unknown
        if (!res.ok) {
          const msg = (typeof body === 'object' && body !== null && 'message' in (body as Record<string, unknown>))
            ? String((body as Record<string, unknown>).message)
            : res.statusText
          throw new Error(msg)
        }

        // body may be paginated { data: [...] } or plain array
        const listRaw = Array.isArray(body) ? body : (typeof body === 'object' && body !== null ? ((body as Record<string, unknown>)['data'] ?? body) : [])

        // helper: extract image url from various shapes
        function extractImageUrl(obj: unknown): string | undefined {
          if (!obj || typeof obj !== 'object') return undefined
          const r = obj as Record<string, unknown>

          const candidate = r['image_url'] ?? r['image'] ?? r['images'] ?? r['pictures'] ?? r['photo'] ?? r['thumbnail'] ?? r['image_path'] ?? r['img']
          // direct string
          if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()

          // array of images (strings or objects)
          if (Array.isArray(candidate) && candidate.length > 0) {
            const first = candidate[0]
            if (typeof first === 'string' && first.trim()) return first.trim()
            if (typeof first === 'object' && first !== null) {
              const f = first as Record<string, unknown>
              return String(f['url'] ?? f['path'] ?? f['full_url'] ?? f['publicUrl'] ?? f['image_url'] ?? '').trim() || undefined
            }
          }

          // nested object with common keys: { url, path, full_url, publicUrl, key }
          const maybeObj = r['image'] ?? r['image_url'] ?? r['photo'] ?? r['picture']
          if (maybeObj && typeof maybeObj === 'object') {
            const m = maybeObj as Record<string, unknown>
            const val = String(m['url'] ?? m['path'] ?? m['full_url'] ?? m['publicUrl'] ?? m['key'] ?? '').trim()
            if (val) return val
          }

          // nested product / variant structure: product: { image_url }
          if (r['product'] && typeof r['product'] === 'object') {
            const p = r['product'] as Record<string, unknown>
            if (typeof p['image_url'] === 'string' && String(p['image_url']).trim()) return String(p['image_url']).trim()
            if (typeof p['image'] === 'string' && String(p['image']).trim()) return String(p['image']).trim()
          }

          return undefined
        }

        function normalize(item: unknown): Product {
          if (!item || typeof item !== 'object') {
            return { id: 0, title: '', price: '' }
          }
          const it = item as RawApiProduct
          const id = Number(it.id ?? 0)
          const title = String(it.title ?? it.name ?? '')
          const price = (typeof it.price === 'number') ? String(it.price) : String(it.price ?? '')
          let category: string | undefined = undefined
          const rawCategory = it.category
          if (rawCategory && typeof rawCategory === 'object') {
            category = String((rawCategory as Record<string, unknown>)['name'] ?? '')
          } else if (typeof rawCategory === 'string') {
            category = rawCategory
          }

          let condition: string | undefined = undefined
          const rawCondition = it.condition
          if (rawCondition && typeof rawCondition === 'object') {
            condition = String((rawCondition as Record<string, unknown>)['name'] ?? '')
          } else if (typeof rawCondition === 'string') {
            condition = rawCondition
          }

          const image_url = extractImageUrl(it)

          return { id, title, price, category, condition, image_url }
        }

        if (!mounted) return
        const arr = Array.isArray(listRaw) ? (listRaw as unknown[]).map(normalize) : []
        setProducts(arr)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [router])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/create" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create product</Link>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="text-gray-500 py-8">No products yet.</div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid gap-4">
          {products.map((p) => (
            <AdminProductCard
              key={p.id}
              product={p}
              onDelete={async (id) => {
                if (!confirm('Delete product?')) return
                try {
                  const res = await adminFetch(`/v1/admin/products/${id}`, { method: 'DELETE' })
                  if (res.status === 401 || res.status === 403) {
                    clearAdminToken()
                    router.replace('/admin/login')
                    return
                  }
                  if (!res.ok) {
                    const b = await res.json().catch(() => null)
                    throw new Error((b && typeof b === 'object' && 'message' in b) ? String((b as Record<string, unknown>).message) : res.statusText)
                  }
                  setProducts((list) => list.filter(x => x.id !== id))
                } catch (err) {
                  alert('Delete failed: ' + (err as Error).message)
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
