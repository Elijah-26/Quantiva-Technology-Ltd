'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/lib/auth/auth-context'

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const company = formData.get('company') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error: signUpError } = await signUp(email, password, fullName, company)

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account')
        setLoading(false)
        return
      }

      // Show success message
      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?message=Account created! Please sign in.')
      }, 2000)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
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
            <Link href="/">
              <Button variant="ghost" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Sign Up Form */}
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
            <CardDescription className="text-center text-base">
              Start your free account and get market insights today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                Account created successfully! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  disabled={loading || success}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  disabled={loading || success}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name (Optional)</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Your Company Inc."
                  disabled={loading || success}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password (min 6 characters)"
                  required
                  disabled={loading || success}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  disabled={loading || success}
                  className="h-11"
                />
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="terms" required disabled={loading || success} className="mt-1" />
                <Label 
                  htmlFor="terms" 
                  className="text-sm font-normal leading-relaxed cursor-pointer"
                >
                  I agree to the{' '}
                  <Link href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full h-11" size="lg" disabled={loading || success}>
                {loading ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account'}
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
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

