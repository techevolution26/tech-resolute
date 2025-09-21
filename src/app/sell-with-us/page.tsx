// src/app/sell-with-us/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { normalizeSrc } from '@/lib/normalizeSrc'

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

    // upload / UI states
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({}) // key -> 0..100
    const [fileUploading, setFileUploading] = useState(false) // overall uploading flag
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const [success, setSuccess] = useState<string | null>(null)

    const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')

    // --- helper: client-side image resize to a blob ---
    async function resizeImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new window.Image()
            const url = URL.createObjectURL(file)

            img.onload = () => {
                try {
                    // compute target size while preserving aspect ratio
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

                    // choose output format based on original file type
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
                } catch (e) {
                    URL.revokeObjectURL(url)
                    reject(new Error('Resize failed'))
                }
            }

            img.onerror = () => {
                URL.revokeObjectURL(url)
                reject(new Error('Failed to load image for resizing'))
            }

            // load via blob URL so we support local files
            img.src = url
        })
    }

    // --- helper: upload with progress (xhr) ---
    // key is a string identifier used to update uploadProgress (e.g. 'logo' or itemId)
    // returns an absolute URL (tries resp.url, resp.publicUrl, resp.path, resp.key)
    async function uploadFileWithProgress(file: File, key: string): Promise<string> {
        setFileUploading(true)
        setUploadProgress(prev => ({ ...prev, [key]: 0 }))
        try {
            // try resize, but fall back to original file if resize fails
            let uploadBlob: File | Blob = file
            try {
                const resized = await resizeImage(file, 1200, 1200, 0.8)
                if (resized instanceof Blob) uploadBlob = resized
            } catch (e) {
                // ignore resize errors and continue with original file
            }

            const fd = new FormData()
            const filename = file.name || `${key}.jpg`
            fd.append('file', uploadBlob, filename)

            return await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('POST', `${base}/v1/uploads`)
                xhr.responseType = 'json'

                xhr.upload.onprogress = (ev) => {
                    if (!ev.lengthComputable) return
                    const pct = Math.round((ev.loaded / ev.total) * 100)
                    setUploadProgress(prev => ({ ...prev, [key]: pct }))
                }

                xhr.onload = () => {
                    const status = xhr.status
                    const resp = xhr.response || {}
                    setUploadProgress(prev => ({ ...prev, [key]: 100 }))
                    if (status >= 200 && status < 300) {
                        const maybe = resp?.url || resp?.publicUrl || resp?.path || resp?.key
                        if (!maybe) return resolve('')
                        const absolute = String(maybe).startsWith('/') ? `${base}${maybe}` : String(maybe)
                        // normalize possible /api/storage -> /storage
                        resolve(absolute.replace(/\/api\/storage/gi, '/storage'))
                        return
                    }
                    const errMsg = (resp && resp.message) || xhr.statusText || `Upload failed (${status})`
                    reject(new Error(errMsg))
                }

                xhr.onerror = () => reject(new Error('Network error during upload'))
                xhr.send(fd)
            })
        } finally {
            setFileUploading(false)
        }
    }

    // handlers that use uploadFileWithProgress and set form state accordingly
    // showing  immediate blob preview, then replace with server URL when upload completes
    async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0]; if (!f) return
        setError(null)

        // immediate preview
        const tmp = URL.createObjectURL(f)
        setForm(prev => ({ ...prev, logo: tmp }))

        try {
            const key = 'logo'
            const serverUrl = await uploadFileWithProgress(f, key)
            if (serverUrl) setForm(prev => ({ ...prev, logo: serverUrl }))
        } catch (err: any) {
            setError(err?.message || 'Upload failed')
        } finally {
            // revoking the local blob (delay slightly so UI doesn't flicker)
            setTimeout(() => { try { URL.revokeObjectURL(tmp) } catch (e) { } }, 1500)
        }
    }

    // immediate blob preview then replace with server url; keeping upload progress in uploadProgress[key]
    async function handleItemFile(e: React.ChangeEvent<HTMLInputElement>, itemId: string) {
        const f = e.target.files?.[0]; if (!f) return
        setError(null)

        const tmp = URL.createObjectURL(f)
        updateItem(itemId, { image: tmp })

        try {
            const key = `item-${itemId}`
            const serverUrl = await uploadFileWithProgress(f, key)
            if (serverUrl) updateItem(itemId, { image: serverUrl })
        } catch (err: any) {
            setError(err?.message || 'Upload failed')
        } finally {
            setTimeout(() => { try { URL.revokeObjectURL(tmp) } catch (e) { } }, 1500)
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
            // build payload
            const payload: any = {
                application_type: form.application_type,
                contact_name: form.contact_name,
                email: form.email,
                phone: form.phone,
                website: form.website,
                country: form.country,
                message: form.message,
                logo_url: form.logo
            }

            if (form.application_type === 'business') {
                payload.business_name = form.business_name
            } else {
                // one_time
                // ensuring we send image_url even if empty string -server may ignore
                payload.items = form.items.map(it => ({
                    title: it.title,
                    condition: it.condition,
                    quantity: Number(it.quantity || 1),
                    estimated_price: it.estimated_price,
                    description: it.description,
                    image_url: it.image || null
                }))
            }

            const res = await fetch(`${base}/v1/seller-applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.status === 422) {
                const body = await res.json().catch(() => null)
                const serverErrors = body?.errors ?? {}
                setErrors(serverErrors)
                throw new Error(firstError(serverErrors) || body?.message || 'Validation failed')
            }

            if (!res.ok) {
                const body = await res.json().catch(() => null)
                throw new Error(body?.message || res.statusText || 'Failed')
            }

            setSuccess('Application sent — we will review and contact you shortly.')
            // reseting to initial state
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
        } catch (err: any) {
            setError(err?.message || 'Submission failed')
        } finally {
            setSubmitting(false)
        }
    }

    // Small component for rendering per-key progress bar
    const ProgressBar = ({ pct }: { pct: number }) => (
        <div className="w-full bg-gray-100 rounded overflow-hidden h-2">
            <div style={{ width: `${pct}%` }} className="h-2 bg-indigo-600" />
        </div>
    )

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-3xl font-bold mb-2">Sell on Tech Mall</h1>
                <p className="text-gray-600 mb-6">Choose whether you’re applying to be a recurring seller or selling one-time items to us.</p>

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                    <div>
                        <label className="text-sm font-medium block mb-2">I want to:</label>
                        <div className="flex gap-4">
                            <label className={`px-4 py-2 rounded cursor-pointer ${form.application_type === 'business' ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border'}`}>
                                <input type="radio" name="app_type" checked={form.application_type === 'business'} onChange={() => updateField('application_type', 'business')} className="mr-2" />
                                Apply as a business / long-term seller
                            </label>

                            <label className={`px-4 py-2 rounded cursor-pointer ${form.application_type === 'one_time' ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border'}`}>
                                <input type="radio" name="app_type" checked={form.application_type === 'one_time'} onChange={() => updateField('application_type', 'one_time')} className="mr-2" />
                                Sell one-time items (single sale / buyback)
                            </label>
                        </div>
                    </div>

                    {form.application_type === 'business' && (
                        <div>
                            <label className="text-sm font-medium">Business name</label>
                            <input value={form.business_name} onChange={e => updateField('business_name', e.target.value)} required className="w-full mt-2 p-3 border rounded" />
                            {errors.business_name && <div className="text-red-600 text-sm mt-1">{firstError({ business_name: errors.business_name })}</div>}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Contact name</label>
                            <input value={form.contact_name} onChange={e => updateField('contact_name', e.target.value)} required className="w-full mt-2 p-3 border rounded" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Contact email</label>
                            <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} required className="w-full mt-2 p-3 border rounded" />
                            {errors.email && <div className="text-red-600 text-sm mt-1">{firstError({ email: errors.email })}</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Phone</label>
                            <input value={form.phone} onChange={e => updateField('phone', e.target.value)} required className="w-full mt-2 p-3 border rounded" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Website (optional)</label>
                            <input value={form.website} onChange={e => updateField('website', e.target.value)} className="w-full mt-2 p-3 border rounded" />
                        </div>
                    </div>

                    {/* One-time items list */}
                    {form.application_type === 'one_time' && (
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold">Items to sell (one-time)</h3>
                            {form.items.map((it, idx) => {
                                const key = `item-${it.id}`
                                const prog = uploadProgress[key] ?? 0
                                return (
                                    <div key={it.id} className="bg-gray-50 p-4 rounded-md space-y-2 border">
                                        <div className="flex justify-between items-center">
                                            <div className="font-medium">Item #{idx + 1}</div>
                                            <div className="flex gap-2">
                                                {form.items.length > 1 && <button type="button" onClick={() => removeItem(it.id)} className="text-red-600 text-sm">Remove</button>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-sm">Title</label>
                                                <input value={it.title} onChange={e => updateItem(it.id, { title: e.target.value })} required className="mt-1 w-full p-2 border rounded" />
                                            </div>
                                            <div>
                                                <label className="text-sm">Condition</label>
                                                <select value={it.condition} onChange={e => updateItem(it.id, { condition: e.target.value })} className="mt-1 w-full p-2 border rounded">
                                                    <option>Used</option>
                                                    <option>Refurbished</option>
                                                    <option>New</option>
                                                    <option>Parts only</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm">Quantity</label>
                                                <input type="number" min={1} value={it.quantity} onChange={e => updateItem(it.id, { quantity: Number(e.target.value) })} className="mt-1 w-full p-2 border rounded" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm">Estimated price (per item)</label>
                                                <input value={it.estimated_price} onChange={e => updateItem(it.id, { estimated_price: e.target.value })} className="mt-1 w-full p-2 border rounded" />
                                            </div>
                                            <div>
                                                <label className="text-sm">Image (optional)</label>
                                                <input type="file" accept="image/*" onChange={e => handleItemFile(e, it.id)} className="mt-1" />
                                                <div className="mt-2">
                                                    {prog > 0 && prog < 100 && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-gray-600 mb-1">Uploading: {prog}%</div>
                                                            <ProgressBar pct={prog} />
                                                        </div>
                                                    )}
                                                    {it.image && (
                                                        <div className="mt-2 h-20 w-full relative">
                                                            {String(it.image).startsWith('blob:') ? (
                                                                // blob preview uses plain img
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={it.image} alt="item preview" className="h-20 object-contain" />
                                                            ) : (
                                                                // remote preview uses next/image (requires next.config.js remotePatterns)
                                                                <Image
                                                                    src={normalizeSrc(it.image)}
                                                                    alt={it.title || 'preview'}
                                                                    width={160}
                                                                    height={120}
                                                                    className="object-contain"
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm">Description</label>
                                            <textarea value={it.description} onChange={e => updateItem(it.id, { description: e.target.value })} rows={3} className="mt-1 w-full p-2 border rounded" />
                                        </div>
                                    </div>
                                )
                            })}

                            <div>
                                <button type="button" onClick={addItem} className="px-4 py-2 rounded bg-indigo-50 text-indigo-700">Add another item</button>
                            </div>
                        </section>
                    )}

                    <div>
                        <label className="text-sm font-medium">Short message / notes</label>
                        <textarea value={form.message} onChange={e => updateField('message', e.target.value)} rows={4} className="w-full mt-2 p-3 border rounded" />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Logo / picture (optional)</label>
                        <input type="file" accept="image/*" onChange={handleLogoFile} className="mt-2" />
                        <div className="mt-2">
                            {uploadProgress['logo'] > 0 && uploadProgress['logo'] < 100 && (
                                <div className="mb-2">
                                    <div className="text-xs text-gray-600 mb-1">Uploading: {uploadProgress['logo']}%</div>
                                    <ProgressBar pct={uploadProgress['logo']} />
                                </div>
                            )}
                            {form.logo && (
                                <div className="mt-3 h-20">
                                    {String(form.logo).startsWith('blob:') ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={form.logo} alt="logo" className="h-20 object-contain" />
                                    ) : (
                                        <Image src={normalizeSrc(form.logo)} alt="logo" width={160} height={80} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    {success && <div className="text-green-600 text-sm">{success}</div>}

                    <div className="flex gap-3">
                        <button disabled={submitting} className="px-6 py-3 bg-indigo-600 text-white rounded-xl">
                            {submitting ? 'Submitting…' : (form.application_type === 'business' ? 'Apply as seller' : 'Submit items for sale')}
                        </button>

                        <a href={`mailto:techevo404@gmail.com?subject=${encodeURIComponent('Seller enquiry')}`} className="px-6 py-3 border rounded-xl text-sm">Contact us</a>
                    </div>
                </form>
            </div>
        </div>
    )
}
