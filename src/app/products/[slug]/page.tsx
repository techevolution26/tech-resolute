import React from 'react'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'

type Product = {
    id: number
    slug: string
    title: string
    price: string
    category: string
    image?: string
    condition?: string
    description?: string
}

const PRODUCTS: Product[] = [
    {
        id: 1,
        slug: 'delivery-app-template',
        title: 'Delivery App (Template)',
        price: 'KES 5,000',
        category: 'Digital — Mobile App',
        image: '/delivery.jpeg',
        condition: 'Digital',
        description: 'A ready-to-launch delivery app template built with React Native and Firebase.',
    },
    {
        id: 2,
        slug: 'church-management-template',
        title: 'Church Management Template',
        price: 'KES 3,000',
        category: 'Digital — Template',
        image: '/products/teko-crm.webp',
        condition: 'Digital',
        description: 'A lightweight CRM template for small organisations to manage members and contributions.',
    },
    {
        id: 10,
        slug: 'wifi-router-ac1200',
        title: 'AC1200 WiFi Router',
        price: 'KES 4,500',
        category: 'Hardware — Router',
        image: '/router.webp',
        condition: 'New',
        description: 'Dual-band router, easy setup, good range for small offices.',
    },
    {
        id: 20,
        slug: 'refurbished-lenovo-t460',
        title: 'Lenovo ThinkPad T460 (Refurbished)',
        price: 'KES 18,000',
        category: 'Laptops',
        image: '/Lenovo ThinkPad T460 .webp',
        condition: 'Refurbished',
        description: 'Refurbished unit, battery tested, 8GB RAM, 256GB SSD.',
    },
    {
        id: 21,
        slug: 'dell-inspiron-15',
        title: 'Dell Inspiron 15 (Refurbished)',
        price: 'KES 22,000',
        category: 'Laptops',
        image: '/products/dell-insp-15.webp',
        condition: 'Refurbished',
        description: 'Refurbished Dell laptop, 16GB RAM, 512GB SSD, good condition.',
    },
]

interface Params {
    params: { slug: string }
}

export default async function ProductDetail({ params }: Params) {
    const awaitedParams = await params;
    const product = PRODUCTS.find((p) => p.slug === awaitedParams.slug)
    if (!product) return notFound()

    // Build a safe multiline mail body, then encode it for the mailto: URL
    const mailBody = `Hello,

I am interested in buying: ${product.title}

Please advise how to proceed.
`
    const buyHref = `mailto:techevo404@gmail.com?subject=${encodeURIComponent(
        'Buy request: ' + product.title
    )}&body=${encodeURIComponent(mailBody)}`

    const waHref = `https://wa.me/254745880757?text=${encodeURIComponent(
        'Hello, I want to buy: ' + product.title
    )}`

    const getConditionColor = (condition: string) => {
        switch (condition?.toLowerCase()) {
            case 'new': return 'bg-green-100 text-green-800 border-green-200';
            case 'refurbished': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'digital': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-6 py-8">
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-6 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to products
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="flex flex-col items-center">
                        <div className="w-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.title}
                                    width={800}
                                    height={600}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="mt-2 text-sm">No image available</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4 w-full">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-700">Condition:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getConditionColor(product.condition || '')}`}>
                                    {product.condition ?? 'New'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-700">SKU:</span>
                                <span className="text-gray-600">PRD-{product.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {product.category}
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
                            <div className="text-3xl font-bold text-indigo-800">{product.price}</div>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a
                                    href={buyHref}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Buy / Request
                                </a>
                                <a
                                    href={waHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    WhatsApp
                                </a>
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
                                Local pickup or delivery arrangements via WhatsApp. For refurbished devices we offer a 7-day
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
                            <a
                                href="mailto:techevo404@gmail.com"
                                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                techevo404@gmail.com
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    )
}