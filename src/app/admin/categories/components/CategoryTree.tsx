// src/app/admin/categories/components/CategoryTree.tsx
'use client'
import React, { useMemo, useState } from 'react'
import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import type { Category } from '../types'

type Props = {
  categories: Category[] // flat list with parent_id
  onEdit?: (c: Category) => void
  onDeleted?: () => void
  onMoved?: () => void
}

/** Build nested tree from flat list and keep map for quick lookup */
function buildTree(flat: Category[]) {
  const map = new Map<number, (Category & { children: (Category & { children?: any[] })[] })>()
  flat.forEach(c => map.set(c.id, { ...c, children: [] }))
  const roots: (Category & { children: (Category & { children?: any[] })[] })[] = []
  map.forEach(node => {
    const parent = node.parent_id ?? null
    if (parent && map.has(parent)) map.get(parent)!.children.push(node)
    else roots.push(node)
  })
  // sort for stable order
  function sortNodes(nodes: any[]) {
    nodes.sort((a,b) => String(a.name).localeCompare(String(b.name)))
    nodes.forEach(n => n.children && sortNodes(n.children))
  }
  sortNodes(roots)
  return { roots, map }
}

/** Flatten nested tree for a select (id,name,depth) */
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

/** Get all descendant IDs for a given node id using the map */
function getDescendantIds(rootId: number, map: Map<number, any>) {
  const out = new Set<number>()
  function walk(id: number) {
    const node = map.get(id)
    if (!node || !node.children) return
    for (const child of node.children) {
      out.add(child.id)
      walk(child.id)
    }
  }
  walk(rootId)
  return out
}

export default function CategoryTree({ categories, onEdit, onDeleted, onMoved }: Props) {
  const { roots, map } = useMemo(() => buildTree(categories), [categories])
  const selectOpts = useMemo(() => flattenForSelect(roots), [roots])
  const [movingId, setMovingId] = useState<number | null>(null)
  const [moveTarget, setMoveTarget] = useState<number | ''>('')
  const [loadingMove, setLoadingMove] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  // dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor))

  // On drag end — event.active.id is dragged id, event.over?.id is target id
  async function handleDragEnd(event: DragEndEvent) {
    const active = event.active?.id as string | undefined
    const over = event.over?.id as string | undefined
    if (!active) return

    // ids are strings in the format 'cat-<id>'
    const parse = (s?: string) => {
      if (!s) return null
      const m = String(s).match(/^cat-(\d+)$/)
      return m ? Number(m[1]) : null
    }
    const draggedId = parse(active)
    const overId = parse(over)

    // if drop on empty space (overId === null) => make root (parent_id = null)
    if (!draggedId) return

    // dropping onto itself — ignore
    if (overId === draggedId) return

    // compute descendant ids to prevent cycles
    const descendants = getDescendantIds(draggedId, map)
    if (overId !== null && descendants.has(overId)) {
      // invalid: cannot set a descendant as parent
      alert('Invalid move: cannot make a category a child of one of its own descendants.')
      return
    }

    // prepare new parent_id
    const newParent = overId ?? null

    // If parent unchanged, ignore
    const current = map.get(draggedId)
    const currentParent = current?.parent_id ?? null
    if (currentParent === newParent) return

    // call API to update parent
    setLoadingMove(true)
    try {
      const body = { parent_id: newParent }
      const res = await adminFetch(`/v1/admin/categories/${draggedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 401 || res.status === 403) {
        clearAdminToken()
        window.location.href = '/admin/login'
        return
      }
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.message || res.statusText)
      if (onMoved) onMoved()
    } catch (err) {
      alert('Move failed: ' + (err as Error).message)
    } finally {
      setLoadingMove(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete category and (optionally) its children?')) return
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

  // Render tree nodes (each node is both a drag source and a drop target)
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

        {/* Move UI with select (fallback for accessibility) */}
        {movingId === n.id && (
          <div className="mt-2 flex items-center gap-2">
            <select
              value={moveTarget}
              onChange={e => setMoveTarget(e.target.value === '' ? '' : Number(e.target.value))}
              className="p-2 border rounded"
            >
              <option value="">— Move to root —</option>
              {selectOpts
                .filter(o => o.id !== n.id) // don't allow moving onto itself
                .map(o => (
                  // also hide descendants in this dropdown to avoid cycles
                  (!getDescendantIds(n.id, map).has(o.id)) ? (
                    <option key={o.id} value={o.id}>
                      {Array(o.depth).fill('\u00A0\u00A0').join('')}{o.depth > 0 ? '↳ ' : ''}{o.name}
                    </option>
                  ) : null
                ))
              }
            </select>
            <button onClick={async () => {
              // same checks as drag: disallow descendant target
              const tgt = moveTarget === '' ? null : Number(moveTarget)
              if (tgt !== null && getDescendantIds(n.id, map).has(tgt)) {
                alert('Invalid move: cannot set descendant as parent.')
                return
              }
              // call API
              setLoadingMove(true)
              try {
                const payload = { parent_id: tgt }
                const res = await adminFetch(`/v1/admin/categories/${n.id}`, {
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
            }} disabled={loadingMove} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">
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
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div>
        {roots.length === 0 ? (
          <div className="text-gray-500">No categories yet.</div>
        ) : (
          <ul className="space-y-3">
            {renderNodes(roots)}
          </ul>
        )}
      </div>
    </DndContext>
  )
}
