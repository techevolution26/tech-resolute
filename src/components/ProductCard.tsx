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

    const getConditionColor = (condition: string) => {
        switch (condition?.toLowerCase()) {
            case 'new': return 'bg-green-100 text-green-800';
            case 'refurbished': return 'bg-blue-100 text-blue-800';
            case 'digital': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <article className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group">
            <Link href={`/products/${product.slug}`}>
                <span className="block">
                    <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
                        {image ? (
                            <Image
                                src={image}
                                alt={title}
                                width={320}
                                height={180}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs mt-1">No image</span>
                            </div>
                        )}

                        {condition && (
                            <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(condition)}`}>
                                {condition}
                            </span>
                        )}
                    </div>

                    <div className="mt-4">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors line-clamp-2" title={title}>
                                {title}
                            </h3>
                            <div className="text-sm font-bold text-indigo-600 whitespace-nowrap pl-2">{price}</div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {category}
                        </div>
                    </div>
                </span>
            </Link>
        </article>
    )
}