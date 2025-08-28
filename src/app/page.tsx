import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import HeroClient from '@/components/HeroClient'


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900">
      {/* NAV */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/techresolute.JPEG"
            alt="Tech Resolute Logo"
            width={40}
            height={40}
            className="w-10 h-10 rounded-2xl object-cover bg-gray-200"
          />
          <div>
            <div className="text-lg font-semibold">Tech Resolute</div>
            <div className="text-xs text-gray-500">Tech products & services</div>
          </div>
        </div>


        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <Link href="/services" className="hover:underline">Services</Link>
          <Link href="/products" className="hover:underline">Products</Link>
          <a href="#contact" className="hover:underline">Contact</a>
          <Link href="/about" className="hover:underline">About</Link>
        </nav>


        <details className="md:hidden">
          <summary className="p-2 rounded-lg bg-white shadow-sm list-none cursor-pointer">
            Menu
          </summary>

          <nav className="mt-2 flex flex-col gap-3 bg-white rounded-lg p-3 shadow-sm">
            <Link href="/services" className="hover:underline">Services</Link>
            <Link href="/products" className="hover:underline">Products</Link>
            <a href="#contact" className="hover:underline">Contact</a>
            <Link href="/about" className="hover:underline">About</Link>
          </nav>
        </details>
      </header>


      {/* HERO */}
      <main className="max-w-6xl mx-auto px-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-10">
          {/* HeroClient handles client-only animation (framer-motion) */}
          <HeroClient />


          <div className="flex justify-center">
            {/* Placeholder illustration (server-rendered) */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              <svg viewBox="0 0 600 400" className="w-full h-auto">
                <rect x="0" y="0" width="600" height="400" rx="20" fill="#f8fafc" />
                <g transform="translate(40,40)">
                  <rect width="220" height="120" rx="12" fill="#eef2ff">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
                  </rect>
                  <rect x="240" width="320" height="120" rx="12" fill="#fff" stroke="#e6e7ee">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
                  </rect>
                  <rect y="140" width="520" height="180" rx="12" fill="#fff" stroke="#e6e7ee">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" begin="0.8s" repeatCount="indefinite" />
                  </rect>
                </g>
              </svg>
            </div>
          </div>
        </section>


        {/* QUICK SERVICES PREVIEW - links to /services */}
        <section id="services" className="mt-16">
          <h2 className="text-2xl font-bold">Services we offer</h2>
          <p className="mt-2 text-gray-600">Short-term services that generate cashflow while we build your product.</p>


          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Web & Mobile Development', desc: 'Responsive apps and websites with fast delivery.' },
              { title: 'Cloud & DevOps', desc: 'Deploy, monitor and scale with best practices.' },
              { title: 'Support & Maintenance', desc: 'Ongoing upkeep so your systems stay healthy.' }
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="text-lg font-semibold">{s.title}</div>
                <div className="mt-2 text-gray-600">{s.desc}</div>
                <div className="mt-4">
                  <Link href="/services" className="text-indigo-600 font-medium">See details →</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* CONTACT */}
        <section id="contact" className="mt-16 mb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h4 className="font-bold text-lg">Contact & Quote</h4>
            <p className="mt-2 text-gray-600">Send us a message and we’ll reply within 24 hours. For now we accept email and WhatsApp requests.</p>


            <div className="mt-4 grid gap-3">
              <a
                href={`mailto:techevo404@gmail.com?subject=${encodeURIComponent('Quote request')}`}
                className="inline-block px-4 py-3 rounded-2xl bg-indigo-600 text-white font-semibold text-center"
              >
                Email us
              </a>


              <a
                href={`https://wa.me/254745880757?text=${encodeURIComponent('Hello, I need a quote.')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-4 py-3 rounded-2xl bg-green-600 text-white font-semibold text-center"
              >
                WhatsApp
              </a>
            </div>
          </div>


          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h4 className="font-bold">Office</h4>
            <p className="mt-2 text-gray-600">Kilifi — Remote friendly</p>
            <div className="mt-4 text-sm text-gray-500">Business hours: Mon-Fri</div>
          </div>
        </section>


        <footer className="py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Tech Resolute — Built with care
        </footer>
      </main>
    </div>
  )
}