'use client'
import React, { useEffect, useState } from 'react'

type NotificationData = Record<string, unknown>

type NotificationItem = {
    id: string
    created_at?: string | null
    data?: NotificationData
    read_at?: string | null
    [k: string]: unknown
}

export default function AdminNotifications() {
    const [count, setCount] = useState<number>(0)
    const [items, setItems] = useState<NotificationItem[]>([])
    const [open, setOpen] = useState(false)

    async function fetchCount() {
        try {
            const res = await fetch('/api/v1/admin/notifications/count', { credentials: 'same-origin' })
            if (!res.ok) return
            const body = await res.json().catch(() => null) as unknown
            if (body && typeof body === 'object') {
                const num = (body as Record<string, unknown>)['count']
                setCount(typeof num === 'number' ? num : Number(num ?? 0))
            }
        } catch {
            // ignore
        }
    }

    async function fetchItems() {
        try {
            const res = await fetch('/api/v1/admin/notifications?unread=1&per=10', { credentials: 'same-origin' })
            if (!res.ok) return
            const body = await res.json().catch(() => null) as unknown
            if (Array.isArray(body)) {
                const arr = body.filter(i => i && typeof i === 'object') as unknown[]
                const mapped = arr.map((it) => {
                    const rec = it as Record<string, unknown>
                    return {
                        id: String(rec['id'] ?? ''),
                        created_at: rec['created_at'] ? String(rec['created_at']) : null,
                        data: (rec['data'] && typeof rec['data'] === 'object') ? (rec['data'] as NotificationData) : {},
                        read_at: rec['read_at'] ? String(rec['read_at']) : null
                    } as NotificationItem
                })
                setItems(mapped)
            } else {
                setItems([])
            }
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        fetchCount()
    }, [])

    async function openDropdown() {
        setOpen(s => !s)
        if (!open) {
            await fetchItems()
        }
    }

    async function markRead(id?: string) {
        try {
            const url = id ? `/api/v1/admin/notifications/${encodeURIComponent(id)}/mark-read` : '/api/v1/admin/notifications/mark-read'
            await fetch(url, { method: 'POST', credentials: 'same-origin' })
            await fetchCount()
            if (!id) setItems([])
            else setItems(prev => prev.filter(i => i.id !== id))
        } catch {
            // ignore
        }
    }

    return (
        <div className="relative">
            <button onClick={openDropdown} className="relative px-3 py-2">
                Notifications
                {count > 0 && <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs w-5 h-5">{count}</span>}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow z-50 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Unread</div>
                        <button onClick={() => markRead()} className="text-xs text-indigo-600">Mark all read</button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-auto">
                        {items.length === 0 && <div className="text-xs text-gray-500">No unread notifications</div>}
                        {items.map(it => {
                            const created = it.created_at ? (() => {
                                try { return new Date(it.created_at as string).toLocaleString() } catch { return String(it.created_at) }
                            })() : ''
                            const contactName = it.data && typeof it.data === 'object' ? (String(it.data['contact_name'] ?? it.data['name'] ?? '')) : ''
                            const message = it.data && typeof it.data === 'object' ? (String(it.data['message'] ?? '')) : ''
                            const appId = it.data && typeof it.data === 'object' ? (String(it.data['application_id'] ?? '')) : ''
                            return (
                                <div key={it.id} className="p-2 border rounded">
                                    <div className="text-sm">{contactName || message || 'Notification'}</div>
                                    <div className="text-xs text-gray-400">{created}</div>
                                    <div className="mt-2 flex gap-2">
                                        <a href={`/admin/seller-applications/${appId}`} className="text-xs text-indigo-600">View</a>
                                        <button onClick={() => markRead(it.id)} className="text-xs text-gray-600">Mark read</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
