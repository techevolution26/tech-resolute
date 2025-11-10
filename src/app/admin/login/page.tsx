// src/app/admin/login/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setAdminToken, getAdminToken } from '@/lib/adminApi'
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
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // Check if user is already logged in
  useEffect(() => {
    const token = getAdminToken()
    if (token) {
      router.push('/admin')
    }
  }, [router])

  // Show toast notification
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    if (typeof window === 'undefined') return

    const toast = document.createElement('div')
    toast.className = `fixed top-6 right-6 px-6 py-3 rounded-2xl text-white font-medium z-50 transform transition-all duration-300 ${type === 'success'
      ? 'bg-gradient-to-br from-green-600 to-green-700 border border-green-500'
      : 'bg-gradient-to-br from-red-600 to-red-700 border border-red-500'
      }`
    toast.textContent = message

    document.body.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.classList.add('translate-x-0', 'opacity-100')
    }, 10)

    // Remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('translate-x-0', 'opacity-100')
      toast.classList.add('translate-x-full', 'opacity-0')
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 4000)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')
      const res = await fetch(`${base}/v1/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const body = await res.json().catch(() => null)

      if (!res.ok) {
        const errorMessage = body?.message || body?.error || 'Login failed. Please check your credentials.'
        setError(errorMessage)
        showToast(errorMessage, 'error')
        setLoading(false)
        return
      }

      const data = body as LoginResponse
      if (!data?.token) {
        const errorMsg = 'No authentication token received'
        setError(errorMsg)
        showToast(errorMsg, 'error')
        setLoading(false)
        return
      }

      // Store token and redirect
      setAdminToken(data.token)

      // Show success message
      showToast(`Welcome back! Redirecting to dashboard...`, 'success')

      // Brief delay to show success message
      setTimeout(() => {
        router.push('/admin')
      }, 1500)

    } catch (err) {
      const errorMsg = 'Network error. Please check your connection and try again.'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      setLoading(false)
    }
  }

  // Demo credentials helper to remove in production)
  const fillDemoCredentials = () => {
    setEmail('devops@gmail.com')
    setPassword('aliceSecret')
    showToast('Demo credentials filled. Click Sign in to test.', 'success')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 flex items-center justify-center font-bold shadow-lg border border-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">Tech Resolute</div>
              <div className="text-sm text-gray-600 font-medium">Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Access</h1>
            <p className="text-amber-700 text-sm">Sign in with your administrator credentials</p>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <form onSubmit={submit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="admin@company.com"
                    aria-label="Admin email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="••••••••"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </>
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
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
                  <div className="text-red-800 font-medium text-sm">{error}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-sm border border-amber-500 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign in to Dashboard
                    </>
                  )}
                </button>

                {/* Demo Credentials Button (Remove in production) */}
                {/* {process.env.NODE_ENV === 'development' && (
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="w-full px-6 py-3 rounded-xl border border-amber-300 text-amber-700 font-medium hover:bg-amber-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Fill Demo Credentials
                  </button>
                )} */}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Link
                    href="/"
                    className="text-sm text-gray-600 hover:text-amber-700 font-medium transition-colors duration-200 inline-flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                  </Link>

                  {/* Forgot Password Link - Add functionality later */}
                  <button
                    type="button"
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200"
                    onClick={() => showToast('Contact system administrator for password reset.', 'error')}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Card Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Restricted Access
              </div>
              Authorized personnel only. All activities are logged.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}