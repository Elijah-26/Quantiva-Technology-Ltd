'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validating, setValidating] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    matches: false,
  })

  // Check if we have a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          toast.error('Reset Link Invalid or Expired', {
            description: 'This link has expired or been used. Request a new password reset.',
            duration: 6000,
          })
          setTimeout(() => {
            router.push('/login')
          }, 3000)
          setValidating(false)
          return
        }

        setHasValidSession(true)
        setValidating(false)
      } catch (error) {
        console.error('Session check error:', error)
        toast.error('Validation Failed', {
          description: 'Unable to validate your reset link. Please try again.',
          duration: 5000,
        })
        router.push('/login')
      }
    }

    checkSession()
  }, [router])

  // Validate password as user types
  useEffect(() => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      matches: password.length > 0 && password === confirmPassword,
    })
  }, [password, confirmPassword])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords Don\'t Match', {
        description: 'Please ensure both password fields are identical.',
        duration: 4000,
      })
      return
    }

    if (password.length < 8) {
      toast.error('Password Too Short', {
        description: 'Your password must be at least 8 characters long.',
        duration: 4000,
      })
      return
    }

    if (!passwordValidation.hasUpperCase || !passwordValidation.hasLowerCase || !passwordValidation.hasNumber) {
      toast.error('Password Requirements Not Met', {
        description: 'Please ensure your password meets all the requirements listed below.',
        duration: 5000,
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      toast.success('Password Reset Successfully', {
        description: 'Your password has been updated. Redirecting to sign in...',
        duration: 5000,
      })
      
      // Sign out to ensure fresh session
      await supabase.auth.signOut()
      
      setTimeout(() => {
        router.push('/login?message=Password reset successful. Please sign in with your new password.')
      }, 2000)

    } catch (error: any) {
      console.error('Password reset error:', error)
      toast.error('Password Reset Failed', {
        description: error.message || 'Unable to reset your password. Please try again.',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Validating reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasValidSession) {
    return null
  }

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      {isValid ? (
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
      )}
      <span className={`text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  )

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
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
            <CardDescription className="text-center">
              Create a strong, secure password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 border">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <ValidationItem 
                    isValid={passwordValidation.minLength} 
                    text="At least 8 characters" 
                  />
                  <ValidationItem 
                    isValid={passwordValidation.hasUpperCase} 
                    text="Contains uppercase letter" 
                  />
                  <ValidationItem 
                    isValid={passwordValidation.hasLowerCase} 
                    text="Contains lowercase letter" 
                  />
                  <ValidationItem 
                    isValid={passwordValidation.hasNumber} 
                    text="Contains number" 
                  />
                  {confirmPassword && (
                    <ValidationItem 
                      isValid={passwordValidation.matches} 
                      text="Passwords match" 
                    />
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11" 
                size="lg"
                disabled={loading || !Object.values(passwordValidation).every(v => v)}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

