'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HeroClient() {
    // Animation variants for staggered children
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="px-1"
        >
            <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-5xl font-extrabold leading-tight"
            >
                Build. Launch. Scale — <motion.span
                    className="text-indigo-600"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >without the upfront capital</motion.span>
            </motion.h1>

            <motion.p
                variants={itemVariants}
                className="mt-4 text-gray-600 max-w-xl"
            >
                We combine high-quality tech services with scalable digital products so you can get to market fast. Start with an affordable service, fund your product, and grow sustainably.
            </motion.p>

            <motion.div
                variants={itemVariants}
                className="mt-6 flex flex-wrap gap-4"
            >
                <motion.a
                    href="#contact"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    Get a Quote
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </motion.a>

                <Link href="/products" passHref >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-300 cursor-pointer"
                    >
                        See Products
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </motion.div>
                </Link>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm"
            >
                {[
                    { text: "Websites — from KES 5,000", icon: "🌐" },
                    { text: "MVP Apps — fast delivery", icon: "🚀" },
                    { text: "Maintenance & Support", icon: "🔧" }
                ].map((item, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 transition-all duration-300"
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-gray-700">{item.text}</span>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    )
}