'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import HeroClient from '@/components/HeroClient'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-gray-900">
      {/* NAV */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src="/techresolute.JPEG"
              alt="Tech Resolute Logo"
              width={48}
              height={48}
              className="w-12 h-12 rounded-2xl object-cover bg-white shadow-md transition-all duration-300 hover:scale-105"
            />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Tech Resolute</div>
            <div className="text-xs text-gray-500">Tech products & services</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          {['Services', 'Products', 'Contact', 'About'].map((item, index) => (
            <Link
              key={index}
              href={item === 'Contact' ? '#contact' : `/${item.toLowerCase()}`}
              className="relative px-3 py-2 font-medium transition-all duration-300 hover:text-indigo-600 group"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        <details className="md:hidden group">
          <summary className="p-3 rounded-lg bg-white shadow-sm list-none cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>

          <nav className="mt-2 flex flex-col gap-2 bg-white rounded-lg p-3 shadow-lg absolute right-6 w-48 z-10">
            {['Services', 'Products', 'Contact', 'About'].map((item, index) => (
              <Link
                key={index}
                href={item === 'Contact' ? '#contact' : `/${item.toLowerCase()}`}
                className="px-4 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </nav>
        </details>
      </header>

      {/* HERO */}
      <main className="max-w-6xl mx-auto px-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-8 md:mt-16">
          <HeroClient />

          <div className="flex justify-center transform hover:scale-[1.02] transition-transform duration-500">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-indigo-100/50 hover:shadow-2xl transition-all duration-500">
              <div className="relative">
                <svg viewBox="0 0 600 400" className="w-full h-auto">
                  <rect x="0" y="0" width="600" height="400" rx="20" fill="#f0f4ff" />
                  <g transform="translate(40,40)">
                    <rect width="220" height="120" rx="12" fill="#e0e7ff">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
                    </rect>
                    <rect x="240" width="320" height="120" rx="12" fill="#fff" stroke="#c7d2fe">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
                    </rect>
                    <rect y="140" width="520" height="180" rx="12" fill="#fff" stroke="#c7d2fe">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" begin="0.8s" repeatCount="indefinite" />
                    </rect>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK SERVICES PREVIEW */}
        <section id="services" className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Services we offer</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Short-term services that generate cashflow while we build your product.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Web & Mobile Development',
                desc: 'Responsive apps and websites with fast delivery.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: 'Cloud & DevOps',
                desc: 'Deploy, monitor and scale with best practices.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                )
              },
              {
                title: 'Support & Maintenance',
                desc: 'Ongoing upkeep so your systems stay healthy.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              }
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group"
              >
                <div className="mb-5 p-2 bg-indigo-50 rounded-lg w-max">{s.icon}</div>
                <div className="text-xl font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors duration-300">{s.title}</div>
                <div className="mt-3 text-gray-600">{s.desc}</div>
                <div className="mt-6">
                  <Link
                    href="/services"
                    className="inline-flex items-center text-indigo-600 font-medium group-hover:translate-x-1 transition-transform duration-300"
                  >
                    See details
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="mt-28 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Get in touch</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">We&apos;re ready to bring your ideas to life. Reach out to us today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <h4 className="font-bold text-xl text-gray-800 mb-4">Contact & Quote</h4>
              <p className="text-gray-600">Send us a message and we&apos;ll reply within 24 hours. For now we accept email and WhatsApp requests.</p>

              <div className="mt-6 grid gap-4">
                <a
                  href={`mailto:techevo404@gmail.com?subject=${encodeURIComponent('Quote request')}`}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-center hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email us
                </a>

                <a
                  href={`https://wa.me/254745880757?text=${encodeURIComponent('Hello, I need a quote.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-center hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <h4 className="font-bold text-xl text-gray-800 mb-4">Office Information</h4>
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Location</div>
                  <div className="mt-1 text-gray-600">Kilifi — Remote friendly</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 rounded-lg mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Business Hours</div>
                  <div className="mt-1 text-gray-600">Monday - Friday: 9AM - 5PM</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-12 text-center border-t border-gray-200 mt-16">
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
          <div className="text-sm text-gray-500">© {new Date().getFullYear()} Tech Resolute — Built with care</div>
        </footer>
      </main>
    </div>
  )
}