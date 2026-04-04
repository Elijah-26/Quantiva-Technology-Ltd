'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PricingSection } from '@/components/pricing/PricingSection'
import {
  HomeNavigation,
  HomeHero,
  HomeInfinityLibrary,
  HomeAcademicResearch,
  HomeBusinessSolutions,
  HomeDepartmentTemplates,
  HomeFeatures,
  HomeHowItWorks,
  HomePricingSection,
  HomeNewsletter,
  HomeCTA,
  HomeFooter,
} from '@/components/home'
import './home-v2-marketing.css'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  const heroRef = useRef<HTMLElement>(null)
  const libraryRef = useRef<HTMLElement>(null)
  const academicRef = useRef<HTMLElement>(null)
  const businessRef = useRef<HTMLElement>(null)
  const departmentsRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const howItWorksRef = useRef<HTMLElement>(null)
  const pricingRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-coin',
        { scale: 0.75, opacity: 0, rotateY: -35 },
        { scale: 1, opacity: 1, rotateY: 0, duration: 1.1, ease: 'power3.out', delay: 0.3 }
      )

      gsap.fromTo(
        '.hero-headline',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: 'power2.out', delay: 0.5 }
      )

      gsap.fromTo(
        '.hero-subheadline',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.75 }
      )

      gsap.fromTo(
        '.hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.95 }
      )

      const sections: { ref: RefObject<HTMLElement | null>; selector: string }[] = [
        { ref: libraryRef, selector: '.library-content' },
        { ref: academicRef, selector: '.academic-content' },
        { ref: businessRef, selector: '.business-content' },
        { ref: departmentsRef, selector: '.departments-content' },
        { ref: featuresRef, selector: '.features-content' },
        { ref: howItWorksRef, selector: '.howitworks-content' },
        { ref: pricingRef, selector: '.pricing-content' },
        { ref: ctaRef, selector: '.cta-content' },
        { ref: footerRef, selector: '.footer-content' },
      ]

      sections.forEach(({ ref, selector }) => {
        if (ref.current) {
          gsap.fromTo(
            selector,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ref.current,
                start: 'top 80%',
                end: 'top 50%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      })

      if (featuresRef.current) {
        gsap.fromTo(
          '.feature-card',
          { y: 50, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      if (howItWorksRef.current) {
        gsap.fromTo(
          '.step-item',
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power2.out',
            stagger: 0.08,
            scrollTrigger: {
              trigger: howItWorksRef.current,
              start: 'top 72%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      if (pricingRef.current) {
        gsap.fromTo(
          '.pricing-card',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.15,
            scrollTrigger: {
              trigger: pricingRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    })

    return () => ctx.revert()
  }, [])

  const goPricing = () => router.push('/pricing')

  return (
    <div className="home-v2 relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <HomeNavigation scrolled={scrolled} onGetStarted={goPricing} />

      <main>
        <HomeHero
          ref={heroRef}
          onStartTrial={goPricing}
          onExploreDashboard={() => router.push('/dashboard')}
        />

        <HomeInfinityLibrary ref={libraryRef} />
        <HomeAcademicResearch ref={academicRef} />
        <HomeBusinessSolutions ref={businessRef} />
        <HomeDepartmentTemplates ref={departmentsRef} />
        <HomeFeatures ref={featuresRef} />
        <HomeHowItWorks ref={howItWorksRef} />

        <HomePricingSection ref={pricingRef}>
          <PricingSection onSelectPlan={() => router.push('/pricing')} showHeading={false} />
        </HomePricingSection>

        <HomeNewsletter
          onSubmit={(e) => {
            e.preventDefault()
          }}
        />

        <HomeCTA ref={ctaRef} onStartTrial={goPricing} />
      </main>

      <HomeFooter ref={footerRef} />
    </div>
  )
}
