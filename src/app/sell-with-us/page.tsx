'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { normalizeSrc } from '../../lib/normalizeSrc'
import {
    BuildingStorefrontIcon,
    CubeIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    GlobeAltIcon,
    PhotoIcon,
    TrashIcon,
    PlusIcon,
    DocumentTextIcon,
    CheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

type ItemRow = {
    id: string
    title: string
    condition?: string
    quantity?: number
    estimated_price?: string
    description?: string
    image?: string // absolute public URL from upload or blob URL
}

type FormState = {
    application_type: 'business' | 'one_time'
    business_name?: string
    contact_name?: string
    email?: string
    phone?: string
    website?: string
    country?: string
    message?: string
    logo?: string
    items: ItemRow[]
}

const makeEmptyItem = (): ItemRow => ({
    id: Math.random().toString(36).slice(2, 9),
    title: '',
    condition: 'Used',
    quantity: 1,
    estimated_price: '',
    description: '',
    image: ''
})

/** Payload shapes we send to the API */
type OneTimeItemPayload = {
    title: string
    condition?: string
    quantity: number
    estimated_price?: string
    description?: string
    image_url?: string | null
}

type SellerApplicationPayload = {
    application_type: 'business' | 'one_time'
    business_name?: string | undefined
    contact_name?: string | undefined
    email?: string | undefined
    phone?: string | undefined
    website?: string | undefined
    country?: string | undefined
    message?: string | undefined
    logo_url?: string | undefined
    items?: OneTimeItemPayload[] | undefined
}

export default function SellWithUsPage() {
    const [form, setForm] = useState<FormState>({
        application_type: 'business',
        business_name: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        country: '',
        message: '',
        logo: '',
        items: [makeEmptyItem()]
    })

    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const [success, setSuccess] = useState<string | null>(null)

    // IMPORTANT: set sensible envs:
    // NEXT_PUBLIC_API_URL => e.g. http://127.0.0.1:8000/api
    // NEXT_PUBLIC_STORAGE_URL => e.g. http://127.0.0.1:8000  (no /api)
    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')
    const storageBaseCandidate = (process.env.NEXT_PUBLIC_STORAGE_URL ?? '').replace(/\/$/, '')
    const storageBase = storageBaseCandidate || apiBase.replace(/\/api\/?$/i, '')

    // --- helper: client-side image resize to a blob ---
    async function resizeImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new window.Image()
            const url = URL.createObjectURL(file)

            img.onload = () => {
                try {
                    const { width, height } = img
                    const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
                    const w = Math.round(width * ratio)
                    const h = Math.round(height * ratio)

                    const canvas = document.createElement('canvas')
                    canvas.width = w
                    canvas.height = h
                    const ctx = canvas.getContext('2d')
                    if (!ctx) {
                        URL.revokeObjectURL(url)
                        reject(new Error('Canvas not supported'))
                        return
                    }
                    ctx.drawImage(img, 0, 0, w, h)

                    const ext = file.type.split('/')[1] || 'jpeg'
                    const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
                    canvas.toBlob(
                        (blob) => {
                            URL.revokeObjectURL(url)
                            if (!blob) return reject(new Error('Failed to create blob'))
                            resolve(blob)
                        },
                        mime,
                        quality
                    )
                } catch {
                    URL.revokeObjectURL(url)
                    reject(new Error('Resize failed'))
                }
            }

            img.onerror = () => {
                URL.revokeObjectURL(url)
                reject(new Error('Failed to load image for resizing'))
            }

            img.src = url
        })
    }

    // --- helper: upload with progress (xhr) ---
    // NOTE: POST goes to apiBase; we return a validated absolute storage URL (or empty string)
    async function uploadFileWithProgress(file: File, key: string): Promise<string> {
        setUploadProgress(prev => ({ ...prev, [key]: 0 }))
        try {
            let uploadBlob: File | Blob = file
            try {
                const resized = await resizeImage(file, 1200, 1200, 0.8)
                if (resized instanceof Blob) uploadBlob = resized
            } catch {
                // ignore resize failures, use original file
            }

            const fd = new FormData()
            const filename = file.name || `${key}.jpg`
            fd.append('file', uploadBlob, filename)

            return await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('POST', `${apiBase}/v1/uploads`)
                xhr.responseType = 'json'

                xhr.upload.onprogress = (ev) => {
                    if (!ev.lengthComputable) return
                    const pct = Math.round((ev.loaded / ev.total) * 100)
                    setUploadProgress(prev => ({ ...prev, [key]: pct }))
                }

                xhr.onload = () => {
                    const status = xhr.status
                    const respRaw = xhr.response as unknown
                    setUploadProgress(prev => ({ ...prev, [key]: 100 }))

                    if (status >= 200 && status < 300) {
                        const respObj = (respRaw && typeof respRaw === 'object') ? (respRaw as Record<string, unknown>) : {}
                        const maybe = (respObj['url'] ?? respObj['publicUrl'] ?? respObj['path'] ?? respObj['key']) as unknown
                        if (!maybe) return resolve('')
                        let absolute = String(maybe).trim()

                        // if server returned a protocol-relative URL //
                        if (/^\/\//.test(absolute)) absolute = 'http:' + absolute

                        // if server returned a relative path like "/storage/..." or "storage/..."
                        // we will prefix storageBase
                        if (!/^https?:\/\//i.test(absolute)) {
                            const p = absolute.startsWith('/') ? absolute : `/${absolute.replace(/^\/+/, '')}`
                            absolute = `${storageBase}${p}`
                        }

                        // normalize accidental /api/storage -> /storage
                        absolute = absolute.replace(/\/api\/storage/gi, '/storage')

                        // If the string mistakenly contains repeated host, collapse to last full URL part.
                        const httpOccurrences = absolute.match(/https?:\/\//ig)
                        if (httpOccurrences && httpOccurrences.length > 1) {
                            const last = absolute.lastIndexOf('http')
                            absolute = absolute.slice(last)
                        }

                        // validate by constructing URL
                        try {
                            // will throw on invalid
                            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                            new URL(absolute)
                            resolve(absolute)
                        } catch {
                            resolve('')
                        }
                        return
                    }

                    const respObj = (respRaw && typeof respRaw === 'object') ? (respRaw as Record<string, unknown>) : {}
                    const respMessage = (respObj['message'] && String(respObj['message'])) ?? xhr.statusText ?? `Upload failed (${status})`
                    const errMsg = String(respMessage) // ensure type is string
                    reject(new Error(errMsg))

                }

                xhr.onerror = () => reject(new Error('Network error during upload'))
                xhr.send(fd)
            })
        } finally {
            // leave uploadProgress as-is (100 or last state)
        }
    }

    // show immediate blob preview, then replace with server URL when upload completes
    async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0]; if (!f) return
        setError(null)

        const tmp = URL.createObjectURL(f)
        setForm(prev => ({ ...prev, logo: tmp }))

        try {
            const key = 'logo'
            const serverUrl = await uploadFileWithProgress(f, key)
            if (serverUrl) setForm(prev => ({ ...prev, logo: serverUrl }))
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setTimeout(() => { try { URL.revokeObjectURL(tmp) } catch { } }, 1500)
        }
    }

    // immediate blob preview then replace with server url; keeps upload progress in uploadProgress[key]
    async function handleItemFile(e: React.ChangeEvent<HTMLInputElement>, itemId: string) {
        const f = e.target.files?.[0]; if (!f) return
        setError(null)

        const tmp = URL.createObjectURL(f)
        updateItem(itemId, { image: tmp })

        try {
            const key = `item-${itemId}`
            const serverUrl = await uploadFileWithProgress(f, key)
            if (serverUrl) updateItem(itemId, { image: serverUrl })
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setTimeout(() => { try { URL.revokeObjectURL(tmp) } catch { } }, 1500)
        }
    }

    function updateField<K extends keyof FormState>(k: K, v: FormState[K]) {
        setForm(prev => ({ ...prev, [k]: v }))
    }

    function updateItem(itemId: string, patch: Partial<ItemRow>) {
        setForm(prev => ({ ...prev, items: prev.items.map(it => it.id === itemId ? { ...it, ...patch } : it) }))
    }

    function addItem() {
        setForm(prev => ({ ...prev, items: [...prev.items, makeEmptyItem()] }))
    }

    function removeItem(itemId: string) {
        setForm(prev => ({ ...prev, items: prev.items.filter(it => it.id !== itemId) }))
    }

    const firstError = (errs: Record<string, string[]>) => {
        for (const k of Object.keys(errs)) if (errs[k] && errs[k].length) return errs[k][0]
        return null
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        setErrors({})
        setSuccess(null)

        try {
            const payload: SellerApplicationPayload = {
                application_type: form.application_type,
                contact_name: form.contact_name,
                email: form.email,
                phone: form.phone,
                website: form.website,
                country: form.country,
                message: form.message,
                logo_url: form.logo || undefined
            }

            if (form.application_type === 'business') {
                payload.business_name = form.business_name || undefined
            } else {
                payload.items = form.items.map(it => ({
                    title: it.title,
                    condition: it.condition,
                    quantity: Number(it.quantity || 1),
                    estimated_price: it.estimated_price,
                    description: it.description,
                    image_url: it.image || null
                }))
            }

            const res = await fetch(`${apiBase}/v1/seller-applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.status === 422) {
                const body = await res.json().catch(() => null) as unknown
                const serverErrors = (body && typeof body === 'object' && (body as Record<string, unknown>)['errors']) ? (body as Record<string, unknown>)['errors'] as Record<string, string[]> : {}
                setErrors(serverErrors)
                throw new Error(firstError(serverErrors) || ((body && typeof body === 'object' && 'message' in (body as Record<string, unknown>)) ? String((body as Record<string, unknown>)['message']) : 'Validation failed'))
            }

            if (!res.ok) {
                const body = await res.json().catch(() => null) as unknown
                const msg = (body && typeof body === 'object' && 'message' in (body as Record<string, unknown>)) ? String((body as Record<string, unknown>)['message']) : res.statusText || 'Failed'
                throw new Error(msg)
            }

            setSuccess('Application sent — we will review and contact you shortly.')
            setForm({
                application_type: 'business',
                business_name: '',
                contact_name: '',
                email: '',
                phone: '',
                website: '',
                country: '',
                message: '',
                logo: '',
                items: [makeEmptyItem()]
            })
            setUploadProgress({})
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setSubmitting(false)
        }
    }

    const ProgressBar = ({ pct }: { pct: number }) => (
        <div className="w-full bg-gray-100 rounded-xl overflow-hidden h-2">
            <div style={{ width: `${pct}%` }} className="h-2 bg-gradient-to-r from-amber-600 to-amber-700 transition-all duration-300" />
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <button
                onClick={() => window.history.back()}
                className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium"
            >
                ← Back
            </button>

            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Seller Community</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Become a trusted seller on Tech Mall and reach thousands of customers
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
                    {/* Application Type Selection */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <BuildingStorefrontIcon className="w-5 h-5 text-amber-600" />
                            I want to:
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${form.application_type === 'business'
                                ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-amber-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="app_type"
                                    checked={form.application_type === 'business'}
                                    onChange={() => updateField('application_type', 'business')}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.application_type === 'business'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        <BuildingStorefrontIcon className="w-5 h-5" />
                                    </div>
                                    <div className="font-semibold text-gray-900">Business Seller</div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Apply as a business or long-term seller with recurring inventory
                                </div>
                            </label>

                            <label className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${form.application_type === 'one_time'
                                ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-amber-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="app_type"
                                    checked={form.application_type === 'one_time'}
                                    onChange={() => updateField('application_type', 'one_time')}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.application_type === 'one_time'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        <CubeIcon className="w-5 h-5" />
                                    </div>
                                    <div className="font-semibold text-gray-900">One-Time Seller</div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Sell individual items (single sale or buyback opportunity)
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Business Name (for Business Seller) */}
                    {form.application_type === 'business' && (
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <BuildingStorefrontIcon className="w-4 h-4 text-amber-600" />
                                Business Name
                            </label>
                            <input
                                value={form.business_name}
                                onChange={e => updateField('business_name', e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                placeholder="Enter your business name"
                            />
                            {errors.business_name && (
                                <div className="text-rose-600 text-sm flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    {firstError({ business_name: errors.business_name })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <UserIcon className="w-5 h-5 text-amber-600" />
                            Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <UserIcon className="w-4 h-4 text-amber-600" />
                                    Contact Name
                                </label>
                                <input
                                    value={form.contact_name}
                                    onChange={e => updateField('contact_name', e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <EnvelopeIcon className="w-4 h-4 text-amber-600" />
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => updateField('email', e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                    placeholder="your.email@example.com"
                                />
                                {errors.email && (
                                    <div className="text-rose-600 text-sm flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        {firstError({ email: errors.email })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <PhoneIcon className="w-4 h-4 text-amber-600" />
                                    Phone Number
                                </label>
                                <input
                                    value={form.phone}
                                    onChange={e => updateField('phone', e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                    placeholder="+254 (123)-4567"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <GlobeAltIcon className="w-4 h-4 text-amber-600" />
                                    Website (Optional)
                                </label>
                                <input
                                    value={form.website}
                                    onChange={e => updateField('website', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Section (for One-Time Seller) */}
                    {form.application_type === 'one_time' && (
                        <section className="space-y-6">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <CubeIcon className="w-5 h-5 text-amber-600" />
                                Items to Sell
                            </h3>

                            {form.items.map((it, idx) => {
                                const key = `item-${it.id}`
                                const prog = uploadProgress[key] ?? 0
                                return (
                                    <div key={it.id} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-sm font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div className="font-semibold text-gray-900">Item #{idx + 1}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                {form.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(it.id)}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 font-medium hover:bg-rose-100 border border-rose-200 transition-all duration-200"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700">Title</label>
                                                <input
                                                    value={it.title}
                                                    onChange={e => updateItem(it.id, { title: e.target.value })}
                                                    required
                                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                                    placeholder="Product title"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700">Condition</label>
                                                <select
                                                    value={it.condition}
                                                    onChange={e => updateItem(it.id, { condition: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                                >
                                                    <option>Used</option>
                                                    <option>Refurbished</option>
                                                    <option>New</option>
                                                    <option>Parts only</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700">Quantity</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={it.quantity}
                                                    onChange={e => updateItem(it.id, { quantity: Number(e.target.value) })}
                                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700">Estimated Price (per item)</label>
                                                <input
                                                    value={it.estimated_price}
                                                    onChange={e => updateItem(it.id, { estimated_price: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700">Product Image (Optional)</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => handleItemFile(e, it.id)}
                                                    className="w-full p-3 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                                />
                                                <div className="mt-2">
                                                    {prog > 0 && prog < 100 && (
                                                        <div className="mb-3">
                                                            <div className="text-xs text-gray-600 mb-2">Uploading: {prog}%</div>
                                                            <ProgressBar pct={prog} />
                                                        </div>
                                                    )}
                                                    {it.image && (
                                                        <div className="mt-3 h-32 w-full relative bg-white rounded-xl border border-gray-200 p-2">
                                                            {String(it.image).startsWith('blob:') ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={it.image} alt="item preview" className="h-28 object-contain mx-auto" />
                                                            ) : (
                                                                <Image
                                                                    src={normalizeSrc(it.image)}
                                                                    alt={it.title || 'preview'}
                                                                    width={160}
                                                                    height={120}
                                                                    className="object-contain h-28 mx-auto"
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-gray-700">Description</label>
                                            <textarea
                                                value={it.description}
                                                onChange={e => updateItem(it.id, { description: e.target.value })}
                                                rows={3}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                                placeholder="Describe your product..."
                                            />
                                        </div>
                                    </div>
                                )
                            })}

                            <div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 font-semibold hover:from-amber-100 hover:to-amber-200 border border-amber-300 transition-all duration-200"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Add Another Item
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Message & Logo */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <DocumentTextIcon className="w-4 h-4 text-amber-600" />
                                Additional Message
                            </label>
                            <textarea
                                value={form.message}
                                onChange={e => updateField('message', e.target.value)}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                placeholder="Tell us about your business or products..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <PhotoIcon className="w-4 h-4 text-amber-600" />
                                Logo / Brand Image (Optional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoFile}
                                className="w-full p-3 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                            />
                            <div className="mt-2">
                                {uploadProgress['logo'] > 0 && uploadProgress['logo'] < 100 && (
                                    <div className="mb-3">
                                        <div className="text-xs text-gray-600 mb-2">Uploading: {uploadProgress['logo']}%</div>
                                        <ProgressBar pct={uploadProgress['logo']} />
                                    </div>
                                )}
                                {form.logo && (
                                    <div className="mt-3 h-32 w-32 relative bg-white rounded-xl border border-gray-200 p-2">
                                        {String(form.logo).startsWith('blob:') ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={form.logo} alt="logo" className="h-28 object-contain mx-auto" />
                                        ) : (
                                            <Image
                                                src={normalizeSrc(form.logo)}
                                                alt="logo"
                                                width={128}
                                                height={128}
                                                className="object-contain h-28 mx-auto"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 flex items-center gap-3">
                            <CheckIcon className="w-5 h-5 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                        <button
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex-1 justify-center"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="w-5 h-5" />
                                    {form.application_type === 'business' ? 'Apply as Seller' : 'Submit Items for Sale'}
                                </>
                            )}
                        </button>

                        <a
                            href={`mailto:techevo404@gmail.com?subject=${encodeURIComponent('Seller Enquiry - Tech Mall')}`}
                            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-300 border border-gray-300 transition-all duration-200 flex-1 justify-center text-center"
                        >
                            <EnvelopeIcon className="w-5 h-5" />
                            Contact Us Directly
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}