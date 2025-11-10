// src/app/admin/categories/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import CategoryForm from './components/CategoryForm'
import type { Category } from '@/types' // ← use the shared central type

type CategoryWithParent = Category & { parent_name?: string | null }

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategoryWithParent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editing, setEditing] = useState<Category | null>(null)
    const [showForm, setShowForm] = useState(false)

    async function loadCategories() {
        setLoading(true)
        setError(null)
        try {
            const res = await adminFetch('/v1/admin/categories')
            if (res.status === 401 || res.status === 403) {
                clearAdminToken()
                window.location.href = '/admin/login'
                return
            }
            const body = await res.json().catch(() => null)
            if (!res.ok) throw new Error((body && typeof body === 'object' && 'message' in body) ? String((body as Record<string, unknown>).message) : res.statusText)

            // normalize list (flat) — coerce types and turn null slug -> undefined
            const raw = Array.isArray(body) ? body : (body && typeof body === 'object' ? (body as Record<string, unknown>).data ?? [] : [])
            const list: Category[] = Array.isArray(raw) ? raw.map((it) => {
                const r = it as Record<string, unknown>
                return {
                    id: Number(r['id']),
                    name: String(r['name'] ?? ''),
                    slug: r['slug'] == null ? undefined : String(r['slug']),
                    parent_id: r['parent_id'] == null ? null : Number(r['parent_id']),
                    children: Array.isArray(r['children']) ? (r['children'] as unknown as Category[]) : undefined,
                    // keep any other fields if present: cast to unknown and merge (optional)
                    ...(r as Record<string, unknown>)
                } as Category
            }).filter(c => !Number.isNaN(c.id)) : []

            // build id -> name map
            const idToName = new Map<number, string>()
            for (const c of list) {
                if (c && c.id != null) idToName.set(Number(c.id), String(c.name ?? ''))
            }

            // add parent_name for display convenience
            const listWithParent: CategoryWithParent[] = list.map((c) => {
                const pid = c.parent_id == null ? null : Number(c.parent_id)
                return {
                    ...c,
                    parent_name: pid ? (idToName.get(pid) ?? null) : null
                }
            })

            setCategories(listWithParent)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadCategories() }, [])

    function openCreate() {
        setEditing(null)
        setShowForm(true)
    }

    function openEdit(cat: Category) {
        setEditing(cat)
        setShowForm(true)
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete category? Children will remain but lose parent.')) return
        try {
            const res = await adminFetch(`/v1/admin/categories/${id}`, { method: 'DELETE' })
            if (res.status === 401 || res.status === 403) {
                clearAdminToken()
                window.location.href = '/admin/login'
                return
            }
            if (!res.ok) {
                const b = await res.json().catch(() => null)
                throw new Error(b?.message || res.statusText)
            }
            // refresh
            await loadCategories()
        } catch (err) {
            alert('Delete failed: ' + (err as Error).message)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                <div>
                    <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create category</button>
                </div>
            </div>

            {loading && <div>Loading…</div>}
            {error && <div className="text-red-600">Error: {error}</div>}

            {!loading && categories.length === 0 && <div className="text-gray-500">No categories yet.</div>}

            <div className="mt-4 grid gap-3">
                {categories.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded shadow-sm">
                        <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-gray-500">
                                slug: {c.slug ?? '—'} • parent: {c.parent_name ?? '—'}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openEdit(c)} className="px-3 py-1 text-sm rounded bg-gray-100">Edit</button>
                            <button onClick={() => handleDelete(c.id)} className="px-3 py-1 text-sm rounded bg-red-50 text-red-700">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <CategoryForm
                    initial={editing ?? undefined}
                    // pass the flat categories for parent select — NOTE: CategoryForm expects Category[] (parent_id etc)
                    categoriesFlat={categories.map(({ parent_name, ...rest }) => ({ ...rest }))}
                    onSaved={() => {
                        // reload categories after create/edit
                        loadCategories()
                    }}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    )
}
