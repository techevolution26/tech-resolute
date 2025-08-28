

import React from 'react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'


export default function AboutPage() {
    return (
        <Layout>
            <section className="max-w-4xl mx-auto py-12">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">About Tech Resolute</h1>
                    <p className="mt-3 text-gray-600">We help organisations and entrepreneurs build reliable tech — without large upfront costs.</p>
                </div>


                {/* Mission & Vision */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="font-semibold">Our Mission</h3>
                        <p className="mt-2 text-gray-600">To deliver practical, affordable technology and services that help local businesses and organisations go digital and grow.</p>
                    </div>


                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="font-semibold">Our Vision</h3>
                        <p className="mt-2 text-gray-600">To be the go-to tech mall and development partner in the region — trusted by small businesses, churches, and NGOs.</p>
                    </div>
                </div>


                {/* Values */}
                <div className="mt-8">
                    <h3 className="font-semibold">Core values</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="font-semibold">Integrity</div>
                            <div className="mt-1 text-sm text-gray-600">Transparent pricing and clear deliverables.</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="font-semibold">Practicality</div>
                            <div className="mt-1 text-sm text-gray-600">Solutions that solve real problems and are easy to maintain.</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="font-semibold">Partnership</div>
                            <div className="mt-1 text-sm text-gray-600">We work as an extension of your team, not just a vendor.</div>
                        </div>
                    </div>
                </div>


                {/* Team */}
                <div className="mt-8">
                    <h3 className="font-semibold">Team</h3>
                    <p className="mt-2 text-gray-600">Small, focused team. Big results.</p>


                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* team members - replacing with real photos & bios later */}
                        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                                <span className="text-gray-400">JA</span>
                            </div>
                            <div className="mt-3 font-semibold">John Alfred</div>
                            <div className="text-sm text-gray-500">Founder & Lead Dev</div>
                        </div>


                        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                                <span className="text-gray-400">JK</span>
                            </div>
                            <div className="mt-3 font-semibold">Jeremiah Katumo</div>
                            <div className="text-sm text-gray-500">Product & Growth</div>
                        </div>


                        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                                <span className="text-gray-400">SZ</span>
                            </div>
                            <div className="mt-3 font-semibold">Samuel Ziro</div>
                            <div className="text-sm text-gray-500">Operations</div>
                        </div>
                    </div>
                </div>


                {/* Timeline / How we started */}
                <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-semibold">Our story</h3>
                    <p className="mt-2 text-gray-600">Started as a small dev team building websites for local organisations. We then grew into offering full services and small digital products. Today we blend services and products so founders can launch with no big upfront costs.</p>
                </div>


                {/* Call to action */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/services" className="inline-block px-6 py-4 bg-indigo-600 text-white rounded-2xl text-center">Explore our services</Link>
                    <Link href="/products" className="inline-block px-6 py-4 border rounded-2xl text-center">Browse products (Tech Mall)</Link>
                </div>


                {/* Small footer note */}
                <div className="mt-10 text-sm text-gray-500">Want to join our marketplace or work with us? <a href="mailto:techevo404@gmail.com" className="underline">Contact us</a>.</div>
            </section>
        </Layout>
    )
}