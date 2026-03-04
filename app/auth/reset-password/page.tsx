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

type ResetMode = 'validating' | 'session' | 'error'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<ResetMode>('validating')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    matches: false,
  })

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const hasRecoveryHash = typeof window !== 'undefined' &&
      (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token'))

    if (errorParam === 'access_denied' || errorCode === 'otp_expired') {
      setMode('error')
      toast.error('Link Invalid or Expired', {
        description: 'Please request a new reset link and use it in the same browser.',
        duration: 6000,
      })
      return
    }

    const checkSession = async (retryCount = 0) => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setMode('session')
          return
        }
        if (hasRecoveryHash && retryCount < 5) {
          await new Promise(resolve => setTimeout(resolve, 800))
          return checkSession(retryCount + 1)
        }
        setMode('error')
        toast.error('Invalid or Expired Link', {
          description: 'Please request a new password reset link from the login page.',
          duration: 6000,
        })
      } catch (error) {
        setMode('error')
      }
    }

    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setMode('session')
      }
    })

    checkSession()
    return () => sub.data.subscription.unsubscribe()
  }, [searchParams])

  useEffect(() => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      matches: password.length > 0 && password === confirmPassword,
    })
  }, [password, confirmPassword])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword || !Object.values(passwordValidation).every(v => v)) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password Reset Successfully', { description: 'Redirecting to sign in...', duration: 4000 })
      await supabase.auth.signOut()
      setTimeout(() => router.push('/login?message=Password reset successful. Please sign in with your new password.'), 2000)
    } catch (error: any) {
      toast.error('Reset Failed', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      {isValid ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
      <span className={`text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>{text}</span>
    </div>
  )

  if (mode === 'validating') {
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

  if (mode === 'error') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <img src="/quantiva.png" alt="Quantiva" className="h-8 w-8 object-contain" />
                <span className="text-xl font-bold text-gray-900">Quantiva</span>
              </Link>
              <Link href="/login"><Button variant="ghost" size="sm">Back to Login</Button></Link>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Link Invalid or Expired</CardTitle>
              <CardDescription className="text-center">
                Please request a new password reset link from the login page and use it in the same browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/login">
                <Button className="w-full h-11" size="lg">Back to Login</Button>
              </Link>
              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/quantiva.png" alt="Quantiva" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-gray-900">Quantiva</span>
            </Link>
            <Link href="/login"><Button variant="ghost" size="sm">Back to Login</Button></Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
            <CardDescription className="text-center">
              Create a strong, secure password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              {password && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 border">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <ValidationItem isValid={passwordValidation.minLength} text="At least 8 characters" />
                  <ValidationItem isValid={passwordValidation.hasUpperCase} text="Contains uppercase letter" />
                  <ValidationItem isValid={passwordValidation.hasLowerCase} text="Contains lowercase letter" />
                  <ValidationItem isValid={passwordValidation.hasNumber} text="Contains number" />
                  {confirmPassword && <ValidationItem isValid={passwordValidation.matches} text="Passwords match" />}
                </div>
              )}
              <Button type="submit" className="w-full h-11" size="lg" disabled={loading || !Object.values(passwordValidation).every(v => v)}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting...</> : 'Reset Password'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Remember your password? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link></p>
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
        <Card className="w-full max-w-md mx-4"><CardContent className="pt-6"><div className="flex flex-col items-center py-8"><Loader2 className="w-8 h-8 animate-spin mb-4" /><p className="text-gray-600">Loading...</p></div></CardContent></Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
