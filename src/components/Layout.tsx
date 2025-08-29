// src/components/Layout.jsx
'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Layout({ children }: { children?: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900">
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-white/60 backdrop-blur-sm py-4'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Image 
                  src="/techresolute.JPEG" 
                  alt="Tech Resolute" 
                  width={40} 
                  height={40} 
                  className="rounded-2xl object-cover shadow-sm group-hover:shadow-md transition-shadow" 
                />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              </motion.div>
              <div>
                <div className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Tech Resolute</div>
                <div className="text-xs text-gray-500">Tech products & services</div>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {[
              { href: '/services', label: 'Services' },
              { href: '/products', label: 'Products' },
              { href: '/about', label: 'About' },
            ].map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`relative px-1 py-2 font-medium transition-colors duration-300 ${pathname === item.href ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
            <a 
              href="mailto:techevo404@gmail.com" 
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              Contact
            </a>
          </nav>

          <details className="md:hidden group">
            <summary className="p-2 rounded-lg bg-white shadow-sm list-none cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>

            <nav className="mt-2 flex flex-col gap-2 bg-white rounded-lg p-3 shadow-lg absolute right-6 w-48 z-10">
              {[
                { href: '/services', label: 'Services' },
                { href: '/products', label: 'Products' },
                { href: '/about', label: 'About' },
                { href: 'mailto:techevo404@gmail.com', label: 'Contact' },
              ].map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-10">
        {children}
      </main>

      <footer className="mt-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Image
              src="/techresolute.JPEG"
              alt="Tech Resolute Logo"
              width={24}
              height={24}
              className="w-6 h-6 rounded-lg object-cover"
            />
            <span className="font-semibold text-gray-800">Tech Resolute</span>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Tech Resolute — Built with care • <a href="/privacy" className="underline hover:text-indigo-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}