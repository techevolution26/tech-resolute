// src/components/AdminSignOutButton.tsx
'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { clearAdminToken } from '@/lib/adminApi'

export default function AdminSignOutButton() {
  const router = useRouter()
  function logout() {
    clearAdminToken()
    // optional: you might also want to inform backend to revoke token
    router.push('/')
  }

  return (
    <button onClick={logout} className="px-3 py-2 text-sm rounded hover:bg-gray-100">
      Sign out
    </button>
  )
}
