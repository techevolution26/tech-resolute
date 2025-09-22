// src/app/products/[slug]/page.tsx
import React from 'react'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import Link from 'next/link'
import ProductGallery from './components/ProductGallery'
import OrderPanel from './components/OrderPanel'
import { normalizeSrc } from '@/lib/normalizeSrc'

type ApiProduct = {
    id: number
    slug: string
    title: string
    price: string | number
    currency?: string
    category?: { id: number; name: string } | string | null
    condition?: string | null
    description?: string | null
    images?: { id?: number; url: string }[] | null
    image_url?: string | null
}

interface Params {
    params: { slug: string } | Promise<{ slug: string }>
}

export default async function ProductDetail({ params }: Params) {
    const slug = (await params).slug
    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')
    // server-side fetch; you can add `cache: 'no-store'` if you want fresh each request
    const res = await fetch(`${apiBase}/v1/products/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } })
    if (res.status === 404) return notFound()
    if (!res.ok) {
        // fallback to notFound to avoid exposing error detail to public page
        return notFound()
    }

    const body = await res.json().catch(() => null)
    // API may return { product, related } or a plain product; normalize:
    const product: ApiProduct = body?.product ?? body

    if (!product) return notFound()

    // Build images array — prefer `product.images` if available, else fall back to `image_url`
    const images = (product.images && Array.isArray(product.images) && product.images.length)
        ? product.images.map((it: any) => ({ id: it.id ?? undefined, url: normalizeSrc(it.url ?? it.path ?? it.full_url ?? it) }))
        : (product.image_url ? [{ url: normalizeSrc(product.image_url) }] : [])

    const priceLabel = typeof product.price === 'number' ? Number(product.price).toLocaleString() : (product.price ?? '—')
    const categoryLabel = typeof product.category === 'string' ? product.category : (product.category?.name ?? '—')

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-6 py-8">
                <Link href="/products" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-6 group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to products
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* left: gallery */}
                    <div>
                        <ProductGallery images={images} title={product.title ?? ''} />
                        <div className="mt-6 flex flex-wrap gap-4 w-full">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-700">Condition:</span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                                    {product.condition ?? '—'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-700">SKU:</span>
                                <span className="text-gray-600">PRD-{product.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* right: details + order panel */}
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {categoryLabel}
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
                            <div className="text-3xl font-bold text-indigo-800">{priceLabel}</div>

                            <div className="mt-6">
                                {/* OrderPanel is client — handles quantity, create order calls */}
                                <OrderPanel productId={product.id} productTitle={product.title ?? ''} productPrice={String(product.price ?? '')} />
                            </div>
                        </div>

                        <section className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Delivery & Returns
                            </h4>
                            <p className="text-gray-700">
                                Local pickup or delivery arrangements via WhatsApp / email. For refurbished devices we offer a 7-day
                                functionality guarantee.
                            </p>
                        </section>

                        <section className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Need Help?
                            </h4>
                            <p className="text-gray-700 mb-4">
                                Have questions about this product? Contact us for more information.
                            </p>
                            <a href="mailto:techevo404@gmail.com" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
                                techevo404@gmail.com
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
