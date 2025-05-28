"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { OTPConfirmation } from "@/components/auth/otp-confirmation"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [generatedOTP, setGeneratedOTP] = useState("")

  const MAX_ATTEMPTS = 3
  const RATE_LIMIT_DURATION = 300 // 5 minutes in seconds

  const generateSecureOTP = (): string => {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const simulateEmailSending = (email: string, otp: string) => {
    // In a real application, this would send an actual email
    console.log(`
=== EMAIL SIMULATION ===
To: ${email}
Subject: Password Reset OTP - Learning Platform

Dear User,

You have requested to reset your password for your Learning Platform account.

Your One-Time Password (OTP) is: ${otp}

This OTP will expire in 10 minutes for security reasons.

If you did not request this password reset, please ignore this email.

Best regards,
Learning Platform Team
========================
    `)

    // Store the email details for demo purposes
    localStorage.setItem(
      "demo_email",
      JSON.stringify({
        to: email,
        otp: otp,
        timestamp: Date.now(),
        subject: "Password Reset OTP",
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isRateLimited) {
      setError(`Too many attempts. Please wait ${Math.ceil(timeRemaining / 60)} minutes before trying again.`)
      return
    }

    setIsLoading(true)
    setError("")

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Check if email exists in our system (simulate)
    const validEmails = ["admin@example.com", "manager@example.com", "learner@example.com"]
    const emailExists = validEmails.includes(email) || email.includes("@")

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false)

      if (emailExists) {
        // Generate OTP and store it
        const otp = generateSecureOTP()
        const expiryTime = Date.now() + 10 * 60 * 1000 // 10 minutes

        // Store OTP data
        localStorage.setItem(
          `otp_${email}`,
          JSON.stringify({
            otp: otp,
            expiry: expiryTime,
            attempts: 0,
            email: email,
            type: "password-reset",
          }),
        )

        // Simulate sending email
        simulateEmailSending(email, otp)
        setGeneratedOTP(otp)
        setShowOTPInput(true)
      } else {
        // Even for non-existent emails, show success to prevent email enumeration
        // But don't actually generate an OTP
        setShowOTPInput(true)
      }

      // Track attempts for rate limiting
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsRateLimited(true)
        setTimeRemaining(RATE_LIMIT_DURATION)

        // Start countdown timer
        const timer = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              setIsRateLimited(false)
              setAttempts(0)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    }, 2000)
  }

  const handleOTPSuccess = (data: any) => {
    // Clear the OTP data
    localStorage.removeItem(`otp_${email}`)

    // Redirect to reset password page with verified token
    const resetToken = generateSecureToken()
    const expiryTime = Date.now() + 15 * 60 * 1000 // 15 minutes

    localStorage.setItem(
      `reset_token_${email}`,
      JSON.stringify({
        token: resetToken,
        expiry: expiryTime,
        attempts: 0,
        verified: true,
      }),
    )

    router.push(`/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`)
  }

  const handleBackToEmail = () => {
    setShowOTPInput(false)
    setEmail("")
    setError("")
    setGeneratedOTP("")
  }

  const generateSecureToken = (): string => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (showOTPInput) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <OTPConfirmation
            type="password-reset"
            destination={email}
            onSuccess={handleOTPSuccess}
            onBack={handleBackToEmail}
            title="Verify Reset Code"
            description={`We've sent a 6-digit verification code to ${email}`}
          />

          {/* Demo Information */}
          {generatedOTP && (
            <Card className="w-full max-w-md mx-auto mt-6">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-medium mb-2 text-blue-800">📧 Demo Email Sent:</p>
                  <p className="mb-1">
                    <strong>To:</strong> {email}
                  </p>
                  <p className="mb-1">
                    <strong>OTP:</strong> <code className="bg-blue-100 px-1 rounded text-blue-800">{generatedOTP}</code>
                  </p>
                  <p className="mb-2">
                    <strong>Expires:</strong> 10 minutes
                  </p>
                  <p className="text-xs text-blue-600">In a real application, this would be sent via email service.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Reset Your Password
            </CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a verification code to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isRateLimited && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>Rate limit active. Time remaining: {formatTime(timeRemaining)}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading || isRateLimited}
                />
                <p className="text-xs text-muted-foreground">
                  We'll send a 6-digit verification code to this email address.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || isRateLimited}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Attempts remaining: {MAX_ATTEMPTS - attempts}
              </div>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Security Information</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>OTP codes expire after 10 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Secure 6-digit verification codes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Rate limiting prevents abuse</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Email enumeration protection</span>
                </div>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  <ArrowLeft className="h-3 w-3 inline mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
