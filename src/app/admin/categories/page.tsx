// src/app/admin/categories/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import { Category } from './types'
import CategoryTree from './components/CategoryTree'
import CategoryForm from './components/CategoryForm'

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editing, setEditing] = useState<Category | null>(null)
    const [showCreate, setShowCreate] = useState(false)

    // load flat categories
    async function load() {
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
            if (!res.ok) throw new Error(body?.message || res.statusText)
            const list: Category[] = Array.isArray(body) ? body : (body.data ?? [])
            setCategories(list)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    function onSaved() {
        setShowCreate(false)
        setEditing(null)
        load()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setEditing(null); setShowCreate(true) }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                    >
                        Create category
                    </button>
                </div>
            </div>

            {loading && <div>Loading…</div>}
            {error && <div className="text-red-600">Error: {error}</div>}

            {!loading && !error && (
                <div className="space-y-4">
                    <CategoryTree
                        categories={categories}
                        onEdit={(c) => { setEditing(c); setShowCreate(true) }}
                        onDeleted={() => load()}
                        onMoved={() => load()}
                    />
                </div>
            )}

            {showCreate && (
                <CategoryForm
                    initial={editing ?? undefined}
                    categoriesFlat={categories}
                    onClose={() => { setShowCreate(false); setEditing(null) }}
                    onSaved={onSaved}
                />
            )}
        </div>
    )
}
