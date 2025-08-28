// src/app/services/page.jsx
import React from 'react'
import Layout from '@/components/Layout'
import ServiceCard from '@/components/ServiceCard'
import Link from 'next/link'

const SERVICES = [
  { title: 'Web & Mobile Development', slug: 'web-mobile-development', summary: 'Responsive websites & mobile apps. Fast MVP delivery.', starting: 'KES 5,000', tags: ['MVP', 'React', 'Mobile', 'Laravel'] },
  { title: 'Cloud & DevOps', slug: 'cloud-devops', summary: 'Deploy, monitor and scale apps with best practices.', starting: 'KES 15,000', tags: ['Cloud', 'CI/CD'] },
  { title: 'IT Support & Maintenance', slug: 'support-maintenance', summary: 'Monthly upkeep, backups and SLA support.', starting: 'KES 3,000 / mo', tags: ['SLA', 'Support'] },
  { title: 'Custom Software Products', slug: 'custom-software-products', summary: 'Ready-made software solutions to jumpstart your business.', starting: 'KES 20,000', tags: ['Product'] },
  { title: 'IT Consulting & Strategy', slug: 'it-consulting-strategy', summary: 'Expert advice to align technology with your business goals.', starting: 'KES 10,000', tags: ['Strategy'] },
  { title: 'Cybersecurity Services', slug: 'cybersecurity-services', summary: 'Protect your digital assets with our comprehensive security solutions.', starting: 'KES 8,000', tags: ['Security'] },
  { title: 'Data Analysis & Visualization', slug: 'data-analysis-visualization', summary: 'Transform data into actionable insights with our analysis and visualization services.', starting: 'KES 12,000', tags: ['Data',] },
]

export default function ServicesPage() {
  return (
    <Layout>
      <div className="mb-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:underline">Home</Link> <span>›</span> <span className="text-gray-700">Services</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold">Our Services</h1>
          <p className="mt-2 text-gray-600">Choose a service to see details and request a quote (email or WhatsApp).</p>
        </header>

        {/* optional trust row */}
        <div className="flex gap-4 items-center mt-6">
          <div className="text-xs text-gray-500">Trusted by</div>
          <div className="flex gap-3">
            <div className="bg-white px-3 py-2 rounded-lg shadow-sm text-sm">Churches</div>
            <div className="bg-white px-3 py-2 rounded-lg shadow-sm text-sm">Local NGO</div>
            <div className="bg-white px-3 py-2 rounded-lg shadow-sm text-sm">Banking Sector</div>
            <div className="bg-white px-3 py-2 rounded-lg shadow-sm text-sm"> Local Super-Markets</div>
          </div>
        </div>
      </div>

      {/* services grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SERVICES.map((s) => <ServiceCard key={s.slug} service={s} />)}
      </section>

      {/* short How we work */}
      <section className="mt-12 bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold">How we work</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
          <div>
            <div className="font-semibold">1. Discovery</div>
            <div className="mt-1 text-gray-600">Quick call to scope the work and timelines.</div>
          </div>
          <div>
            <div className="font-semibold">2. Build</div>
            <div className="mt-1 text-gray-600">Fast iterations, weekly demos and feedback.</div>
          </div>
          <div>
            <div className="font-semibold">3. Deliver</div>
            <div className="mt-1 text-gray-600">Handover, docs and optional support plans.</div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
