// src/app/admin/sellers/components/ViewAttachmentModal.tsx
'use client'
import React, { useState } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={() => onClose?.()} />

      <div className="relative max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold text-gray-900">
              Attachment {index + 1} of {images.length}
            </div>
          </div>
          <button
            onClick={() => onClose?.()}
            className="p-2 rounded-xl hover:bg-white/50 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Image Display */}
        <div className="w-full h-[70vh] flex items-center justify-center bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={`attachment-${index}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-medium hover:from-gray-200 hover:to-gray-300 border border-gray-300 transition-all duration-200"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={next}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-medium hover:from-gray-200 hover:to-gray-300 border border-gray-300 transition-all duration-200"
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="text-sm text-gray-500 font-mono max-w-md truncate">
            {images[index]}
          </div>
        </div>
      </div>
    </div>
  )
}