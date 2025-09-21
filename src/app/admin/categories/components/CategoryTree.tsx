// src/app/admin/categories/components/CategoryTree.tsx
'use client'
import React, { useMemo, useState } from 'react'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import type { Category } from '../types'

type Props = {
    categories: Category[] // flat list with parent_id
    onEdit?: (c: Category) => void
    onDeleted?: () => void
    onMoved?: () => void
}

/** Building nested tree from flat list */
function buildTree(flat: Category[]) {
    const map = new Map<number, Category & { children: Category[] }>()
    const roots: (Category & { children: Category[] })[] = []
    flat.forEach(c => map.set(c.id, { ...c, children: [] }))
    map.forEach(node => {
        const parent = node.parent_id ?? null
        if (parent && map.has(parent)) map.get(parent)!.children.push(node)
        else roots.push(node)
    })
    // optional sorting by name
    function sortNodes(nodes: any[]) {
        nodes.sort((a, b) => String(a.name).localeCompare(String(b.name)))
        nodes.forEach(n => n.children && sortNodes(n.children))
    }
    sortNodes(roots)
    return roots
}

/** Flattening for select (id/name/depth) */
function flattenForSelect(nodes: (Category & { children?: Category[] })[]) {
    const out: { id: number; name: string; depth: number }[] = []
    function walk(list: any[], depth = 0) {
        for (const n of list) {
            out.push({ id: n.id, name: n.name, depth })
            if (n.children && n.children.length) walk(n.children, depth + 1)
        }
    }
    walk(nodes, 0)
    return out
}

export default function CategoryTree({ categories, onEdit, onDeleted, onMoved }: Props) {
    const tree = useMemo(() => buildTree(categories), [categories])
    const selectOpts = useMemo(() => flattenForSelect(tree), [tree])
    const [movingId, setMovingId] = useState<number | null>(null)
    const [moveTarget, setMoveTarget] = useState<number | ''>('')
    const [loadingMove, setLoadingMove] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

    async function handleDelete(id: number) {
        if (!confirm('Delete category and its children?')) return
        setDeleteLoading(id)
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
            if (onDeleted) onDeleted()
        } catch (err) {
            alert('Delete failed: ' + (err as Error).message)
        } finally {
            setDeleteLoading(null)
        }
    }

    async function saveMove(id: number) {
        setLoadingMove(true)
        try {
            // sending update to change parent_id (PUT)
            const payload = { parent_id: moveTarget === '' ? null : Number(moveTarget) }
            const res = await adminFetch(`/v1/admin/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (res.status === 401 || res.status === 403) {
                clearAdminToken()
                window.location.href = '/admin/login'
                return
            }
            const body = await res.json().catch(() => null)
            if (!res.ok) throw new Error(body?.message || res.statusText)
            setMovingId(null)
            setMoveTarget('')
            if (onMoved) onMoved()
        } catch (err) {
            alert('Move failed: ' + (err as Error).message)
        } finally {
            setLoadingMove(false)
        }
    }

    function renderNodes(nodes: (Category & { children?: Category[] })[]) {
        return nodes.map((n) => (
            <li key={n.id} className="border rounded p-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="font-medium">{n.name}</div>
                        <div className="text-xs text-gray-500">{n.slug ?? ''}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => onEdit?.(n)} className="px-2 py-1 text-xs bg-gray-100 rounded">Edit</button>
                        <button onClick={() => { setMovingId(prev => prev === n.id ? null : n.id); setMoveTarget('') }} className="px-2 py-1 text-xs bg-yellow-50 rounded">Move</button>
                        <button onClick={() => handleDelete(n.id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded">
                            {deleteLoading === n.id ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </div>

                {movingId === n.id && (
                    <div className="mt-2 flex items-center gap-2">
                        <select value={moveTarget} onChange={e => setMoveTarget(e.target.value === '' ? '' : Number(e.target.value))} className="p-2 border rounded">
                            <option value="">— Move to root —</option>
                            {selectOpts.filter(o => o.id !== n.id).map(o => (
                                // preventing setting parent to self — more validation could be added to avoid cycles
                                <option key={o.id} value={o.id}>
                                    {Array(o.depth).fill('\u00A0\u00A0').join('')}{o.depth > 0 ? '↳ ' : ''}{o.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => saveMove(n.id)} disabled={loadingMove} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">
                            {loadingMove ? 'Moving…' : 'Save'}
                        </button>
                        <button onClick={() => setMovingId(null)} className="px-3 py-1 rounded bg-gray-100 text-sm">Cancel</button>
                    </div>
                )}

                {n.children && n.children.length > 0 && (
                    <ul className="mt-3 ml-4 space-y-2">
                        {renderNodes(n.children as any)}
                    </ul>
                )}
            </li>
        ))
    }

    return (
        <div>
            {tree.length === 0 ? (
                <div className="text-gray-500">No categories yet.</div>
            ) : (
                <ul className="space-y-3">
                    {renderNodes(tree)}
                </ul>
            )}
        </div>
    )
}
