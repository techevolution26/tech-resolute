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
}

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
        // adminFetch prefixes with NEXT_PUBLIC_API_URL
        const res = await adminFetch('/v1/admin/products')
        if (res.status === 401 || res.status === 403) {
          // token invalid or not admin => clear & redirect to login
          clearAdminToken()
          router.replace('/admin/login')
          return
        }
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.message || res.statusText)
        }
        const body = await res.json()
        // if API returns paginated {data: [...]}
        const list = body.data ?? body
        if (!mounted) return
        setProducts(list)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [router])

  async function handleDelete(id: number) {
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
        throw new Error(b?.message || res.statusText)
      }
      setProducts((p) => p.filter((x) => x.id !== id))
    } catch (err) {
      alert('Delete failed: ' + (err as Error).message)
    }
  }

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
                    throw new Error(b?.message || res.statusText)
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
