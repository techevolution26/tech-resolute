// File: src/app/services/[slug]/page.jsx
// Server component - service detail page
import { notFound } from 'next/navigation'
import Link from 'next/link'


const SERVICES = [
    { title: 'Web & Mobile Development', slug: 'web-mobile-development', summary: 'Responsive websites & mobile apps. Fast MVP delivery.', features: ['Responsive UI (mobile-first)', 'MVP in 2–6 weeks', 'Payment & third-party integrations'], starting: 'KES 5,000' },
    { title: 'Cloud & DevOps', slug: 'cloud-devops', summary: 'Deploy, monitor and scale apps with best practices.', features: ['Infrastructure as Code (Terraform)', 'CI/CD pipelines (GitHub Actions)', 'Monitoring & alerts'], starting: 'KES 15,000' },
    { title: 'IT Support & Maintenance', slug: 'support-maintenance', summary: 'Monthly upkeep, backups and SLA support.', features: ['Daily backups', 'Security patching', 'Priority support hours'], starting: 'KES 3,000 / mo' },
    { title: 'Custom Software Products', slug: 'custom-software-products', summary: 'Ready-made software solutions to jumpstart your business.', features: ['E-commerce platforms', 'Booking & reservation systems', 'CRM solutions'], starting: 'KES 20,000' },
    { title: 'IT Consulting & Strategy', slug: 'it-consulting-strategy', summary: 'Expert advice to align technology with your business goals.', features: ['Technology roadmaps', 'System architecture reviews', 'Vendor selection assistance'], starting: 'KES 10,000' },
    { title: 'Cybersecurity Services', slug: 'cybersecurity-services', summary: 'Protect your digital assets with our comprehensive security solutions.', features: ['Vulnerability assessments', 'Penetration testing', 'Security awareness training'], starting: 'KES 8,000' },
    { title: 'Data Analysis & Visualization', slug: 'data-analysis-visualization', summary: 'Transform data into actionable insights with our analysis and visualization services.', features: ['Data cleaning & preprocessing', 'Custom dashboards', 'Predictive analytics'], starting: 'KES 12,000' },
]


interface ServiceDetailParams {
    params: {
        slug: string;
    };
}

export default async function ServiceDetail({ params }: ServiceDetailParams) {
    const awaitedParams = await params;
    const service = SERVICES.find(s => s.slug === awaitedParams.slug)
    if (!service) return notFound()


    const emailHref = `mailto:techevo404@gmail.com?subject=${encodeURIComponent('Quote request: ' + service.title)}&body=${encodeURIComponent(`Hello,

I need a quote for: ${service.title}

Details:
`)}`;
    const waHref = `https://wa.me/254745880757?text=${encodeURIComponent('Hello, I need a quote for: ' + service.title)}`;


    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <Link href="/services" className="text-indigo-600">← Back to services</Link>


            <header className="mt-4">
                <h1 className="text-2xl font-bold">{service.title}</h1>
                <p className="mt-2 text-gray-600">{service.summary}</p>
                <div className="mt-2 text-sm text-gray-500">Starting at <span className="font-semibold text-gray-800">{service.starting}</span></div>
            </header>


            <section className="mt-6 bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="font-semibold">What you get</h3>
                <ul className="mt-3 list-disc list-inside text-gray-700">
                    {service.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>


                <div className="mt-6 flex gap-3">
                    <a href={emailHref} className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white">Request Quote (Email)</a>
                    <a href={waHref} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 rounded-lg bg-green-600 text-white">Request via WhatsApp</a>
                </div>
            </section>


            <section className="mt-8 text-sm text-gray-600">
                <p>Prefer a more formal request? Reply to the email or reach us on WhatsApp and we’ll schedule a quick call.</p>
            </section>
        </div>
    )
}