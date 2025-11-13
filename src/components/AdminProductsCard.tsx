'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { normalizeSrc } from '@/lib/normalizeSrc'
import {
    PencilIcon,
    TrashIcon,
    PhotoIcon,
    CheckBadgeIcon,
    ClockIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline'

interface Product {
    id: number
    title: string
    price?: string
    category?: string
    condition?: string
    image_url?: string | null
    slug?: string
    stock?: number
    status?: 'active' | 'draft' | 'archived' | string
    created_at?: string
}

type Props = {
    product: Product
    onDelete?: (id: number) => void
    viewMode?: 'grid' | 'list'
}

function isAbsoluteUrl(u?: string | null) {
    if (!u) return false
    return /^https?:\/\//i.test(String(u))
}

/** Render image consistently and with stable return type (ReactNode) */
function RenderProductImage({
    src,
    alt,
    width,
    height,
    imgClassName,
    wrapperFallback
}: {
    src?: string | null
    alt?: string
    width: number
    height: number
    imgClassName?: string
    wrapperFallback?: React.ReactNode
}): React.ReactNode {
    if (!src) return wrapperFallback ?? null

    const n = normalizeSrc(src)

    if (isAbsoluteUrl(n)) {
        // remote absolute url -> let browser fetch directly
        // eslint-disable-next-line @next/next/no-img-element
        return (
            <img
                src={n}
                alt={alt ?? ''}
                width={width}
                height={height}
                className={imgClassName}
            />
        )
    }

    // local/path -> Next Image for optimization
    return (
        <Image
            src={n}
            alt={alt ?? ''}
            width={width}
            height={height}
            className={imgClassName}
        />
    )
}

export default function AdminProductCard({ product, onDelete, viewMode = 'grid' }: Props) {
    const statusConfig = {
        active: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckBadgeIcon, label: 'Active' },
        draft: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: ClockIcon, label: 'Draft' },
        archived: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: ArchiveBoxIcon, label: 'Archived' }
    }

    // Safe status resolution with fallback
    const getStatusConfig = (status: string | undefined) => {
        if (status && status in statusConfig) {
            return statusConfig[status as keyof typeof statusConfig];
        }
        return statusConfig.active; // Default fallback
    }

    const status = getStatusConfig(product.status);
    const StatusIcon = status.icon;

    const noImageFallback = (
        <div className="flex flex-col items-center text-amber-400">
            <PhotoIcon className="w-6 h-6" />
            <div className="text-xs text-amber-500 mt-1">No image</div>
        </div>
    )

    if (viewMode === 'list') {
        return (
            <article className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-amber-300">
                <div className="flex items-center gap-6">
                    {/* Product Image */}
                    <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="flex-shrink-0 relative no-underline"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl overflow-hidden flex items-center justify-center border border-amber-200 group-hover:border-amber-300 transition-colors duration-200">
                            {RenderProductImage({
                                src: product.image_url ?? null,
                                alt: product.title,
                                width: 80,
                                height: 80,
                                imgClassName: 'object-cover w-full h-full',
                                wrapperFallback: noImageFallback
                            })}
                        </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="no-underline group-hover:text-amber-700 transition-colors duration-200"
                            >
                                <div className="text-lg font-semibold text-gray-800 line-clamp-1 group-hover:text-amber-700">
                                    {product.title}
                                </div>
                            </Link>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                            <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                {product.category ?? 'Uncategorized'}
                            </div>
                            {product.condition && (
                                <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                    {product.condition}
                                </div>
                            )}
                            {product.stock !== undefined && (
                                <div className={`text-xs font-medium px-2 py-1 rounded-lg border ${(product.stock ?? 0) > 0
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}>
                                    Stock: {product.stock}
                                </div>
                            )}
                        </div>

                        {product.created_at && (
                            <div className="text-xs text-gray-500">
                                Created: {new Date(product.created_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-xl font-bold text-amber-700 whitespace-nowrap">
                                {product.price ? `KES ${product.price}` : 'No price'}
                            </div>
                        </div>

                        <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 font-medium hover:from-amber-100 hover:to-amber-200 border border-amber-300 transition-all duration-200 group/edit"
                        >
                            <PencilIcon className="w-4 h-4 group-hover/edit:scale-110 transition-transform duration-200" />
                            Edit
                        </Link>

                        <button
                            onClick={() => onDelete?.(product.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 font-medium hover:from-rose-100 hover:to-rose-200 border border-rose-300 transition-all duration-200 group/delete"
                            aria-label={`Delete ${product.title}`}
                        >
                            <TrashIcon className="w-4 h-4 group-hover/delete:scale-110 transition-transform duration-200" />
                            Delete
                        </button>
                    </div>
                </div>
            </article>
        )
    }

    // Grid View (default)
    return (
        <article className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-amber-300">
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-4">
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                </div>
                {product.stock !== undefined && (
                    <div className={`text-xs font-medium px-2 py-1 rounded-lg ${(product.stock ?? 0) > 0 ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                        {product.stock} in stock
                    </div>
                )}
            </div>

            {/* Product Image */}
            <Link
                href={`/admin/products/${product.id}/edit`}
                className="block mb-4 relative no-underline"
            >
                <div className="w-full h-48 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl overflow-hidden flex items-center justify-center border border-amber-200 group-hover:border-amber-300 transition-colors duration-200">
                    {RenderProductImage({
                        src: product.image_url ?? null,
                        alt: product.title,
                        width: 200,
                        height: 200,
                        imgClassName: 'object-cover w-full h-full',
                        wrapperFallback: (
                            <div className="flex flex-col items-center text-amber-400">
                                <PhotoIcon className="w-12 h-12" />
                                <div className="text-sm text-amber-500 mt-2">No image</div>
                            </div>
                        )
                    })}
                </div>
            </Link>

            {/* Product Info */}
            <div className="space-y-3">
                <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="no-underline group-hover:text-amber-700 transition-colors duration-200"
                >
                    <div className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-amber-700 mb-2">
                        {product.title}
                    </div>
                </Link>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {product.category ?? 'Uncategorized'}
                    </div>
                    {product.condition && (
                        <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                            {product.condition}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-amber-700">
                        {product.price ? `KES ${product.price}` : 'No price'}
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 hover:from-amber-100 hover:to-amber-200 border border-amber-200 hover:border-amber-300 transition-all duration-200 group/edit"
                        >
                            <PencilIcon className="w-4 h-4 group-hover/edit:scale-110 transition-transform duration-200" />
                        </Link>

                        <button
                            onClick={() => onDelete?.(product.id)}
                            className="p-2 rounded-lg bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 hover:from-rose-100 hover:to-rose-200 border border-rose-200 hover:border-rose-300 transition-all duration-200 group/delete"
                            aria-label={`Delete ${product.title}`}
                        >
                            <TrashIcon className="w-4 h-4 group-hover/delete:scale-110 transition-transform duration-200" />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    )
}
