// src/components/AdminProductCard.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { normalizeSrc } from '@/lib/normalizeSrc'


interface Product {
    id: number
    title: string
    price?: string
    category?: string
    condition?: string
    image_url?: string
    slug?: string
}

type Props = {
    product: Product
    onDelete?: (id: number) => void
}

// when rendering / in ProductForm initial imageUrl -> ensure absolute

export default function AdminProductCard({ product, onDelete }: Props) {
    return (
        <article className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-4 no-underline">
                <div className="w-20 h-14 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {product.image_url ? (
                        <Image
                            src={normalizeSrc(product.image_url)}
                            alt={product.title}
                            width={320}
                            height={180}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="text-xs text-gray-400 px-2">No image</div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 line-clamp-2">{product.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{product.category ?? 'Uncategorized'}</div>
                </div>
            </Link>

            <div className="flex items-center gap-3">
                <div className="text-indigo-600 font-bold whitespace-nowrap">{product.price ?? ''}</div>
                <Link href={`/admin/products/${product.id}/edit`} className="px-3 py-1 rounded-md border text-sm">
                    Edit
                </Link>
                <button
                    onClick={() => onDelete?.(product.id)}
                    className="px-3 py-1 rounded-md bg-red-50 text-red-600 text-sm"
                    aria-label={`Delete ${product.title}`}
                >
                    Delete
                </button>
            </div>
        </article>
    )
}
