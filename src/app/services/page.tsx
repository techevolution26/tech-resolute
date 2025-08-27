// File: src/app/services/page.jsx
// Server component - services listing
import Link from 'next/link'
import { title } from 'process';


const SERVICES = [
    { title: 'Web & Mobile Development', slug: 'web-mobile-development', summary: 'Responsive websites & mobile apps. Fast MVP delivery.', starting: 'KES 5,000' },
    { title: 'Cloud & DevOps', slug: 'cloud-devops', summary: 'Deploy, monitor and scale apps with best practices.', starting: 'KES 15,000' },
    { title: 'IT Support & Maintenance', slug: 'support-maintenance', summary: 'Monthly upkeep, backups and SLA support.', starting: 'KES 3,000 / mo' },
    { title: 'Custom Software Products', slug: 'custom-software-products', summary: 'Ready-made software solutions to jumpstart your business.', starting: 'KES 20,000' },
    { title: 'IT Consulting & Strategy', slug: 'it-consulting-strategy', summary: 'Expert advice to align technology with your business goals.', starting: 'KES 10,000' },
    { title: 'Cybersecurity Services', slug: 'cybersecurity-services', summary: 'Protect your digital assets with our comprehensive security solutions.', starting: 'KES 8,000' },
    { title: 'Data Analysis & Visualization', slug: 'data-analysis-visualization', summary: 'Transform data into actionable insights with our analysis and visualization services.', starting: 'KES 12,000' },
]


export default function ServicesPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Our Services</h1>
                <p className="mt-2 text-gray-600">
                    Choose a service to see details and request a quote (email or WhatsApp).
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SERVICES.map((s) => (
                    <article key={s.slug} className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-semibold">{s.title}</h2>
                        <p className="mt-2 text-gray-600">{s.summary}</p>
                        <div className="mt-4 text-sm text-gray-500">
                            Starting at <span className="font-bold text-gray-800">{s.starting}</span>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <Link href={`/services/${s.slug}`} className="inline-block px-4 py-2 rounded-lg border">
                                View
                            </Link>
                            <a
                                href={`mailto:techevo404@gmail.com?subject=${encodeURIComponent(
                                    'Quote request: ' + s.title
                                )}&body=${encodeURIComponent(
                                    'Hi,\n\nI would like a quote for: ' +
                                    s.title +
                                    '\n\nBriefly describe your needs:\n'
                                )}`}
                                className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white"
                            >
                                Email
                            </a>
                            <a
                                href={`https://wa.me/254745880757?text=${encodeURIComponent(
                                    'Hello, I need a quote for: ' + s.title
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block px-4 py-2 rounded-lg bg-green-600 text-white"
                            >
                                WhatsApp
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}