// lib/auth/protected-route.tsx
// HOC for protecting pages that require authentication

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'
import { Spinner } from '@/components/ui/spinner'

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login')
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner className="size-12 text-blue-600" />
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}

