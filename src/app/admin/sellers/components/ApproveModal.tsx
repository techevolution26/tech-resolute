// src/app/admin/sellers/components/ApproveModal.tsx
'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XMarkIcon, CheckBadgeIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

type ApproveResponse = {
    message?: string
    user_id?: number
    application_id?: number
    [k: string]: unknown
}

type Props = {
    applicationId: number | string
    onSuccess?: (res: ApproveResponse) => void
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
            const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')
            const res = await fetch(`${apiBase}/v1/admin/seller-applications/${applicationId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ notes, notify_email: notify })
            })

            const body = await res.json().catch(() => null) as unknown
            if (!res.ok) {
                const msg = (typeof body === 'object' && body !== null && 'message' in (body as Record<string, unknown>)) ? String((body as Record<string, unknown>).message) : res.statusText
                throw new Error(msg)
            }

            if (onSuccess) onSuccess((body as ApproveResponse) ?? { message: 'approved' })
            if (onClose) onClose()
            router.refresh()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => onClose?.()} />
            <div className="relative max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                            <CheckBadgeIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Approve Seller Application</h3>
                            <p className="text-sm text-gray-600">Create seller account and optionally notify applicant</p>
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
                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <CheckBadgeIcon className="w-4 h-4 text-amber-600" />
                            Approval Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                            placeholder="Add any notes about this approval..."
                        />
                        <div className="text-xs text-gray-500">
                            These notes are for internal use and won&apos;t be shared with the applicant.
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <input
                            type="checkbox"
                            id="notify-applicant"
                            checked={notify}
                            onChange={() => setNotify(!notify)}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notify-applicant" className="flex items-center gap-2 text-sm text-blue-700 cursor-pointer">
                            <EnvelopeIcon className="w-4 h-4" />
                            Send approval email notification to applicant
                        </label>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
                            <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => onClose?.()}
                            className="px-6 py-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-300 border border-gray-300 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <CheckBadgeIcon className="w-4 h-4" />
                                    Approve Application
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}