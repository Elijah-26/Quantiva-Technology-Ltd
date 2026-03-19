'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Mail, CheckCircle2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Forgot password dialog state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Check for success message from signup
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        setError(signInError.message || 'Invalid email or password')
        setLoading(false)
        return
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error('Email Address Required', {
        description: 'Please enter your email address to receive the reset link.',
        duration: 4000,
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      toast.error('Invalid Email Format', {
        description: 'Please enter a valid email address (e.g., user@example.com).',
        duration: 4000,
      })
      return
    }

    setResetLoading(true)

    try {
      // Check if email exists before sending reset link
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      })
      const { exists } = await checkRes.json()

      if (!exists) {
        toast.error('Sorry, this email doesn\'t exist', {
          description: 'Kindly create an account to sign in.',
          duration: 5000,
        })
        setResetLoading(false)
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setResetSuccess(true)
      toast.success('Reset Link Sent Successfully', {
        description: 'Check your inbox and click the link to reset your password.',
        duration: 5000,
      })

      // Keep success state visible for 4 seconds, then close
      setTimeout(() => {
        setIsForgotPasswordOpen(false)
        setResetEmail('')
        setResetSuccess(false)
      }, 4000)
    } catch (error: any) {
      console.error('Password reset error:', error)
      toast.error('Failed to Send Reset Link', {
        description: error.message || 'Unable to send the password reset email. Please try again.',
        duration: 5000,
      })
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
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
            <Link href="/">
              <Button variant="ghost" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center bg-[#05060B] py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg glass-card-strong text-white border-white/10 bg-white/5">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-base text-gray-300">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-200 text-sm">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button 
                    type="button"
                    onClick={() => {
                      const emailVal = (document.getElementById('email') as HTMLInputElement)?.value
                      if (emailVal) setResetEmail(emailVal)
                      setIsForgotPasswordOpen(true)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" disabled={loading} />
                <Label 
                  htmlFor="remember" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me for 30 days
                </Label>
              </div>

              <Button type="submit" className="w-full h-11" size="lg" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={(open: boolean) => {
        if (!open) {
          setResetSuccess(false)
          setResetEmail('')
        }
        setIsForgotPasswordOpen(open)
      }}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resetSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Email Sent Successfully
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 text-blue-600" />
                  Reset Password
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {resetSuccess ? (
                <>
                  We&apos;ve sent a password reset link to <strong>{resetEmail}</strong>. Check your inbox and use the link to set a new password. The link works on any browser or device and expires in 1 hour.
                </>
              ) : (
                'Enter your email address and we\'ll send you a link to reset your password.'
              )}
            </DialogDescription>
          </DialogHeader>
          {!resetSuccess && (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleForgotPassword()
                      }
                    }}
                    disabled={resetLoading}
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The reset link will expire in 1 hour for security purposes.
                  </p>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsForgotPasswordOpen(false)
                    setResetEmail('')
                    setResetSuccess(false)
                  }}
                  disabled={resetLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="w-full sm:w-auto"
                >
                  {resetLoading ? (
                    <>
                      <Spinner className="size-4 text-blue-600 mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
          {resetSuccess && (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-sm text-gray-600">This dialog will close in a few seconds.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-12 text-blue-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

