'use client'

import React, { useState, useEffect } from 'react'

interface LoadingOverlayProps {
  isVisible: boolean
}

const CRAWL_STAGES = [
  'Discovering sources...',
  'Crawling web data...',
  'Extracting insights...',
  'Analyzing market signals...',
  'Building your report...',
]

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(() => {
      setStageIndex((i) => (i + 1) % CRAWL_STAGES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/98 backdrop-blur-md animate-in fade-in duration-500">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-md mx-4">
        {/* Main card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-950/95 shadow-2xl shadow-black/50">
          {/* Crawling simulation */}
          <div className="relative p-8">
            <div className="flex flex-col items-center gap-6">
              {/* Network graph with crawling animation */}
              <div className="relative w-64 h-48 flex items-center justify-center">
                <svg
                  viewBox="0 0 260 180"
                  className="w-full h-full text-slate-700"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="crawl-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Edges - crawl path (drawn as gradient stroke that animates) */}
                  <path
                    id="crawl-path"
                    d="M 40 90 L 90 40 L 170 40 L 220 90 L 170 140 L 90 140 Z M 90 40 L 130 90 L 90 140 M 170 40 L 130 90 L 170 140"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Active crawl line - animated gradient travel */}
                  <path
                    id="crawl-active"
                    d="M 40 90 L 90 40 L 170 40 L 220 90 L 170 140 L 90 140 Z M 90 40 L 130 90 L 90 140 M 170 40 L 130 90 L 170 140"
                    fill="none"
                    stroke="url(#crawl-grad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="600"
                    strokeDashoffset="600"
                    className="animate-[crawl-draw_4s_ease-in-out_infinite]"
                    style={{
                      filter: 'drop-shadow(0 0 4px rgba(139,92,246,0.5))',
                    }}
                  />

                  {/* Nodes */}
                  {[
                    { cx: 40, cy: 90 },
                    { cx: 90, cy: 40 },
                    { cx: 130, cy: 90 },
                    { cx: 170, cy: 40 },
                    { cx: 220, cy: 90 },
                    { cx: 170, cy: 140 },
                    { cx: 90, cy: 140 },
                  ].map((node, i) => (
                    <g key={i}>
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r="6"
                        fill="rgba(30,41,59,0.9)"
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth="1"
                        className="animate-pulse"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r="3"
                        fill="rgba(139,92,246,0.6)"
                        filter="url(#glow)"
                        className="animate-[node-pulse_1.5s_ease-in-out_infinite]"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    </g>
                  ))}

                  {/* Crawler dot - moves along path */}
                  <circle r="5" fill="url(#crawl-grad)" filter="url(#glow)">
                    <animateMotion
                      dur="4s"
                      repeatCount="indefinite"
                      path="M 40 90 L 90 40 L 170 40 L 220 90 L 170 140 L 90 140 Z M 90 40 L 130 90 L 90 140 M 170 40 L 130 90 L 170 140"
                    />
                  </circle>
                </svg>
              </div>

              {/* Stage label */}
              <div className="text-center space-y-1 min-h-[3rem] flex flex-col justify-center">
                <p className="text-sm font-medium text-slate-400 tabular-nums tracking-wide">
                  {CRAWL_STAGES[stageIndex]}
                </p>
                <p className="text-xs text-slate-500">
                  This usually takes 2–5 minutes
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs space-y-2">
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 animate-[crawl-shimmer_2s_ease-in-out_infinite]"
                    style={{ width: '60%' }}
                  />
                </div>
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-violet-500/70 animate-pulse"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '1.2s',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Email badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium text-emerald-300">Report will be sent to your email</span>
              </div>

              {/* Footer */}
              <p className="text-[11px] text-slate-600 italic">Please don&apos;t close this window</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
