'use client'

import React, { useState } from 'react'
import { adminFetch } from '@/lib/adminApi'
import Image from 'next/image'

export interface ProductInput {
    title: string
    slug: string
    price: number
    currency?: string
    condition?: string
    category_id?: number | null
    stock?: number
    image_path?: string
    description?: string
}

type Props = {
    initial?: Partial<ProductInput>
    saveUrl?: string // e.g. '/products' or `/products/${id}`
    method?: 'POST' | 'PATCH'
    onSaved?: (product: ProductInput & { id?: number }) => void
}

export default function ProductForm({ initial = {}, saveUrl = '/products', method = 'POST', onSaved }: Props) {
    const [form, setForm] = useState<ProductInput>({
        title: initial.title ?? '',
        slug: initial.slug ?? '',
        price: initial.price ?? 0,
        currency: initial.currency ?? 'KES',
        condition: initial.condition ?? 'New',
        category_id: initial.category_id ?? null,
        stock: initial.stock ?? 0,
        image_path: initial.image_path ?? '',
        description: initial.description ?? ''
    })
    const [fileUploading, setFileUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setError(null)
        setFileUploading(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            // use adminFetch to send Authorization header
            const base = process.env.NEXT_PUBLIC_API_URL ?? ''
            const token = typeof window !== 'undefined' ? localStorage.getItem('ADMIN_TOKEN') : null
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`${base}/v1/admin/uploads`, {
                method: 'POST',
                headers,
                body: fd
            })

            if (!res.ok) {
                const body = await res.json().catch(() => null)
                throw new Error(body?.message || res.statusText)
            }

            const payload = await res.json() as { publicUrl: string; key?: string }
            setForm(prev => ({ ...prev, image_path: payload.publicUrl }))
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setFileUploading(false)
        }
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setSaving(true)
        try {
            const res = await adminFetch<ProductInput & { id?: number }>(saveUrl, {
                method,
                body: JSON.stringify(form)
            })
            if (onSaved) onSaved(res)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow-sm max-w-3xl">
            <div className="grid gap-3">
                <input className="p-3 border rounded" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <input className="p-3 border rounded" placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
                <div className="flex gap-2">
                    <input type="number" className="p-3 border rounded w-32" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                    <input className="p-3 border rounded w-24" placeholder="Currency" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
                    <input type="number" className="p-3 border rounded w-24" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
                </div>
                <textarea className="p-3 border rounded" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <div>
                    <label className="block text-sm mb-1">Image</label>
                    <input type="file" accept="image/*" onChange={handleFile} />
                    {fileUploading && <div className="text-sm text-gray-500 mt-2">Uploading…</div>}
                    {form.image_path && (
                        <div className="mt-3">
                            <Image src={form.image_path} alt="preview" className="w-48 rounded" />
                        </div>
                    )}
                </div>

                {error && <div className="text-red-600">{error}</div>}
                <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </form>
    )
}
