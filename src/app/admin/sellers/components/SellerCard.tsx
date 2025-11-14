'use client'
import React, { useMemo, useState } from 'react'
import type { Application, Item } from '../types'
import ViewAttachmentsModal from './ViewAttachmentModal'
import {
    BuildingStorefrontIcon,
    CubeIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    GlobeAltIcon,
    CalendarIcon,
    EyeIcon,
    CheckBadgeIcon,
    ClockIcon
} from '@heroicons/react/24/outline'

type Props = {
    app: Application
    onReview: (id: number) => void
}

/**
 * Resolve a storage URL returned by API:
 * - if already absolute return as-is (normalize /api/storage -> /storage)
 * - if relative prefix with storage base derived from envs
 *
 * Client-aware: prefers current page protocol (avoids mixed-content http on https pages).
 * Returns an encoded absolute URL string or null.
 */
/**
 * Resolve a storage URL returned by API:
 * - if already absolute return normalized (and avoid mixed-content)
 * - if absolute points to localhost, rewrite to NEXT_PUBLIC_STORAGE_URL origin
 * - if relative, prefix with storage base derived from envs
 */
function resolveStorageUrl(raw?: string | null): string | null {
  if (!raw) return null
  const s = String(raw).trim()
  if (!s) return null

  const isClient = typeof window !== 'undefined'
  const pageProtocol = isClient ? window.location.protocol : 'https:'

  // protocol-relative //host/path -> prefix with page protocol
  if (/^\/\//.test(s)) {
    const abs = `${pageProtocol}${s}`
    return abs.replace(/\/api\/storage/gi, '/storage')
  }

  // if absolute URL, normalize and possibly rewrite localhost -> configured storage origin
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s.replace(/\/api\/storage/gi, '/storage'))
      // if page is https and url is http => try upgrade to https
      if (isClient && pageProtocol === 'https:' && u.protocol === 'http:') {
        u.protocol = 'https:'
      }

      // rewrite local dev hosts to storage env origin (so Vercel/clients don't call localhost)
      const localHosts = ['localhost', '127.0.0.1', '::1']
      if (localHosts.includes(u.hostname)) {
        const storageEnv = (process.env.NEXT_PUBLIC_STORAGE_URL ?? '').replace(/\/+$/, '')
        const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/+$/, '')
        const storageBase = storageEnv || apiBase.replace(/\/api$/i, '')
        try {
          const storageOrigin = new URL(storageBase).origin
          return storageOrigin + u.pathname + u.search + u.hash
        } catch {
          // if storageBase invalid, fall back to the original (but normalized)
        }
      }

      return u.toString()
    } catch {
      // fallthrough to treat as relative
    }
  }

  // treat as relative path -> prefix with storage base
  const storageEnv = (process.env.NEXT_PUBLIC_STORAGE_URL ?? '').replace(/\/+$/, '')
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/+$/, '')
  const storageBase = storageEnv || apiBase.replace(/\/api$/i, '')

  const path = s.startsWith('/') ? s : `/${s.replace(/^\/+/, '')}`
  let candidate = `${storageBase}${path}`.replace(/\/api\/storage/gi, '/storage')

  // collapse accidental duplicated host fragments
  const httpMatches = candidate.match(/https?:\/\//ig)
  if (httpMatches && httpMatches.length > 1) {
    const lastIdx = candidate.lastIndexOf('http')
    candidate = candidate.slice(lastIdx)
  }

  // if page is https, try to upgrade candidate's protocol to https to avoid mixed content
  try {
    const parsed = new URL(candidate)
    if (isClient && pageProtocol === 'https:' && parsed.protocol === 'http:') {
      parsed.protocol = 'https:'
      candidate = parsed.toString()
    }
  } catch {
    /* ignore */
  }

  try { return encodeURI(candidate) } catch { return candidate }
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

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateString
        }
    }

    return (
        <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 hover:border-amber-300 transition-all duration-300">
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOneTime
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-amber-100 text-amber-600'
                                }`}>
                                {isOneTime ? (
                                    <CubeIcon className="w-6 h-6" />
                                ) : (
                                    <BuildingStorefrontIcon className="w-6 h-6" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xl font-bold text-gray-900">{title}</div>
                                    {app.status === 'approved' ? (
                                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 text-sm font-medium">
                                            <CheckBadgeIcon className="w-4 h-4" />
                                            Approved
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-sm font-medium">
                                            <ClockIcon className="w-4 h-4" />
                                            Pending Review
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    {app.contact_name && (
                                        <div className="flex items-center gap-1">
                                            <UserIcon className="w-4 h-4" />
                                            {app.contact_name}
                                        </div>
                                    )}
                                    {app.email && (
                                        <div className="flex items-center gap-1">
                                            <EnvelopeIcon className="w-4 h-4" />
                                            {app.email}
                                        </div>
                                    )}
                                    {app.phone && (
                                        <div className="flex items-center gap-1">
                                            <PhoneIcon className="w-4 h-4" />
                                            {app.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {app.website && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                                <a
                                    href={app.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-amber-600 hover:text-amber-700 font-medium"
                                >
                                    {app.website}
                                </a>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            Applied: {formatDate(app.created_at)}
                        </div>
                    </div>

                    {/* Message */}
                    {app.message && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Applicant Message</div>
                            <div className="text-gray-600 text-sm">{app.message}</div>
                        </div>
                    )}

                    {/* Items for One-Time Sellers */}
                    {isOneTime && itemsWithImages.length > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                                <CubeIcon className="w-5 h-5 text-amber-600" />
                                Items for Sale ({itemsWithImages.length})
                            </div>
                            <div className="grid gap-4">
                                {itemsWithImages.map(({ item: it, images }, i) => {
                                    const first = images[0] ?? null
                                    return (
                                        <div key={i} className="flex gap-4 items-start p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                            {/* Item Image */}
                                            <div className="w-24 h-20 bg-white rounded-xl border border-gray-300 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                {first ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={first}
                                                        alt={it.title ?? `item-${i + 1}`}
                                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                                        onClick={() => { setStartIndex(0); setOpenImages(images) }}
                                                        onError={(e) => {
                                                            // hide broken image and keep "No image" fallback visible
                                                            try { (e.currentTarget as HTMLImageElement).style.display = 'none' } catch { }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="text-xs text-gray-400 text-center px-2">No image</div>
                                                )}
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 text-sm mb-2">
                                                    {it.title || 'Untitled item'}
                                                </div>

                                                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-2">
                                                    {it.condition && (
                                                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 font-medium">
                                                            {it.condition}
                                                        </span>
                                                    )}
                                                    {it.quantity != null && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                                                            Qty: {it.quantity}
                                                        </span>
                                                    )}
                                                    {it.estimated_price && (
                                                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium">
                                                            Est: {it.estimated_price}
                                                        </span>
                                                    )}
                                                </div>

                                                {it.description && (
                                                    <div className="text-sm text-gray-700 mb-3">
                                                        {it.description}
                                                    </div>
                                                )}

                                                {/* Image Gallery */}
                                                {images.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        {images.length > 1 && (
                                                            <button
                                                                onClick={() => { setStartIndex(0); setOpenImages(images) }}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 font-medium hover:from-amber-100 hover:to-amber-200 border border-amber-300 transition-all duration-200 text-xs"
                                                            >
                                                                <EyeIcon className="w-3 h-3" />
                                                                View {images.length} {images.length === 1 ? 'image' : 'images'}
                                                            </button>
                                                        )}
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

                {/* Action Buttons */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    {app.status === 'approved' ? (
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                                <CheckBadgeIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="text-sm font-semibold text-green-700">Approved</div>
                        </div>
                    ) : (
                        <button
                            onClick={() => onReview(app.id)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-sm"
                        >
                            <CheckBadgeIcon className="w-5 h-5" />
                            Review & Approve
                        </button>
                    )}
                </div>
            </div>

            {/* Image Modal */}
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
