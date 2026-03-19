'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email')
  
  const [status, setStatus] = useState<'loading' | 'form' | 'verifying' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          setStatus('success')
          setMessage('Your email has been confirmed successfully!')
          toast.success('Email Verified Successfully', {
            description: 'Welcome! Redirecting you to your dashboard...',
            duration: 4000,
          })
          setTimeout(() => router.push('/dashboard'), 1500)
          return
        }

        if (emailFromUrl) {
          setStatus('form')
        } else {
          setStatus('error')
          setMessage('Invalid confirmation link. Please sign up again or use the link from your email.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred.')
      }
    }

    checkSession()
  }, [router, emailFromUrl])

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailFromUrl || !token.trim()) return

    setStatus('verifying')
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailFromUrl,
        token: token.trim(),
        type: 'email',
      })

      if (error) {
        setStatus('form')
        setMessage(error.message || 'Invalid or expired code. Please try again.')
        toast.error('Verification Failed', {
          description: error.message || 'Invalid or expired code.',
          duration: 5000,
        })
        return
      }

      setStatus('success')
      setMessage('Your email has been confirmed successfully!')
      toast.success('Email Verified Successfully', {
        description: 'Welcome! Redirecting you to your dashboard...',
        duration: 4000,
      })
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (error: any) {
      setStatus('form')
      setMessage(error.message || 'Verification failed. Please try again.')
      toast.error('Verification Failed', {
        description: 'Unable to verify your email. Please try again.',
        duration: 5000,
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#05060B] text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/quantiva.png" alt="Quantiva" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-white">Quantiva</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg glass-card-strong text-white border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Email Confirmation</CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' && 'Checking your session...'}
              {status === 'form' && 'Enter the confirmation code from your email'}
              {status === 'verifying' && 'Verifying your code...'}
              {status === 'success' && 'Your email has been confirmed'}
              {status === 'error' && 'Confirmation failed'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              {status === 'loading' && (
                <>
                  <Spinner className="size-16 text-blue-600" />
                  <p className="text-gray-300 text-center">Please wait...</p>
                </>
              )}

              {status === 'form' && (
                <form onSubmit={handleTokenSubmit} className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={emailFromUrl || ''}
                      disabled
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="token">Confirmation Code</Label>
                    <Input
                      id="token"
                      type="text"
                      placeholder="Enter confirmation code"
                      value={token}
                      onChange={(e) => setToken(e.target.value.trim())}
                      className="text-center text-xl font-mono"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>
                  {message && (
                    <p className="text-sm text-red-600 text-center">{message}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={!token.trim()}>
                    Confirm Email
                  </Button>
                </form>
              )}

              {status === 'verifying' && (
                <>
                  <Spinner className="size-16 text-blue-600" />
                  <p className="text-gray-300 text-center">Verifying your code...</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-white">{message}</p>
                    <p className="text-sm text-gray-400">Redirecting you to your dashboard...</p>
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
                    <p className="text-lg font-semibold text-white">{message}</p>
                    <p className="text-sm text-gray-400">
                      Please sign up again or check your email for the confirmation code.
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        Back to Login
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button>Sign Up Again</Button>
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#05060B] text-white">
          <Card className="w-full max-w-md shadow-lg glass-card-strong text-white border-white/10 bg-white/5 mx-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                    <Spinner className="size-8 text-blue-600 mb-4" />
                <p className="text-gray-300">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  )
}
