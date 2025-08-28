import React from 'react'
import Link from 'next/link'


export function MarketplaceBanner() {
    return (
        <div className="bg-indigo-50 border-l-4 border-indigo-200 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="font-semibold">Sell on Tech Mall</div>
                    <div className="text-sm text-gray-600">List your products, reach our customers and manage orders when we onboard the marketplace.</div>
                </div>
                <div>
                    <Link href="/sell-with-us" className="px-3 py-2 bg-indigo-600 text-white rounded-lg">Become a seller</Link>
                </div>
            </div>
        </div>
    )
}