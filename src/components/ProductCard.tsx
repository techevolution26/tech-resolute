import React from 'react'
import Link from 'next/link'
import Image from 'next/image'


interface Product {
    id: string | number;
    title: string;
    price: string | number;
    category: string;
    image?: string;
    condition?: string;
    slug: string;
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { id, title, price, category, image, condition } = product
    return (
        <article className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Link href={`/products/${product.slug}`}>
                <span className="block">
                    <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {image ? (
                            <Image src={image} alt={title} width={320} height={180} className="object-cover w-full h-full" />
                        ) : (
                            <div className="text-gray-400">No image</div>
                        )}
                    </div>


                    <div className="mt-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">{title}</h3>
                            <div className="text-sm text-gray-700 font-semibold">{price}</div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">{category} {condition ? `• ${condition}` : ''}</div>
                    </div>
                </span>
            </Link>
        </article>
    )
}