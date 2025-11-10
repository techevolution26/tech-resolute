// src/app/products/[slug]/components/ProductGallery.tsx
'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { normalizeSrc } from '@/lib/normalizeSrc'

type Img = { id?: number; url: string }

export default function ProductGallery({ images, title }: { images: Img[]; title: string }) {
    const [index, setIndex] = useState(0)
    const [open, setOpen] = useState(false)

    const main = images && images.length ? images[index] : null

    function isAbsolute(u?: string) {
        if (!u) return false
        return /^https?:\/\//i.test(u)
    }

    return (
        <div>
            <div className="w-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                {main ? (
                    isAbsolute(main.url) ? (
                        // use plain img if absolute / remote (avoid next/image remote config)
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={main.url}
                            alt={title}
                            className="object-cover w-full h-[420px] cursor-pointer"
                            onClick={() => setOpen(true)}
                        />
                    ) : (
                        <Image
                            src={main.url}
                            alt={title}
                            width={1200}
                            height={800}
                            className="object-cover w-full h-[420px] cursor-pointer"
                            onClick={() => setOpen(true)}
                        />
                    )
                ) : (
                    <div className="w-full h-64 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-sm mt-2">No image</div>
                    </div>
                )}
            </div>

            {images && images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto">
                    {images.map((it, i) => {
                        const src = it.url
                        return (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`flex-shrink-0 w-24 h-16 rounded overflow-hidden border ${i === index ? 'ring-2 ring-indigo-300' : 'border-gray-200'}`}
                                aria-label={`Select image ${i + 1}`}
                            >
                                {isAbsolute(src) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={src} alt={`thumb-${i}`} className="object-cover w-full h-full" />
                                ) : (
                                    <Image src={src} alt={`thumb-${i}`} width={160} height={96} className="object-cover w-full h-full" />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Lightbox modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="relative max-w-5xl w-full rounded">
                        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 z-20 bg-white/90 rounded-full p-2">
                            ✕
                        </button>
                        <div className="bg-black rounded">
                            <div className="w-full h-[80vh] flex items-center justify-center overflow-hidden">
                                {images[index] && isAbsolute(images[index].url) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={images[index].url} alt={`img-${index}`} className="max-h-full object-contain" />
                                ) : (
                                    <Image src={images[index].url} alt={`img-${index}`} width={1600} height={1200} className="max-h-full object-contain" />
                                )}
                            </div>

                            {images.length > 1 && (
                                <div className="flex items-center justify-between p-3 bg-black/60 text-white">
                                    <button onClick={() => setIndex((idx) => (idx <= 0 ? images.length - 1 : idx - 1))}>Prev</button>
                                    <div>{index + 1} / {images.length}</div>
                                    <button onClick={() => setIndex((idx) => (idx >= images.length - 1 ? 0 : idx + 1))}>Next</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
