// src/components/SkeletonCard.tsx
'use client'

import React from 'react'

export default function SkeletonCard() {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative w-full h-48 rounded-xl mb-4 bg-gray-200 overflow-hidden">
                <div className="absolute inset-0 shimmer" />
            </div>

            <div className="relative h-4 bg-gray-200 w-3/4 mb-2 rounded overflow-hidden">
                <div className="absolute inset-0 shimmer" />
            </div>

            <div className="relative h-4 bg-gray-200 w-1/3 rounded overflow-hidden">
                <div className="absolute inset-0 shimmer" />
            </div>

            {/* Inline styles for shimmer animation so this works out-of-the-box */}
            <style>{`
        .shimmer {
          position: absolute;
          top: 0;
          left: -150%;
          width: 300%;
          height: 100%;
          background: linear-gradient(90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.5) 40%,
            rgba(255,255,255,0.8) 50%,
            rgba(255,255,255,0.5) 60%,
            rgba(255,255,255,0) 100%);
          transform: translateX(0);
          animation: shimmer 1.1s linear infinite;
          pointer-events: none;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    )
}
