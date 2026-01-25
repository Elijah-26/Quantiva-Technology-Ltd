'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Check if we have a session (email confirmation automatically creates one)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setStatus('error')
          setMessage('Unable to confirm your email. Please try again or request a new link.')
          return
        }

        if (session) {
          setStatus('success')
          setMessage('Your email has been confirmed successfully!')
          
          // Show success toast
          toast.success('Email Verified Successfully', {
            description: 'Welcome! Redirecting you to your dashboard...',
            duration: 4000,
          })
          
          // Redirect to dashboard immediately
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        } else {
          setStatus('error')
          setMessage('This confirmation link is invalid or has expired.')
          
          toast.error('Confirmation Link Invalid', {
            description: 'This link may have expired or been used already.',
            duration: 5000,
          })
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error)
        setStatus('error')
        setMessage(error.message || 'An unexpected error occurred during confirmation.')
        
        toast.error('Confirmation Failed', {
          description: 'Unable to verify your email. Please try again.',
          duration: 5000,
        })
      }
    }

    confirmEmail()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/quantiva.png" 
                alt="Quantiva" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">Quantiva</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Email Confirmation</CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' && 'Confirming your email address...'}
              {status === 'success' && 'Your email has been confirmed'}
              {status === 'error' && 'Confirmation failed'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              {status === 'loading' && (
                <>
                  <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
                  <p className="text-gray-600 text-center">
                    Please wait while we confirm your email address...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-gray-900">{message}</p>
                    <p className="text-sm text-gray-600">
                      Redirecting you to your dashboard...
                    </p>
                  </div>
                  <Button onClick={() => router.push('/dashboard')} className="mt-4">
                    Go to Dashboard
                  </Button>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="w-16 h-16 text-red-600" />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-gray-900">{message}</p>
                    <p className="text-sm text-gray-600">
                      Please request a new confirmation email or contact support.
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Link href="/login">
                      <Button variant="outline">
                        Back to Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button>
                        Sign Up Again
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}

