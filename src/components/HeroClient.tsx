'use client'


import React from 'react'
import { motion } from 'framer-motion'


export default function HeroClient() {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="px-1"
        >
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Build. Launch. Scale — <span className="text-indigo-600">without the upfront capital</span>
            </h1>
            <p className="mt-4 text-gray-600 max-w-xl">
                We combine high-quality tech services with scalable digital products so you can get to market fast. Start with an affordable service, fund your product, and grow sustainably.
            </p>


            <div className="mt-6 flex gap-4">
                <a href="#contact" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg">Get a Quote</a>
                <a href="products" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-200">See Products</a>
            </div>


            <div className="mt-6 grid grid-cols-3 gap-3 text-sm text-gray-500">
                <div className="p-3 bg-white rounded-lg shadow-sm">Websites — from KES 5,000</div>
                <div className="p-3 bg-white rounded-lg shadow-sm">MVP Apps — fast delivery</div>
                <div className="p-3 bg-white rounded-lg shadow-sm">Maintenance & Support</div>
            </div>
        </motion.div>
    )
}