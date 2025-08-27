// LandingPage.jsx
// Single-file React component (Tailwind + Framer Motion)
// - Default export: LandingPage

import React from 'react'
import Image from 'next/image'
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
      <a href="#services" className="hover:underline">Services</a>
      <a href="#product" className="hover:underline">Product</a>
      <a href="#pricing" className="hover:underline">Pricing</a>
      <a href="#contact" className="px-4 py-2 bg-white rounded-xl shadow-sm">Contact</a>
    </nav>
    <button className="md:hidden p-2 rounded-lg bg-white shadow-sm">Menu</button>
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
<rect width="220" height="120" rx="12" fill="#eef2ff" />
<rect x="240" width="320" height="120" rx="12" fill="#fff" stroke="#e6e7ee" />
<rect y="140" width="520" height="180" rx="12" fill="#fff" stroke="#e6e7ee" />
</g>
</svg>
</div>
</div>
</section>
{/* SERVICES */}
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
<a href="#contact" className="text-indigo-600 font-medium">Start from KES 5,000 →</a>
</div>
</div>
))}
</div>
</section>


{/* PRODUCT */}
<section id="product" className="mt-16">
<h2 className="text-2xl font-bold">Flagship product — Teko CRM</h2>
<p className="mt-2 text-gray-600 max-w-xl">A lightweight CRM for small organisations to manage members, contributions, and events.</p>


<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
<div className="bg-white rounded-2xl p-6 shadow-sm">
<ul className="space-y-3 text-gray-700">
<li>• Member management & attendance</li>
<li>• Donations & contribution tracking</li>
<li>• Simple reporting & export</li>
</ul>
<div className="mt-4">
<a href="#contact" className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Request Demo</a>
</div>
</div>
<div className="bg-white rounded-2xl p-6 shadow-sm">
<div className="text-sm text-gray-500">Screenshot</div>
<div className="mt-4 w-full h-44 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">App preview</div>
</div>
</div>
</section>
{/* PRICING */}
<section id="pricing" className="mt-16">
<h3 className="text-xl font-bold">Pricing</h3>
<p className="mt-2 text-gray-600">Simple transparent pricing so clients can start small.</p>


<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-white p-6 rounded-2xl shadow-sm">
<div className="text-lg font-semibold">Starter</div>
<div className="mt-2 text-gray-600">For basic websites & small apps</div>
<div className="mt-4 font-bold text-2xl">KES 5,000</div>
<div className="mt-4">
<a href="#contact" className="inline-block px-4 py-2 rounded-lg border">Order</a>
</div>
</div>


<div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
<div className="text-lg font-semibold">Growth</div>
<div className="mt-2 text-indigo-200">MVPs, integrations, cloud setup</div>
<div className="mt-4 font-bold text-2xl">KES 25,000+</div>
<div className="mt-4">
<a href="#contact" className="inline-block px-4 py-2 rounded-lg bg-white text-indigo-600 font-semibold">Get Started</a>
</div>
</div>


<div className="bg-white p-6 rounded-2xl shadow-sm">
<div className="text-lg font-semibold">Support</div>
<div className="mt-2 text-gray-600">Monthly maintenance & SLA</div>
<div className="mt-4 font-bold text-2xl">KES 3,000 / mo</div>
<div className="mt-4">
<a href="#contact" className="inline-block px-4 py-2 rounded-lg border">Subscribe</a>
</div>
</div>
</div>
</section>


{/* CONTACT */}
<section id="contact" className="mt-16 mb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="bg-white p-6 rounded-2xl shadow-sm">
<h4 className="font-bold text-lg">Contact & Quote</h4>
<p className="mt-2 text-gray-600">Send us a message and we’ll reply within 24 hours.</p>
<form className="mt-4 grid gap-3">
<input placeholder="Full name" className="p-3 rounded-lg border" />
<input placeholder="Email or WhatsApp" className="p-3 rounded-lg border" />
<textarea placeholder="Short message" className="p-3 rounded-lg border" rows={4} />
<button className="px-4 py-3 rounded-2xl bg-indigo-600 text-white font-semibold">Send</button>
</form>
</div>


<div className="bg-white p-6 rounded-2xl shadow-sm">
<h4 className="font-bold">Office</h4>
<p className="mt-2 text-gray-600">Nairobi — Remote friendly</p>
<div className="mt-4 text-sm text-gray-500">Business hours: Mon-Fri</div>
</div>
</section>


<footer className="py-8 text-center text-sm text-gray-500">
© {new Date().getFullYear()} Teko Labs — Built with care
</footer>
</main>
</div>
)
}