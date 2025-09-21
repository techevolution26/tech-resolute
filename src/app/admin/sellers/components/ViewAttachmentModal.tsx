'use client'
import React, { useState } from 'react'

type Props = {
  images: string[]
  startIndex?: number
  onClose?: () => void
}

export default function ViewAttachmentsModal({ images, startIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(Math.max(0, Math.min(startIndex, images.length - 1)))

  function prev() {
    setIndex(i => (i - 1 + images.length) % images.length)
  }
  function next() {
    setIndex(i => (i + 1) % images.length)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => onClose?.()} />

      <div className="relative max-w-3xl w-full mx-4 bg-white rounded-lg p-4 z-10">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-700">Attachment {index + 1} of {images.length}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => onClose?.()} className="px-3 py-1 rounded bg-gray-100">Close</button>
          </div>
        </div>

        <div className="w-full h-[60vh] flex items-center justify-center bg-black rounded">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[index]} alt={`attachment-${index}`} className="max-h-full max-w-full object-contain" />
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <button onClick={prev} className="px-3 py-1 rounded bg-gray-100 mr-2">Prev</button>
            <button onClick={next} className="px-3 py-1 rounded bg-gray-100">Next</button>
          </div>

          <div className="text-xs text-gray-500">{images[index]}</div>
        </div>
      </div>
    </div>
  )
}
