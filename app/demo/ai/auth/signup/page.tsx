"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, User, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
      return
    }
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    toast.success("Demo only — account not created")
    router.push("/demo/ai/auth/onboarding")
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card-strong p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/demo" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-white font-heading">
                Quantiva
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">
              Create your account
            </h1>
            <p className="text-white/60">
              Start your 14-day free trial today
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step >= s
                    ? "bg-indigo-500 text-white"
                    : "bg-white/10 text-white/50"
                )}
              >
                {s}
              </div>
            ))}
          </div>

          {/* Social Login */}
          {step === 1 && (
            <>
              <div className="space-y-3 mb-6">
                <Button
                  variant="glass"
                  className="w-full"
                  type="button"
                  onClick={() =>
                    toast.message("Demo only — Google sign-up is not connected")
                  }
                >
                  <Chrome className="w-5 h-5 mr-2" />
                  Continue with Google
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-navy-800 text-white/50">Or sign up with email</span>
                </div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white/70 mb-2 block">
                      First name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white/70 mb-2 block">
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white/70 mb-2 block">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-white/70 mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-white/40">
                    Must be at least 8 characters
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="companyName" className="text-white/70 mb-2 block">
                    Company name (optional)
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Acme Inc."
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/70 mb-2">
                    By creating an account, you agree to our:
                  </p>
                  <ul className="text-sm text-white/50 space-y-1">
                    <li>• Terms of Service</li>
                    <li>• Privacy Policy</li>
                    <li>• Cookie Policy</li>
                  </ul>
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === 1 ? (
                <>
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            {step === 2 && (
              <Button
                type="button"
                variant="glass"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            )}
          </form>

          <p className="mt-6 text-center text-white/60">
            Already have an account?{" "}
            <Link
              href="/demo/ai/auth/signin"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
