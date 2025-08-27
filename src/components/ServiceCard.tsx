// src/components/ServiceCard.jsx
import Link from 'next/link'
import React from 'react'

interface Service {
  title: string;
  summary: string;
  starting: string;
  slug: string;
  tags?: string[];
}

export default function ServiceCard({ service }: { service: Service }) {
  const { title, summary, starting, slug, tags } = service
  const emailHref = `mailto:techevo404@gmail.com?subject=${encodeURIComponent('Quote request: ' + title)}`
  const waHref = `https://wa.me/254745880757?text=${encodeURIComponent('Hello, I need a quote for: ' + title)}`

  return (
    <article className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-gray-600">{summary}</p>
          <div className="mt-3 text-sm text-gray-500">Starting at <span className="font-bold text-gray-800">{starting}</span></div>
          <div className="mt-4 flex gap-3">
            <Link href={`/services/${slug}`} className="inline-block px-4 py-2 rounded-lg border">View</Link>
            <a href={emailHref} className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white">Email</a>
            <a href={waHref} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 rounded-lg bg-green-600 text-white">WhatsApp</a>
          </div>
        </div>

        {/* optional tags / badges */}
        <div className="hidden md:flex flex-col items-end gap-2 self-stretch justify-center">
          {tags?.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 whitespace-nowrap transition-transform duration-200 hover:scale-105 hover:bg-indigo-100 hover:shadow"
              style={{ minWidth: 'max-content', textAlign: 'right' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
