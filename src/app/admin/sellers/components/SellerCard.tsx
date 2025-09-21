'use client'
import React, { useMemo, useState } from 'react'
import type { Application, Item } from '../types'
import ViewAttachmentsModal from './ViewAttachmentModal'

type Props = {
    app: Application
    onReview: (id: number) => void
}

/**
 * Resolve a storage URL returned by API:
 * - if already absolute return as-is (normalize /api/storage -> /storage)
 * - if relative prefix with storage base derived from envs
 */
function resolveStorageUrl(raw?: string | null): string | null {
    if (!raw) return null
    const s = String(raw).trim()
    if (!s) return null

    if (/^https?:\/\//i.test(s) || /^\/\//.test(s)) {
        const abs = s.startsWith('//') ? 'http:' + s : s
        return abs.replace(/\/api\/storage/gi, '/storage')
    }

    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')
    const storageEnv = (process.env.NEXT_PUBLIC_STORAGE_URL ?? '').replace(/\/$/, '')
    const storageBase = storageEnv || apiBase.replace(/\/api\/?$/i, '')

    const path = s.startsWith('/') ? s : `/${s.replace(/^\/+/, '')}`
    const candidate = `${storageBase}${path}`.replace(/\/api\/storage/gi, '/storage')

    // avoid duplicated protocol fragments
    const httpMatches = candidate.match(/https?:\/\//ig)
    if (httpMatches && httpMatches.length > 1) {
        const lastIdx = candidate.lastIndexOf('http')
        return candidate.slice(lastIdx)
    }

    return candidate
}

export default function SellerCard({ app, onReview }: Props) {
    const [openImages, setOpenImages] = useState<string[] | null>(null)
    const [startIndex, setStartIndex] = useState(0)

    const isOneTime = app.application_type === 'one_time'
    const title = app.business_name || (isOneTime ? 'One-time seller' : 'Seller')

    // memoize items images resolution
    const itemsWithImages = useMemo(() => {
        return (app.items ?? []).map((it: Item) => {
            const collected: string[] = []
            // prefer explicit array
            if (Array.isArray(it.image_urls) && it.image_urls.length) {
                for (const u of it.image_urls) {
                    const r = resolveStorageUrl(u)
                    if (r) collected.push(r)
                }
            }
            // fallback single fields
            const single = it.image_url ?? it.image ?? null
            if (single) {
                const r = resolveStorageUrl(single)
                if (r && !collected.includes(r)) collected.push(r)
            }
            return { item: it, images: collected }
        })
    }, [app.items])

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold">{title}</div>
                        {app.status === 'approved' ? (
                            <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">Approved</div>
                        ) : (
                            <div className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-800 text-xs">Pending</div>
                        )}
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                        {app.contact_name ? `${app.contact_name} • ` : ''}
                        {app.email ?? app.phone ?? '—'}
                    </div>

                    <div className="text-xs text-gray-400 mt-1">
                        Applied: {app.created_at ? new Date(app.created_at).toLocaleString() : '—'}
                    </div>

                    {app.website && (
                        <div className="text-xs text-gray-500 mt-2">
                            Website: <a className="text-indigo-600" href={app.website} target="_blank" rel="noreferrer">{app.website}</a>
                        </div>
                    )}

                    {app.message && <div className="mt-2 text-sm text-gray-700">{app.message}</div>}

                    {isOneTime && itemsWithImages.length > 0 && (
                        <div className="mt-3">
                            <div className="text-sm font-medium mb-2">Items (one-time)</div>
                            <div className="grid gap-3">
                                {itemsWithImages.map(({ item: it, images }, i) => {
                                    const first = images[0] ?? null
                                    return (
                                        <div key={i} className="flex gap-3 items-start p-2 rounded border">
                                            <div className="w-20 h-16 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                                                {first ? (
                                                    // admin uses plain img to avoid next/image remote config
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={first}
                                                        alt={it.title ?? `item-${i + 1}`}
                                                        className="w-full h-full object-cover cursor-pointer"
                                                        onClick={() => { setStartIndex(0); setOpenImages(images) }}
                                                    />
                                                ) : (
                                                    <div className="text-xs text-gray-400">No image</div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{it.title || 'Untitled item'}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {it.condition && <span>{it.condition}</span>}
                                                    {it.quantity != null && <span> • Qty: {it.quantity}</span>}
                                                    {it.estimated_price && <span> • Est: {it.estimated_price}</span>}
                                                </div>
                                                {it.description && <div className="text-xs text-gray-700 mt-1">{it.description}</div>}

                                                {images.length > 1 && (
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={() => { setStartIndex(0); setOpenImages(images) }}
                                                            className="px-3 py-1 text-xs rounded bg-indigo-50 text-indigo-700"
                                                        >
                                                            View attachments ({images.length})
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div>
                        {app.status === 'approved' ? (
                            <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">Approved</div>
                        ) : (
                            <button
                                onClick={() => onReview(app.id)}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
                            >
                                Review & Approve
                            </button>
                        )}
                    </div>

                    <div className="text-xs text-gray-400">{app.status ?? '—'}</div>
                </div>
            </div>

            {openImages && (
                <ViewAttachmentsModal
                    images={openImages}
                    startIndex={startIndex}
                    onClose={() => setOpenImages(null)}
                />
            )}
        </div>
    )
}
