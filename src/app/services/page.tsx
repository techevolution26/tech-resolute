// src/app/services/page.jsx
'use client'

import React from 'react'
import Layout from '@/components/Layout'
import ServiceCard from '@/components/ServiceCard'
import Link from 'next/link'
import { motion } from 'framer-motion'

const SERVICES = [
  { title: 'Web & Mobile Development', slug: 'web-mobile-development', summary: 'Responsive websites & mobile apps. Fast MVP delivery.', starting: 'KES 5,000', tags: ['MVP', 'React', 'Mobile', 'Laravel'] },
  { title: 'Cloud & DevOps', slug: 'cloud-devops', summary: 'Deploy, monitor and scale apps with best practices.', starting: 'KES 15,000', tags: ['Cloud', 'CI/CD'] },
  { title: 'IT Support & Maintenance', slug: 'support-maintenance', summary: 'Monthly upkeep, backups and SLA support.', starting: 'KES 3,000 / mo', tags: ['SLA', 'Support'] },
  { title: 'Custom Software Products', slug: 'custom-software-products', summary: 'Ready-made software solutions to jumpstart your business.', starting: 'KES 20,000', tags: ['Product'] },
  { title: 'IT Consulting & Strategy', slug: 'it-consulting-strategy', summary: 'Expert advice to align technology with your business goals.', starting: 'KES 10,000', tags: ['Strategy'] },
  { title: 'Cybersecurity Services', slug: 'cybersecurity-services', summary: 'Protect your digital assets with our comprehensive security solutions.', starting: 'KES 8,000', tags: ['Security'] },
  { title: 'Data Analysis & Visualization', slug: 'data-analysis-visualization', summary: 'Transform data into actionable insights with our analysis and visualization services.', starting: 'KES 12,000', tags: ['Data'] },
]

const TRUSTED_BY = [
  { name: 'Churches', icon: '⛪' },
  { name: 'Local NGO', icon: '🤝' },
  { name: 'Banking Sector', icon: '🏦' },
  { name: 'Local Super-Markets', icon: '🛒' },
]

export default function ServicesPage() {
  return (
    <Layout>
      <div className="mb-10">
        <nav className="text-sm text-gray-500 mb-6 flex items-center">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link> 
          <span className="mx-2">›</span> 
          <span className="text-gray-700 font-medium">Services</span>
        </nav>

        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Our Services</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Choose a service to see details and request a quote via email or WhatsApp. We offer tailored solutions to meet your specific needs.</p>
        </motion.header>

        {/* trust row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center mt-10 mb-12"
        >
          <div className="text-sm text-gray-500 mb-4">Trusted by organizations across industries</div>
          <div className="flex flex-wrap justify-center gap-3">
            {TRUSTED_BY.map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -3 }}
                className="bg-white px-4 py-3 rounded-xl shadow-sm flex items-center gap-2 text-sm transition-all duration-300 hover:shadow-md"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* services grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((service, index) => (
          <ServiceCard key={service.slug} service={service} index={index} />
        ))}
      </section>

      {/* How we work section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-sm border border-indigo-100"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6">How we work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              step: '1. Discovery', 
              description: 'Quick call to scope the work and timelines.',
              icon: '🔍'
            },
            { 
              step: '2. Build', 
              description: 'Fast iterations, weekly demos and feedback.',
              icon: '🛠️'
            },
            { 
              step: '3. Deliver', 
              description: 'Handover, docs and optional support plans.',
              icon: '🚀'
            }
          ].map((item, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="font-semibold text-lg text-gray-800 mb-2">{item.step}</div>
              <div className="text-gray-600">{item.description}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-16 text-center"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to get started?</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Contact us today to discuss your project requirements and get a personalized quote.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:techevo404@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            Email us
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
          <a
            href="https://wa.me/254745880757"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            WhatsApp us
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </a>
        </div>
      </motion.section>
    </Layout>
  )
}