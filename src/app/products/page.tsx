import React from 'react'
import Layout from '@/components/Layout'
import ProductCard from '@/components/ProductCard'
import { MarketplaceBanner } from '@/components/MarketplaceBanner'
import Link from 'next/link'

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

// Category data with icons
const CATEGORIES = [
  { name: 'Digital: Apps', icon: '📱' },
  { name: 'Templates', icon: '🎨' },
  { name: 'Routers', icon: '📶' },
  { name: 'Smart Devices', icon: '🏠' },
  { name: 'Cybersecurity Kits', icon: '🔒' },
  { name: 'Refurbished Laptops', icon: '💻' },
  { name: 'Monitors & CPUs', icon: '🖥️' },
]

export default function ProductsPage() {
  return (
    <Layout>
      <div className="mb-10">
        <nav className="text-sm text-gray-500 mb-6 flex items-center">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">Products</span>
        </nav>

        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Tech Mall — Products</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Browse digital and physical tech products. Want to sell on our mall?{" "}
            <a href="#seller-info" className="text-indigo-600 hover:underline font-medium">
              Become a seller
            </a>
          </p>
        </header>

        <MarketplaceBanner />

        {/* Filter bar (optional - can be implemented later) */}
        <div className="flex flex-wrap items-center justify-between gap-4 my-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-700">Filter by:</div>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium">All</button>
            <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200">Digital</button>
            <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200">Hardware</button>
            <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200">Laptops</button>
          </div>
          <div className="text-xs text-gray-500">{PRODUCTS.length} products</div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>

        {/* Empty state (if no products) */}
        {PRODUCTS.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😢</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600">Check back later for new products.</p>
          </div>
        )}

        <section className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Browse by Category
          </h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map((c) => (
              <div
                key={c.name}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{c.icon}</div>
                <div className="text-xs text-center text-gray-700 group-hover:text-indigo-700 font-medium">{c.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Seller information section */}
        <section id="seller-info" className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-sm border border-indigo-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Become a Seller</h2>
            <p className="mt-2 text-gray-600">Join our marketplace and reach thousands of potential customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Easy Setup",
                description: "Create your seller account in minutes and start listing products",
                icon: "⚡"
              },
              {
                title: "Reach Customers",
                description: "Access our growing customer base interested in tech products",
                icon: "👥"
              },
              {
                title: "Secure Payments",
                description: "Get paid securely through our trusted payment system",
                icon: "💳"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow-sm text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-gray-800 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="mailto:techevo404@gmail.com?subject=Interested in becoming a seller"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Apply to Sell
            </a>
          </div>
        </section>
      </div>
    </Layout>
  )
}