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

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Link href="/products" className="text-indigo-600">
                    ← Back to products
                </Link>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <h1 className="text-2xl font-bold">{product.title}</h1>
                        <p className="mt-2 text-gray-600">{product.description}</p>
                        <div className="mt-4 text-sm text-gray-500">
                            Category:{' '}
                            <span className="font-semibold text-gray-800">{product.category}</span>
                        </div>
                        <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm">
                            <div className="text-3xl font-bold">{product.price}</div>
                            <div className="mt-4 flex gap-3">
                                <a href={buyHref} className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white">
                                    Buy / Request
                                </a>
                                <a href={waHref} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 rounded-lg bg-green-600 text-white">
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        {product.image ? (
                            <div className="w-full max-w-sm bg-gray-100 rounded-lg overflow-hidden">
                                <Image src={product.image} alt={product.title} width={800} height={600} className="object-cover w-full h-full" />
                            </div>
                        ) : (
                            <div className="w-full max-w-sm bg-gray-100 rounded-lg h-64 flex items-center justify-center">No image</div>
                        )}

                        <div className="mt-4 text-sm text-gray-600">Condition: {product.condition ?? 'New'}</div>
                        <div className="mt-2 text-sm text-gray-600">SKU: PRD-{product.id}</div>
                    </div>
                </div>

                <section className="mt-8 text-sm text-gray-600">
                    <h4 className="font-semibold">Delivery & Returns</h4>
                    <p className="mt-2">
                        Local pickup or delivery arrangements via WhatsApp. For refurbished devices we offer a 7-day
                        functionality guarantee.
                    </p>
                </section>
            </div>
        </Layout>
    )
}
