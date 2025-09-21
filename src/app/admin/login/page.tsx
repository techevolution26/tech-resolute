// src/app/admin/login/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setAdminToken } from '@/lib/adminApi'
import Link from 'next/link'

type LoginResponse = {
  token: string
  user?: {
    id: number
    email: string
    name?: string
    is_admin?: boolean
  }
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>('techevo404@gmail.com')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${base}/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const body = await res.json().catch(() => null)

      if (!res.ok) {
        setError(body?.message || body?.error || 'Login failed')
        setLoading(false)
        return
      }

      const data = body as LoginResponse
      if (!data?.token) {
        setError('No token returned from server')
        setLoading(false)
        return
      }

      // store token and redirect
      setAdminToken(data.token)
      // optional: flash a success toast here
      router.push('/admin')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-1">Admin sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in with your admin credentials.</p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <div className="text-xs text-gray-600 mb-1">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="admin@example.com"
              aria-label="Admin email"
            />
          </label>

          <label className="block">
            <div className="text-xs text-gray-600 mb-1">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="••••••••"
              aria-label="Password"
            />
          </label>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600">
              Back
            </Link>
          </div>
        </form>

        <div className="mt-6 text-xs text-gray-400">
          Tip: Use your admin credentials. For local dev you can create an admin user in tinker and generate a token or use the `/api/v1/admin/login` endpoint.
        </div>
      </div>
    </div>
  )
}
