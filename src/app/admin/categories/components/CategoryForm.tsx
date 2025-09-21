// src/app/admin/categories/components/CategoryForm.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import type { Category } from '../types'

type Props = {
    initial?: Category
    categoriesFlat?: Category[] // used for parent select
    onSaved?: () => void
    onClose?: () => void
}

export default function CategoryForm({ initial, categoriesFlat = [], onSaved, onClose }: Props) {
    const isEdit = !!initial
    const [name, setName] = useState(initial?.name ?? '')
    const [slug, setSlug] = useState(initial?.slug ?? '')
    const [parentId, setParentId] = useState<number | ''>(initial?.parent_id ?? '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (initial) {
            setName(initial.name ?? '')
            setSlug(initial.slug ?? '')
            setParentId(initial.parent_id ?? '')
        }
    }, [initial])

    // simple slugify helper
    function slugify(s: string) {
        return s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
    }

    async function submit(e?: React.FormEvent) {
        e?.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const payload: any = { name: name.trim(), slug: slug ? slug.trim() : slugify(name) }
            payload.parent_id = parentId === '' ? null : Number(parentId)

            if (isEdit && initial) {
                const res = await adminFetch(`/v1/admin/categories/${initial.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                if (res.status === 401 || res.status === 403) {
                    clearAdminToken()
                    window.location.href = '/admin/login'
                    return
                }
                const body = await res.json().catch(() => null)
                if (!res.ok) throw new Error(body?.message || res.statusText)
            } else {
                const res = await adminFetch(`/v1/admin/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                if (res.status === 401 || res.status === 403) {
                    clearAdminToken()
                    window.location.href = '/admin/login'
                    return
                }
                const body = await res.json().catch(() => null)
                if (!res.ok) throw new Error(body?.message || res.statusText)
            }

            if (onSaved) onSaved()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    // Build options with indentation (flat list may not have depths; build simple parent-child map to detect depth)
    function buildFlatForSelect(list: Category[]) {
        // Build map
        const map = new Map<number, Category & { children?: Category[] }>()
        list.forEach(c => map.set(c.id, { ...c, children: [] }))
        const roots: (Category & { children?: Category[] })[] = []

        map.forEach((node) => {
            const parent = node.parent_id ?? null
            if (parent && map.has(parent)) map.get(parent)!.children!.push(node)
            else roots.push(node)
        })

        const out: { id: number; name: string; depth: number }[] = []
        function walk(nodes: any[], depth = 0) {
            for (const n of nodes) {
                out.push({ id: n.id, name: n.name, depth })
                if (n.children && n.children.length) walk(n.children, depth + 1)
            }
        }
        walk(roots)
        return out
    }

    const opts = buildFlatForSelect(categoriesFlat)

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => onClose?.()} />
            <form onSubmit={submit} className="relative z-50 bg-white max-w-md w-full p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-3">{isEdit ? 'Edit category' : 'Create category'}</h3>

                <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded" />
                </div>

                <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Slug (optional)</label>
                    <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated if empty" className="w-full p-2 border rounded" />
                </div>

                <div className="mb-4">
                    <label className="block text-xs text-gray-600 mb-1">Parent category</label>
                    <select value={parentId === null ? '' : parentId} onChange={e => setParentId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border rounded">
                        <option value="">— No parent (root) —</option>
                        {opts.map(o => (
                            <option key={o.id} value={o.id}>
                                {Array(o.depth).fill('\u00A0\u00A0').join('')}{o.depth > 0 ? '↳ ' : ''}{o.name}
                            </option>
                        ))}
                    </select>
                </div>

                {error && <div className="text-red-600 mb-3">{error}</div>}

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => onClose?.()} className="px-3 py-2 rounded bg-gray-100">Cancel</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white">
                        {loading ? 'Saving…' : (isEdit ? 'Save' : 'Create')}
                    </button>
                </div>
            </form>
        </div>
    )
}
