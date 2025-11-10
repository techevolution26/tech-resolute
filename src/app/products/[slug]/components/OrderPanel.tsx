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
        el.className = 'fixed bottom-6 right-6 bg-gradient-to-br from-green-600 to-green-700 text-white px-6 py-3 rounded-2xl shadow-lg z-50 font-medium border border-green-500'
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

    // Enhanced validation function
    function validateForm(): boolean {
        const errors: Record<string, string[]> = {}

        if (!name.trim()) {
            errors.customer_name = ['Name is required']
        }

        if (!email.trim()) {
            errors.customer_email = ['Email is required']
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.customer_email = ['Please enter a valid email address']
        }

        if (!phone.trim()) {
            errors.customer_phone = ['Phone number is required']
        }

        if (requireShipping && !shippingAddress.trim()) {
            errors.shipping_address = ['Shipping address is required for delivery orders']
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            setError('Please fix the errors above')
            return false
        }

        return true
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

        // Enhanced client-side validation
        if (!validateForm()) {
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
                customer_name: name.trim(),
                customer_email: email.trim(),
                customer_phone: phone.trim(),
                shipping_address: shippingAddress.trim() || null,
                notes: notes.trim() || null,
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
                    setError(getBodyMessage(body) ?? 'Please check your information and try again')
                } else {
                    setError(getBodyMessage(body) ?? res.statusText ?? 'Order failed. Please try again.')
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
            showToast(`🎉 Order #${orderId} created successfully!`)

            // analytics push (safe)
            try {
                const w = window as unknown as { dataLayer?: unknown[] }
                if (Array.isArray(w.dataLayer)) {
                    ; (w.dataLayer as unknown[]).push({ event: 'order_created', orderId })
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
            setError((e as Error).message || 'Network error. Please check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-green-900">Order Confirmed!</h3>
                        <p className="text-green-700">Your order has been created successfully.</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-green-200 mb-4">
                    <div className="text-sm text-gray-600">Order ID</div>
                    <div className="text-xl font-bold text-gray-900">#{success.id}</div>
                </div>

                {success.checkout_url ? (
                    <a
                        href={success.checkout_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full text-center px-6 py-4 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm border border-green-500"
                    >
                        Continue to Payment
                    </a>
                ) : (
                    <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="text-amber-800 font-medium mb-2">Next Steps</div>
                        <div className="text-amber-700 text-sm">We will contact you shortly to complete your order and arrange payment.</div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="mt-6">
            <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Quantity</label>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200 text-gray-600 hover:text-gray-800"
                                disabled={qty <= 1}
                            >
                                −
                            </button>
                            <input
                                type="number"
                                value={qty}
                                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                                className="w-20 text-center p-3 border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                min="1"
                            />
                            <button
                                type="button"
                                onClick={() => setQty(q => q + 1)}
                                className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200 text-gray-600 hover:text-gray-800"
                            >
                                +
                            </button>
                        </div>
                        <div className="text-sm text-gray-600">
                            Unit price:KES  <span className="font-semibold text-gray-800">{productPrice ?? '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-blue-800 mb-2">Shipping & Contact Information</div>
                            <p className="text-sm text-blue-700 mb-3">
                                Provide your contact details so we can reach you about payment and delivery.
                                Shipping address is required for physical deliveries.
                            </p>
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={requireShipping}
                                    onChange={() => setRequireShipping(r => !r)}
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm text-blue-800 font-medium">This order requires shipping</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Order Button */}
                <button
                    onClick={() => setShowForm(s => !s)}
                    className="w-full px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-sm border border-amber-500 flex items-center justify-center gap-2"
                    aria-expanded={showForm}
                >
                    {showForm ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Hide Order Form
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Buy / Request Quote
                        </>
                    )}
                </button>

                {/* Order Form */}
                {showForm && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${fieldErrors.customer_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your full name"
                                />
                                {fieldErrors.customer_name && (
                                    <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {fieldErrors.customer_name[0]}
                                    </div>
                                )}
                            </div>

                            {/* Email & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${fieldErrors.customer_email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="your@email.com"
                                    />
                                    {fieldErrors.customer_email && (
                                        <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {fieldErrors.customer_email[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${fieldErrors.customer_phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                    {fieldErrors.customer_phone && (
                                        <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {fieldErrors.customer_phone[0]}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Shipping Address {requireShipping ? <span className="text-red-500">*</span> : <span className="text-gray-500">(optional)</span>}
                                </label>
                                <textarea
                                    value={shippingAddress}
                                    onChange={e => setShippingAddress(e.target.value)}
                                    rows={3}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${fieldErrors.shipping_address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    placeholder={requireShipping ? "Enter your complete shipping address..." : "Shipping address (if required)..."}
                                />
                                {fieldErrors.shipping_address && (
                                    <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {fieldErrors.shipping_address[0]}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Order Notes <span className="text-gray-500">(optional)</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                    placeholder="Any special instructions or requirements..."
                                />
                                {fieldErrors.notes && (
                                    <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {fieldErrors.notes[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div className="text-red-800 font-medium">{error}</div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                onClick={createOrder}
                                disabled={loading}
                                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-sm border border-green-500 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Processing Order...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Proceed & Pay
                                    </>
                                )}
                            </button>

                            <a
                                href={`mailto:techevo404@gmail.com?subject=${encodeURIComponent('Purchase enquiry: ' + productTitle)}&body=${encodeURIComponent(`Hi,\n\nI want to buy ${productTitle} (quantity: ${qty}). Please advise next steps.\n\nThanks`)}`}
                                className="px-6 py-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 inline-flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email Seller
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}