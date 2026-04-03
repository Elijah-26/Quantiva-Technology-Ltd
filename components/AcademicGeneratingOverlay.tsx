'use client'

type AcademicGeneratingOverlayProps = {
  show: boolean
  /** Main line under the animation */
  message?: string
  /** Smaller second line (e.g. phase: “Structuring…”) */
  subtitle?: string | null
}

/**
 * Full-screen loader used by Academic Research generation; reuse for consistent UX elsewhere.
 */
export function AcademicGeneratingOverlay({
  show,
  message = 'Kindly wait while your document is being generated.',
  subtitle,
}: AcademicGeneratingOverlayProps) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-navy-950/93 px-6 backdrop-blur-md"
      aria-busy
      aria-live="polite"
    >
      <div className="w-[min(100%,280px)]" style={{ aspectRatio: '300 / 150' }} aria-hidden>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" className="size-full">
          <path
            fill="none"
            stroke="#FF156D"
            strokeWidth={15}
            strokeLinecap="round"
            strokeDasharray="300 385"
            strokeDashoffset={0}
            d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"
          >
            <animate
              attributeName="stroke-dashoffset"
              calcMode="spline"
              dur="2s"
              values="685;-685"
              keySplines="0 0 1 1"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
      <div className="max-w-md space-y-2 text-center">
        <p className="text-lg text-white/95">{message}</p>
        {subtitle ? <p className="text-sm text-white/55">{subtitle}</p> : null}
      </div>
    </div>
  )
}
