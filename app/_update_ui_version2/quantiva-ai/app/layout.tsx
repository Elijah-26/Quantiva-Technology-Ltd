import type { Metadata } from "next"
import { Inter, Sora, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

const sora = Sora({ 
  subsets: ["latin"],
  variable: "--font-sora",
})

const ibmPlexMono = IBM_Plex_Mono({ 
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Quantiva AI - Regulatory Document Intelligence Platform",
  description: "AI-powered regulatory document templates and compliance intelligence for businesses worldwide. Generate, customize, and manage regulatory documents with ease.",
  keywords: ["regulatory documents", "compliance", "AI", "document templates", "business intelligence"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${sora.variable} ${ibmPlexMono.variable} font-sans`}>
        <div className="starfield" />
        <div className="aurora" />
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  )
}
