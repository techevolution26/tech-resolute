//src/app/admin/seller-applications/components/ApproveModal.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
    applicationId: number | string
    onSuccess?: (res: any) => void
    onClose?: () => void
}

export default function ApproveModal({ applicationId, onSuccess, onClose }: Props) {
    const [notes, setNotes] = useState('')
    const [notify, setNotify] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function submit() {
        setError(null)
        setLoading(true)
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('ADMIN_TOKEN') : null
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/seller-applications/${applicationId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ notes, notify_email: notify })
            })

            const body = await res.json().catch(() => null)
            if (!res.ok) throw new Error(body?.message || res.statusText)

            if (onSuccess) onSuccess(body)
            if (onClose) onClose()
            // optional: refresh the page or route
            router.refresh()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => onClose?.()} />
            <div className="relative max-w-xl w-full bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Approve seller application</h3>
                <p className="text-sm text-gray-600 mb-4">Write brief notes and choose whether to notify the applicant.</p>

                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    className="w-full p-3 border rounded mb-3"
                    placeholder="Admin notes (optional)"
                />

                <label className="flex items-center gap-2 text-sm mb-4">
                    <input type="checkbox" checked={notify} onChange={() => setNotify(!notify)} />
                    <span>Send approval email to applicant</span>
                </label>

                {error && <div className="text-red-600 mb-3">{error}</div>}

                <div className="flex justify-end gap-3">
                    <button onClick={() => onClose?.()} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
                    <button onClick={submit} disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white">
                        {loading ? 'Approving…' : 'Approve'}
                    </button>
                </div>
            </div>
        </div>
    )
}
