// src/app/admin/categories/components/CategoryForm.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import type { Category } from '@/types'
import {
    XMarkIcon,
    FolderIcon,
    HashtagIcon,
    CheckIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline'

type Props = {
    initial?: Category
    categoriesFlat?: Category[]
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
    const [success, setSuccess] = useState<string | null>(null)

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
        setSuccess(null)
        setLoading(true)
        try {
            const payload: { name: string; slug: string; parent_id?: number | null } = {
                name: name.trim(),
                slug: slug ? slug.trim() : slugify(name),
            }
            payload.parent_id = parentId === '' ? null : Number(parentId)

            let res: Response
            if (isEdit && initial) {
                res = await adminFetch(`/v1/admin/categories/${initial.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
            } else {
                res = await adminFetch(`/v1/admin/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
            }

            if (res.status === 401 || res.status === 403) {
                clearAdminToken()
                window.location.href = '/admin/login'
                return
            }

            const body = await res.json().catch(() => null)
            if (!res.ok) throw new Error(body?.message || res.statusText)

            setSuccess(isEdit ? 'Category updated successfully.' : 'Category created successfully.')
            onSaved?.()

            setTimeout(() => {
                onClose?.()
            }, 1500)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    // Build options with indentation
    function buildNested(list: Category[]) {
        const map = new Map<number, Category & { children?: Category[] }>()
        list.forEach((c) => map.set(c.id, { ...c, children: [] }))
        const roots: (Category & { children?: Category[] })[] = []
        map.forEach((node) => {
            const parent = node.parent_id ?? null
            if (parent && map.has(parent)) map.get(parent)!.children!.push(node)
            else roots.push(node)
        })
        return { map, roots }
    }

    function flattenWithDepth(nodes: (Category & { children?: Category[] })[]) {
        const out: { id: number; name: string; depth: number }[] = []
        function walk(arr: (Category & { children?: Category[] })[], depth = 0) {
            for (const n of arr) {
                out.push({ id: n.id, name: n.name, depth })
                if (n.children && n.children.length) walk(n.children, depth + 1)
            }
        }
        walk(nodes)
        return out
    }

    const { map: formMap, roots: formRoots } = buildNested(categoriesFlat)
    const flatOpts = flattenWithDepth(formRoots)

    // compute descendants for current initial (when editing)
    function getDescendants(id?: number | null) {
        if (!id || !formMap.has(id)) return new Set<number>()
        const out = new Set<number>()
        function walk(nodeId: number) {
            const node = formMap.get(nodeId)
            if (!node || !node.children) return
            for (const ch of node.children) {
                out.add(ch.id)
                walk(ch.id)
            }
        }
        walk(id)
        return out
    }

    const forbidden = initial?.id ? getDescendants(initial.id) : new Set<number>()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => onClose?.()} />
            <div className="relative z-50 bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                            <FolderIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Category' : 'Create Category'}</h3>
                            <div className="text-sm text-gray-600">
                                {isEdit ? 'Update category details' : 'Add a new product category'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onClose?.()}
                        className="p-2 rounded-xl hover:bg-white/50 transition-colors duration-200"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="p-6 space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <DocumentTextIcon className="w-4 h-4 text-amber-600" />
                            Category Name
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                            placeholder="Enter category name"
                        />
                    </div>

                    {/* Slug Field */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <HashtagIcon className="w-4 h-4 text-amber-600" />
                            URL Slug
                        </label>
                        <input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="auto-generated if empty"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        />
                        <div className="text-xs text-gray-500">
                            Used in URLs. Leave empty to auto-generate from name.
                        </div>
                    </div>

                    {/* Parent Category */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <FolderIcon className="w-4 h-4 text-amber-600" />
                            Parent Category
                        </label>
                        <select
                            value={parentId === '' ? '' : parentId}
                            onChange={(e) => setParentId(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        >
                            <option value="">— No parent (root category) —</option>
                            {flatOpts.map((o) => {
                                if (initial && (initial.id === o.id || forbidden.has(o.id))) return null
                                return (
                                    <option key={o.id} value={o.id}>
                                        {Array(o.depth).fill('\u00A0\u00A0').join('')}
                                        {o.depth > 0 ? '↳ ' : ''}
                                        {o.name}
                                    </option>
                                )
                            })}
                        </select>
                        <div className="text-xs text-gray-500">
                            Select a parent category to create a subcategory
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {success}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-300 border border-gray-300 disabled:opacity-50 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {isEdit ? 'Saving...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="w-4 h-4" />
                                    {isEdit ? 'Save Changes' : 'Create Category'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}