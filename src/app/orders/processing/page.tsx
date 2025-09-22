'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OrdersProcessingPage() {
  const params = useSearchParams();
  const orderIdParam = params?.get('orderId') ?? undefined;
  const [orderId, setOrderId] = useState<string | undefined>(orderIdParam || undefined);
  const [checkoutUrl, setCheckoutUrl] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<'pending'|'paid'|'error'|undefined>('pending');
  const [message, setMessage] = useState<string>('Waiting for order details…');

  useEffect(() => {
    // listen for messages from opener
    function onMessage(ev: MessageEvent) {
      if (!ev.data || ev.origin !== window.location.origin) return;
      const d = ev.data;
      if (d?.type === 'order') {
        if (d.orderId) setOrderId(String(d.orderId));
        if (d.checkout_url) setCheckoutUrl(d.checkout_url);
        setMessage('Order received. Redirecting to checkout (if provided)…');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    // if checkoutUrl was provided by opener, redirect
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

  async function checkStatus() {
    if (!orderId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/v1/orders/${orderId}`);
      if (!res.ok) {
        setStatus('error');
        setMessage('Failed to fetch order status');
        return;
      }
      const body = await res.json();
      setMessage(`Order #${orderId} status: ${body.status}`);
      setStatus(body.status ?? 'pending');
    } catch (e) {
      setStatus('error');
      setMessage('Network error');
    }
  }

  async function markPaid() {
    if (!orderId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/v1/orders/${orderId}/pay`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to mark paid');
      setStatus('paid');
      setMessage('Payment completed (stub). You can close this window.');
    } catch (e) {
      setStatus('error');
      setMessage('Error marking paid');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Order processing</h2>
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        <div className="space-y-3">
          <div className="text-xs text-gray-500">Order ID: <strong>{orderId ?? '—'}</strong></div>
          <div className="flex gap-2">
            <button onClick={checkStatus} className="px-3 py-2 rounded border">Refresh status</button>
            <button onClick={markPaid} className="px-3 py-2 rounded bg-green-500 text-white">Complete payment (stub)</button>
            <a href="/" className="px-3 py-2 rounded border ml-auto">Return home</a>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          This is a local test page. In production the backend should redirect to a payment gateway.
        </div>
      </div>
    </div>
  );
}
