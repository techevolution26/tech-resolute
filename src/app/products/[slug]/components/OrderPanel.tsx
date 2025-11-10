'use client'
import React, { useState } from 'react'

type Props = {
    productId: number
    productTitle: string
    productPrice?: string | number
}

export default function OrderPanel({ productId, productTitle, productPrice }: Props) {
    const [showForm, setShowForm] = useState(false)
    const [qty, setQty] = useState<number>(1)
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [shippingAddress, setShippingAddress] = useState<string>('')
    const [notes, setNotes] = useState<string>('')
    const [requireShipping, setRequireShipping] = useState<boolean>(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
    const [success, setSuccess] = useState<{ id: number; checkout_url?: string } | null>(null)

    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')

    function showToast(msg: string) {
        if (typeof window === 'undefined') return
        const id = 'toast-' + Date.now()
        const el = document.createElement('div')
        el.id = id
        el.textContent = msg
        el.className = 'fixed bottom-6 right-6 bg-indigo-600 text-white px-4 py-2 rounded shadow-lg z-50'
        document.body.appendChild(el)
        setTimeout(() => {
            const e = document.getElementById(id)
            if (e) e.remove()
        }, 4000)
    }

    // safe body message extractor
    function getBodyMessage(body: unknown): string | null {
        if (!body || typeof body !== 'object') return null
        const b = body as Record<string, unknown>
        if (typeof b.message === 'string') return b.message
        if (typeof b.error === 'string') return b.error
        return null
    }

    async function createOrder() {
        setError(null)
        setFieldErrors({})

        if (!productId) {
            setError('Invalid product.')
            return
        }
        if (qty < 1) {
            setError('Quantity must be at least 1.')
            return
        }
        if (requireShipping && shippingAddress.trim().length === 0) {
            setError('Shipping address is required.')
            return
        }

        // open the friendly processing page (must be same-origin)
        const processingUrl = '/orders/processing'
        const paymentWin = (() => {
            try { return window.open(processingUrl, '_blank', 'noopener,noreferrer') }
            catch { return null }
        })()

        setLoading(true)
        try {
            const payload = {
                product_id: productId,
                quantity: qty,
                customer_name: name || null,
                customer_email: email || null,
                customer_phone: phone || null,
                shipping_address: shippingAddress || null,
                notes: notes || null,
            }

            const res = await fetch(`${apiBase}/v1/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
            })

            const body = await res.json().catch(() => null) as unknown

            if (!res.ok) {
                if (res.status === 422 && body && typeof body === 'object' && (body as Record<string, unknown>)['errors']) {
                    setFieldErrors((body as Record<string, unknown>)['errors'] as Record<string, string[]>)
                    setError(getBodyMessage(body) ?? 'Validation failed')
                } else {
                    setError(getBodyMessage(body) ?? res.statusText ?? 'Order failed')
                }

                if (paymentWin) {
                    try {
                        paymentWin.postMessage({ type: 'order_error', message: getBodyMessage(body) ?? 'Order failed' }, window.location.origin)
                    } catch { /* ignore */ }
                }

                setLoading(false)
                return
            }

            const orderId = Number((body && typeof body === 'object' && 'id' in (body as Record<string, unknown>)) ? ((body as Record<string, unknown>)['id']) : ((body as Record<string, unknown>)['order_id'] ?? -1))
            const checkoutUrl = (body && typeof body === 'object') ? ((body as Record<string, unknown>)['checkout_url'] as string | undefined) : undefined

            // optimistic success / toast / analytics
            setSuccess({ id: orderId, checkout_url: checkoutUrl })
            showToast(`Order created — #${orderId}`)

            // analytics push (safe)
            try {
                const w = window as unknown as { dataLayer?: unknown[] }
                if (Array.isArray(w.dataLayer)) {
                    ; (w.dataLayer as unknown[]).push({ event: 'order_created', orderId })
                } else {
                    // fallback dev log
                    // eslint-disable-next-line no-console
                    console.log('ANALYTICS order_created', { orderId })
                }
            } catch {
                // ignore analytics errors
            }

            // tell the processing window about the order (so it can redirect or poll)
            if (paymentWin) {
                try {
                    paymentWin.postMessage({ type: 'order', orderId, checkout_url: checkoutUrl }, window.location.origin)
                } catch {
                    // fallback: open checkout url directly
                    if (checkoutUrl) window.open(checkoutUrl, '_blank')
                }
            } else {
                if (checkoutUrl) window.open(checkoutUrl, '_blank')
            }
        } catch (err: unknown) {
            const e = err instanceof Error ? err : { message: String(err) }
            setError((e as Error).message || 'Network error')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="mt-4">
                <div className="text-sm text-green-700 font-medium">Order created — #{success.id}</div>
                {success.checkout_url ? (
                    <a href={success.checkout_url} target="_blank" rel="noreferrer" className="mt-2 inline-block px-4 py-2 rounded bg-indigo-600 text-white">
                        Continue to payment
                    </a>
                ) : (
                    <div className="mt-2 text-sm text-gray-700">We will contact you shortly to complete the order.</div>
                )}
            </div>
        )
    }

    return (
        <div className="mt-4">
            <div className="grid grid-cols-1 gap-3">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded">
                        <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2">−</button>
                        <input
                            type="number"
                            value={qty}
                            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                            className="w-20 text-center p-2"
                        />
                        <button type="button" onClick={() => setQty(q => q + 1)} className="px-3 py-2">+</button>
                    </div>
                    <div className="text-sm text-gray-600">Unit: {productPrice ?? '—'}</div>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={() => setShowForm(s => !s)}
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
                            aria-expanded={showForm}
                        >
                            {showForm ? 'Hide order form' : 'Buy / Request'}
                        </button>
                    </div>
                </div>

                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                    <strong className="text-sm text-gray-800">Shipping & response info</strong>
                    <p className="mt-1">Provide a name, email or phone so we can contact you about payment and delivery. Shipping address is required for delivery orders.</p>
                    <label className="inline-flex items-center gap-2 mt-2">
                        <input type="checkbox" checked={requireShipping} onChange={() => setRequireShipping(r => !r)} />
                        <span className="text-xs text-gray-700">Require shipping address for this order</span>
                    </label>
                </div>

                {showForm && (
                    <div className="mt-3 bg-white p-4 rounded-lg border">
                        <div>
                            <label className="block text-xs text-gray-600">Your name</label>
                            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" />
                            {fieldErrors.customer_name && <div className="text-red-600 text-xs mt-1">{fieldErrors.customer_name[0]}</div>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                                <label className="block text-xs text-gray-600">Email</label>
                                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
                                {fieldErrors.customer_email && <div className="text-red-600 text-xs mt-1">{fieldErrors.customer_email[0]}</div>}
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600">Phone</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded" />
                                {fieldErrors.customer_phone && <div className="text-red-600 text-xs mt-1">{fieldErrors.customer_phone[0]}</div>}
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="block text-xs text-gray-600">
                                Shipping address {requireShipping ? <span className="text-red-600">*</span> : <span className="text-gray-400">(optional)</span>}
                            </label>
                            <textarea
                                value={shippingAddress}
                                onChange={e => setShippingAddress(e.target.value)}
                                rows={3}
                                className="w-full p-2 border rounded"
                                required={requireShipping}
                            />
                            {fieldErrors.shipping_address && <div className="text-red-600 text-xs mt-1">{fieldErrors.shipping_address[0]}</div>}
                        </div>

                        <div className="mt-3">
                            <label className="block text-xs text-gray-600">Notes (optional)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2 border rounded" />
                            {fieldErrors.notes && <div className="text-red-600 text-xs mt-1">{fieldErrors.notes[0]}</div>}
                        </div>

                        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

                        <div className="mt-3 flex gap-3">
                            <button onClick={createOrder} disabled={loading} className="px-4 py-3 rounded-xl bg-indigo-600 text-white">
                                {loading ? 'Processing…' : `Proceed & pay`}
                            </button>

                            <a
                                href={`mailto:techevo404@gmail.com?subject=${encodeURIComponent('Purchase enquiry: ' + productTitle)}&body=${encodeURIComponent(`Hi,\n\nI want to buy ${productTitle} (quantity: ${qty}). Please advise next steps.\n\nThanks`)}`}
                                className="px-4 py-3 rounded-xl border text-sm text-gray-700 inline-flex items-center justify-center"
                            >
                                Email seller
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
