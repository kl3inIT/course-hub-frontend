"use client"

import { useState, useEffect } from "react"
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

  const MAX_ATTEMPTS = 3
  const RATE_LIMIT_DURATION = 300 // 5 minutes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isRateLimited) {
      setError(`Too many attempts. Please wait ${Math.ceil(timeRemaining / 60)} minutes before trying again.`)
      return
    }

    setIsLoading(true)
    setError("")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      setShowOTPInput(true)
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsRateLimited(true)
        setTimeRemaining(RATE_LIMIT_DURATION)

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
    } catch (error: any) {
      setError(error.message || "Failed to send verification code")
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm xử lý khi OTP xác thực thành công
  const handleOTPSuccess = async (data: any) => {
    try {
      // Lưu email vào localStorage trước khi chuyển trang
      localStorage.setItem('reset_password_email', email);
      // Chuyển trang không cần param
      router.push('/reset-password');
    } catch (error: any) {
      setError(error.message || "Failed to proceed to reset password");
    }
  }

  // Hàm xử lý khi người dùng muốn quay lại nhập email
  const handleBackToEmail = () => {
    setShowOTPInput(false)
    // Hoặc reset trạng thái, chuyển về bước nhập email,...
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