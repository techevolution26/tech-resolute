// src/components/Layout.jsx
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900">
      <header className="border-b bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/techresolute.JPEG" alt="Tech Resolute" width={40} height={40} className="rounded-2xl object-cover" />
              <div>
                <div className="text-lg font-semibold">Tech Resolute</div>
                <div className="text-xs text-gray-500">Tech products & services</div>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <Link href="/services" className="hover:underline">Services</Link>
            <Link href="/products" className="hover:underline">Products</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <a href="mailto:techevo404@gmail.com" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Contact</a>
          </nav>

          <div className="md:hidden">
            <button className="p-2 rounded-lg bg-white shadow-sm">Menu</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>

      <footer className="mt-12 border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Tech Resolute — Built with care • <a href="/privacy" className="underline">Privacy</a>
        </div>
      </footer>
    </div>
  )
}
