// File: src/app/services/[slug]/page.tsx
// Server component - service detail page (TypeScript)

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import Image from 'next/image'

type Service = {
    title: string
    slug: string
    summary: string
    features: string[]
    starting: string
    icon?: string
    image?: string
    description?: string
}

const SERVICES: Service[] = [
    {
        title: 'Web & Mobile Development',
        slug: 'web-mobile-development',
        summary: 'Responsive websites & mobile apps. Fast MVP delivery.',
        features: ['Responsive UI (mobile-first)', 'MVP in 2–6 weeks', 'Payment & third-party integrations', 'SEO optimization', 'Cross-platform compatibility'],
        starting: 'KES 5,000',
        icon: '💻',
        description: 'We create responsive, user-friendly websites and mobile applications that work seamlessly across all devices. Our development process focuses on delivering minimum viable products quickly so you can start testing your ideas in the market.'
    },
    {
        title: 'Cloud & DevOps',
        slug: 'cloud-devops',
        summary: 'Deploy, monitor and scale apps with best practices.',
        features: ['Infrastructure as Code (Terraform)', 'CI/CD pipelines (GitHub Actions)', 'Monitoring & alerts', 'Auto-scaling solutions', 'Containerization with Docker'],
        starting: 'KES 15,000',
        icon: '☁️',
        description: 'Streamline your development and deployment processes with our DevOps expertise. We help you build robust, scalable infrastructure that grows with your business needs.'
    },
    {
        title: 'IT Support & Maintenance',
        slug: 'support-maintenance',
        summary: 'Monthly upkeep, backups and SLA support.',
        features: ['Daily backups', 'Security patching', 'Priority support hours', 'Performance optimization', '24/7 monitoring'],
        starting: 'KES 3,000 / mo',
        icon: '🔧',
        description: 'Keep your systems running smoothly with our comprehensive maintenance and support services. We handle the technical details so you can focus on your business.'
    },
    {
        title: 'Custom Software Products',
        slug: 'custom-software-products',
        summary: 'Ready-made software solutions to jumpstart your business.',
        features: ['E-commerce platforms', 'Booking & reservation systems', 'CRM solutions', 'School / Hospital Management Systems', 'Inventory management'],
        starting: 'KES 20,000',
        icon: '🛠️',
        description: 'Accelerate your business with our pre-built software solutions tailored to your specific industry needs. Customizable and ready to deploy.'
    },
    {
        title: 'IT Consulting & Strategy',
        slug: 'it-consulting-strategy',
        summary: 'Expert advice to align technology with your business goals.',
        features: ['Technology roadmaps', 'System architecture reviews', 'Vendor selection assistance', 'Digital transformation planning', 'Cost optimization'],
        starting: 'KES 10,000',
        icon: '📊',
        description: 'Get expert guidance on how to leverage technology to achieve your business objectives. We help you make informed decisions about your tech stack and digital strategy.'
    },
    {
        title: 'Cybersecurity Services',
        slug: 'cybersecurity-services',
        summary: 'Protect your digital assets with our comprehensive security solutions.',
        features: ['Vulnerability assessments', 'Penetration testing', 'Security awareness training', 'Incident response planning', 'Compliance auditing'],
        starting: 'KES 8,000',
        icon: '🔒',
        description: 'Safeguard your business from cyber threats with our comprehensive security assessments and solutions. Stay compliant and protect your valuable data.'
    },
    {
        title: 'Data Analysis & Visualization',
        slug: 'data-analysis-visualization',
        summary: 'Transform data into actionable insights with our analysis and visualization services.',
        features: ['Data cleaning & preprocessing', 'Custom dashboards', 'Predictive analytics', 'Business intelligence reports', 'Real-time data processing'],
        starting: 'KES 12,000',
        icon: '📈',
        description: 'Turn your data into a competitive advantage with our analytics and visualization services. Make data-driven decisions with clear, actionable insights.'
    },
]

interface ServiceDetailParams {
    params: {
        slug: string
    }
}

export default async function ServiceDetail({ params }: ServiceDetailParams) {
    const awaitedParams = await params; // ensure params is resolved
    const service = SERVICES.find((s) => s.slug === awaitedParams.slug)
    if (!service) return notFound()

    const emailHref = `mailto:techevo404@gmail.com?subject=${encodeURIComponent('Quote request: ' + service.title)}&body=${encodeURIComponent(`Hello,

I need a quote for: ${service.title}

Details:
`)}`
    const waHref = `https://wa.me/254745880757?text=${encodeURIComponent('Hello, I need a quote for: ' + service.title)}`

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Link
                    href="/services"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-6"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to services
                </Link>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-sm border border-indigo-100 mb-8">
                    <div className="flex items-start gap-6">
                        <div className="text-5xl p-4 bg-white rounded-xl shadow-sm">{service.icon}</div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{service.title}</h1>
                            <p className="mt-2 text-lg text-gray-700">{service.summary}</p>
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
                                <span className="text-sm text-gray-500">Starting at</span>
                                <span className="font-bold text-gray-800">{service.starting}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                What you get
                            </h3>
                            <ul className="space-y-3">
                                {service.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-700">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a
                                    href={emailHref}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Request Quote (Email)
                                </a>
                                <a
                                    href={waHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Request via WhatsApp
                                </a>
                            </div>
                        </section>

                        {service.description && (
                            <section className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">About this service</h3>
                                <p className="text-gray-700 leading-relaxed">{service.description}</p>
                            </section>
                        )}
                    </div>

                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">How it works</h3>
                            <div className="space-y-4">
                                {[
                                    { step: '1. Consultation', desc: 'We discuss your requirements and goals' },
                                    { step: '2. Proposal', desc: 'We provide a detailed plan and quote' },
                                    { step: '3. Development', desc: 'We build your solution with regular updates' },
                                    { step: '4. Delivery', desc: 'We deliver the final product and provide support' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-semibold text-indigo-600">{index + 1}</span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-800">{item.step}</div>
                                            <div className="text-sm text-gray-600">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Why choose us?</h3>
                            <ul className="space-y-3">
                                {[
                                    'Fast delivery without compromising quality',
                                    'Transparent pricing with no hidden costs',
                                    'Ongoing support after project completion',
                                    'Expert team with years of experience'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
                            <h3 className="text-lg font-semibold mb-4">Have questions?</h3>
                            <p className="mb-4">We&apos;re here to help you understand how this service can benefit your business.</p>
                            <a
                                href="mailto:techevo404@gmail.com"
                                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                techevo404@gmail.com
                            </a>
                        </section>
                    </div>
                </div>

                <section className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Not sure which service you need?</h3>
                    <p className="text-gray-600 mb-4">We understand that choosing the right service can be challenging. Contact us for a free consultation to discuss your specific needs.</p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="mailto:techevo404@gmail.com"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-100 text-indigo-700 font-medium hover:bg-indigo-200 transition-colors"
                        >
                            Schedule a consultation
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </section>
            </div>
        </Layout>
    )
}