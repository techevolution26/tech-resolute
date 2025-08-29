import React from 'react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
    return (
        <Layout>
            <section className="max-w-4xl mx-auto py-12 px-6">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">About Tech Resolute</h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">We help organisations and entrepreneurs build reliable tech — without large upfront costs.</p>
                </div>

                {/* Mission & Vision */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">Our Mission</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">To deliver practical, affordable technology and services that help local businesses and organisations go digital and grow.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">Our Vision</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">To be the go-to tech mall and development partner in the region — trusted by small businesses, churches, and NGOs.</p>
                    </div>
                </div>

                {/* Values */}
                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Our Core Values</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Integrity",
                                description: "Transparent pricing and clear deliverables.",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                )
                            },
                            {
                                title: "Practicality",
                                description: "Solutions that solve real problems and are easy to maintain.",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                )
                            },
                            {
                                title: "Partnership",
                                description: "We work as an extension of your team, not just a vendor.",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                )
                            }
                        ].map((value, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                                <div className="p-2 bg-indigo-50 rounded-lg w-max mb-4">
                                    {value.icon}
                                </div>
                                <div className="font-semibold text-lg text-gray-800 mb-2">{value.title}</div>
                                <div className="text-gray-600">{value.description}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team */}
                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Our Team</h3>
                    <p className="text-center text-gray-600 mb-10">Small, focused team. Big results.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {[
                            {
                                initials: "JA",
                                name: "John Alfred",
                                role: "Founder & Lead Dev",
                                color: "bg-indigo-100 text-indigo-800"
                            },
                            {
                                initials: "JK",
                                name: "Jeremiah Katumo",
                                role: "Product & Growth",
                                color: "bg-purple-100 text-purple-800"
                            },
                            {
                                initials: "SZ",
                                name: "Samuel Ziro",
                                role: "Operations",
                                color: "bg-green-100 text-green-800"
                            }
                        ].map((member, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
                                <div className={`w-24 h-24 ${member.color} rounded-full flex items-center justify-center text-2xl font-bold mb-4`}>
                                    {member.initials}
                                </div>
                                <div className="text-lg font-semibold text-gray-800">{member.name}</div>
                                <div className="text-gray-500">{member.role}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline / How we started */}
                <div className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-sm border border-indigo-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h3>
                    <p className="text-gray-700 leading-relaxed">
                        Started as a small dev team building websites for local organisations. We then grew into offering full services and small digital products. Today we blend services and products so founders can launch with no big upfront costs.
                    </p>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { year: "2019", event: "Started as a small dev team" },
                            { year: "2021", event: "Expanded to offer full services" },
                            { year: "2023", event: "Launched Tech Mall marketplace" }
                        ].map((milestone, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg text-center">
                                <div className="text-lg font-bold text-indigo-600">{milestone.year}</div>
                                <div className="text-sm text-gray-600">{milestone.event}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to action */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        href="/services"
                        className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Explore our services
                    </Link>
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-2xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Browse products (Tech Mall)
                    </Link>
                </div>

                {/* Small footer note */}
                <div className="mt-12 text-center text-sm text-gray-500">
                    Want to join our marketplace or work with us?{" "}
                    <a
                        href="mailto:techevo404@gmail.com"
                        className="text-indigo-600 hover:underline font-medium"
                    >
                        Contact us
                    </a>
                </div>
            </section>
        </Layout>
    )
}