'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProductForm from '@/app/admin/products/ProductForm'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import { normalizeSrc } from '@/lib/normalizeSrc'

type Product = {
  id: number
  title: string
  slug?: string
  description?: string
  price: string
  currency?: string
  condition?: string
  category_id?: string | null
  stock?: number
  image_url?: string | null
}

export default function AdminEditProduct() {
  const params = useParams()
  const id = Number(params?.id ?? NaN)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setLoading(false)
      return
    }
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await adminFetch(`/v1/admin/products/${id}`)
        if (res.status === 401 || res.status === 403) {
          clearAdminToken()
          window.location.href = '/admin/login'
          return
        }
        const body = await res.json().catch(() => null) as unknown
        if (!res.ok) {
          const msg = (typeof body === 'object' && body !== null && 'message' in (body as Record<string, unknown>)) ? String((body as Record<string, unknown>)['message']) : res.statusText
          throw new Error(msg)
        }
        if (!mounted) return

        // try to coerce body into Product shape (best-effort)
        if (typeof body === 'object' && body !== null) {
          const b = body as Record<string, unknown>
          const p: Product = {
            id: Number(b['id']),
            title: String(b['title'] ?? ''),
            slug: b['slug'] ? String(b['slug']) : undefined,
            description: b['description'] ? String(b['description']) : undefined,
            price: String(b['price'] ?? ''),
            currency: b['currency'] ? String(b['currency']) : undefined,
            condition: b['condition'] ? String(b['condition']) : undefined,
            category_id: b['category_id'] != null ? String(b['category_id']) : null,
            stock: b['stock'] != null ? Number(b['stock']) : undefined,
            image_url: b['image_url'] != null ? String(b['image_url']) : null,
          }
          setProduct(p)
        } else {
          setProduct(null)
        }
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error('Load product failed', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div>Loading…</div>
  if (!product) return <div className="text-red-600">Product not found</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit product</h1>
      </div>

      <ProductForm
        productId={id}
        initial={{
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: product.price,
          currency: product.currency,
          condition: product.condition,
          category_id: String(product.category_id ?? ''),
          stock: String(product.stock ?? 0),
          imageUrl: product.image_url ? normalizeSrc(product.image_url) : undefined,
        }}
      />
    </div>
  )
}
