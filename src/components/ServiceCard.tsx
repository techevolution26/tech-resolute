// src/components/ServiceCard.jsx
'use client'

import Link from 'next/link'
import React from 'react'
import { motion } from 'framer-motion'

type Service = {
  title: string
  summary?: string
  starting?: string
  slug: string
  tags?: string[]
}

type Props = {
  service: Service
  index: number
}

export default function ServiceCard({ service, index }: Props) {
  const { title, summary, starting, slug, tags } = service
  const emailHref = `mailto:techevo404@gmail.com?subject=${encodeURIComponent('Quote request: ' + title)}`
  const waHref = `https://wa.me/254745880757?text=${encodeURIComponent('Hello, I need a quote for: ' + title)}`

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">{title}</h3>
          <p className="mt-2 text-gray-600">{summary}</p>
          <div className="mt-3 text-sm text-gray-500">Starting at <span className="font-bold text-gray-800">{starting}</span></div>
          
          <div className="mt-4 flex flex-wrap gap-3">
            <Link 
              href={`/services/${slug}`} 
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300"
            >
              View details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a 
              href={emailHref} 
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              Email
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <a 
              href={waHref} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              WhatsApp
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>
          </div>
        </div>

        {/* optional tags / badges */}
        <div className="hidden md:flex flex-col items-end gap-2 self-stretch justify-center">
          {tags?.slice(0, 3).map((t) => (
            <motion.span
              key={t}
              whileHover={{ scale: 1.05 }}
              className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full whitespace-nowrap transition-colors duration-200 hover:bg-indigo-100 hover:shadow-sm"
              style={{ minWidth: 'max-content', textAlign: 'right' }}
            >
              {t}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}