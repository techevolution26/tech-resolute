
import React from 'react'
import Layout from '@/components/Layout'
import ProductCard from '@/components/ProductCard'
import { MarketplaceBanner } from '@/components/MarketplaceBanner'
import Link from  'next/link'


// sample products (replace with CMS/API later)
const PRODUCTS = [
    // Digital
    { id: 1, slug: 'delivery-app-template', title: 'Delivery App (Template)', price: 'KES 5,000', category: 'Digital — Mobile App', image: '/delivery.jpeg', condition: 'Digital' },
    { id: 2, slug: 'church-management-template', title: 'Church Management Template', price: 'KES 3,000', category: 'Digital — Template', image: '/products/teko-crm.webp', condition: 'Digital' },


    // Physical — accessories
    { id: 10, slug: 'wifi-router-ac1200', title: 'AC1200 WiFi Router', price: 'KES 4,500', category: 'Hardware — Router', image: '/router.webp', condition: 'New' },
    { id: 11, slug: 'smart-plug-kit', title: 'Smart Home Plug Kit', price: 'KES 2,200', category: 'Hardware — Smart Device', image: '/products/smart-plug.webp', condition: 'New' },


    // Refurbished / Laptops
    { id: 20, slug: 'refurbished-lenovo-t460', title: 'Lenovo ThinkPad T460 (Refurbished)', price: 'KES 18,000', category: 'Laptops', image: '/Lenovo ThinkPad T460 .webp', condition: 'Refurbished' },
    { id: 21, slug: 'dell-inspiron-15', title: 'Dell Inspiron 15 (Refurbished)', price: 'KES 22,000', category: 'Laptops', image: '/products/dell-insp-15.webp', condition: 'Refurbished' },
]


export default function ProductsPage() {
  return (
    <Layout>
      <div className="mb-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:underline">Home</Link> <span>›</span> <span className="text-gray-700">Products</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold">Tech Mall — Products</h1>
          <p className="mt-2 text-gray-600">Browse digital and physical tech products. Want to sell on our mall? Become a seller.</p>
        </header>

        <MarketplaceBanner />

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
        </section>

        <section className="mt-12 bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold">Categories</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {['Digital: Apps', 'Templates', 'Routers', 'Smart Devices', 'Cybersecurity Kits', 'Refurbished Laptops', 'Monitors & CPUs'].map((c) => (
              <span key={c} className="text-xs bg-gray-100 px-3 py-1 rounded-full">{c}</span>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}