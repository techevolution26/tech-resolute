'use client'
import React from 'react'
import Link from 'next/link'
import ProductForm from '../ProductForm'

export default function AdminNewProduct() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create product</h1>
        <Link href="/admin/products" className="text-sm text-gray-500">Back to list</Link>
      </div>

      <ProductForm />
    </div>
  )
}
