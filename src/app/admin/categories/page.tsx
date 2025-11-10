// src/app/admin/categories/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import CategoryForm from './components/CategoryForm'
import type { Category } from '@/types'
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    FolderIcon,
    HashtagIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'

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
        if (!confirm('Are you sure you want to delete this category? Child categories will remain but lose their parent relationship.')) return
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
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
                    <p className="text-gray-600">Organize your products with categories and subcategories</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => loadCategories()}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 font-semibold hover:from-gray-100 hover:to-gray-200 border border-gray-300 disabled:opacity-50 transition-all duration-200"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-sm"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Category
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0"></div>
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
                    <div className="text-gray-600 font-medium">Loading categories...</div>
                </div>
            )}

            {/* Empty State */}
            {!loading && categories.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-600 font-medium mb-2">No categories yet</div>
                    <div className="text-gray-500 text-sm mb-6">Create your first category to organize products</div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-sm mx-auto"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create First Category
                    </button>
                </div>
            )}

            {/* Categories Grid */}
            {!loading && categories.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {categories.map(c => (
                        <div key={c.id} className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 hover:border-amber-300 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 flex items-center justify-center">
                                        <FolderIcon className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-lg">{c.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${c.parent_id
                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                }`}>
                                                {c.parent_id ? 'Subcategory' : 'Main Category'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category Details */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <HashtagIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Slug:</span>
                                    <code className="bg-gray-100 px-2 py-1 rounded-lg text-gray-800 font-mono text-xs">
                                        {c.slug || '—'}
                                    </code>
                                </div>

                                {c.parent_name && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FolderIcon className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">Parent:</span>
                                        <span className="text-gray-800">{c.parent_name}</span>
                                    </div>
                                )}

                                {c.children && c.children.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-4 h-4 flex items-center justify-center">
                                            <span className="text-xs">📁</span>
                                        </div>
                                        <span className="font-medium">Subcategories:</span>
                                        <span className="text-amber-700 font-semibold">{c.children.length}</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => openEdit(c)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 font-medium hover:from-amber-100 hover:to-amber-200 border border-amber-300 transition-all duration-200 flex-1 justify-center"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 font-medium hover:from-rose-100 hover:to-rose-200 border border-rose-300 transition-all duration-200 flex-1 justify-center"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Category Form Modal */}
            {showForm && (
                <CategoryForm
                    initial={editing ?? undefined}
                    categoriesFlat={categories.map(({ parent_name, ...rest }) => ({ ...rest }))}
                    onSaved={() => {
                        loadCategories()
                    }}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    )
}