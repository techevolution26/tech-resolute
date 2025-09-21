// src/app/admin/products/[id]/edit/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProductForm from '@/app/admin/products/ProductForm' // adjust import path to your file
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
        const body = await res.json().catch(() => null)
        if (!res.ok) throw new Error(body?.message || res.statusText)
        if (!mounted) return
        setProduct(body)
      } catch (e) {
        console.error('Load product failed', e)
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
          // ProductForm expects initial.imageUrl (we used imageUrl earlier)
          imageUrl: product.image_url ? normalizeSrc(product.image_url) : null,
        } as any}
      />
    </div>
  )
}
