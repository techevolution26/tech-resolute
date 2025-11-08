'use client'
import React, { useEffect, useState } from 'react'

export default function AdminNotifications() {
    const [count, setCount] = useState<number>(0)
    const [items, setItems] = useState<any[]>([])
    const [open, setOpen] = useState(false)

    async function fetchCount() {
        try {
            const res = await fetch('/api/v1/admin/notifications/count', { credentials: 'same-origin' })
            if (!res.ok) return
            const body = await res.json()
            setCount(body.count ?? 0)
        } catch { }
    }

    async function fetchItems() {
        try {
            const res = await fetch('/api/v1/admin/notifications?unread=1&per=10', { credentials: 'same-origin' })
            if (!res.ok) return
            const body = await res.json()
            setItems(Array.isArray(body) ? body : [])
        } catch { }
    }

    useEffect(() => {
        fetchCount()
    }, [])

    async function openDropdown() {
        setOpen(s => !s)
        if (!open) {
            await fetchItems()
            // allow marking read later from list
        }
    }

    async function markRead(id?: string) {
        try {
            const url = id ? `/api/v1/admin/notifications/${id}/mark-read` : '/api/v1/admin/notifications/mark-read'
            await fetch(url, { method: 'POST', credentials: 'same-origin' })
            await fetchCount()
            if (!id) setItems([])
            else setItems(prev => prev.filter(i => i.id !== id))
        } catch { }
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
                        {items.map(it => (
                            <div key={it.id} className="p-2 border rounded">
                                <div className="text-sm">{it.data?.contact_name ?? it.data?.message ?? 'Notification'}</div>
                                <div className="text-xs text-gray-400">{new Date(it.created_at).toLocaleString()}</div>
                                <div className="mt-2 flex gap-2">
                                    <a href={`/admin/seller-applications/${it.data?.application_id ?? ''}`} className="text-xs text-indigo-600">View</a>
                                    <button onClick={() => markRead(it.id)} className="text-xs text-gray-600">Mark read</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
