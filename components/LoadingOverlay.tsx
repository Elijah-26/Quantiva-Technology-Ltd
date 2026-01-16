import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  isVisible: boolean
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-md animate-in fade-in duration-500">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-lg mx-4 animate-in zoom-in-95 duration-500 border border-white/20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 rounded-3xl"></div>
        
        <div className="relative space-y-8 text-center">
          {/* Spinning loader with multiple rings */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              {/* Outer ring - slow spin */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" style={{ animationDuration: '3s' }}></div>
              
              {/* Middle ring - medium spin */}
              <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-400 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
              
              {/* Inner ring - fast spin */}
              <div className="absolute inset-6 rounded-full border-4 border-transparent border-t-pink-500 border-r-pink-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
              
              {/* Center pulse */}
              <div className="absolute inset-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse"></div>
            </div>
          </div>

          {/* Coffee emoji with smooth bounce */}
          <div className="relative">
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full blur-xl opacity-50 animate-pulse"></div>
            </div>
            <div className="text-7xl animate-bounce relative">
              ☕
            </div>
          </div>

          {/* Title with gradient */}
          <div className="space-y-3">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              Grab a cup of coffee
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed font-medium">
              Kindly wait, this may take a few minutes to process
            </p>
          </div>

          {/* Email message with icon */}
          <div className="pt-6 border-t-2 border-gray-200">
            <div className="inline-flex items-center gap-3 bg-green-50 px-6 py-3 rounded-full border border-green-200">
              <svg className="w-6 h-6 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-green-800">
                A report of this has been sent to your email
              </p>
            </div>
          </div>

          {/* Animated progress bars */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
              <span>Processing your request...</span>
              <span className="text-blue-600">●</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-3 pt-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce shadow-lg shadow-blue-500/50" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce shadow-lg shadow-purple-500/50" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
            <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce shadow-lg shadow-pink-500/50" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
          </div>

          {/* Subtle message */}
          <p className="text-xs text-gray-500 italic pt-2">
            Please don't close this window
          </p>
        </div>
      </div>
    </div>
  )
}

