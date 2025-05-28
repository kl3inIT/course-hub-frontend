"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, AlertCircle, CheckCircle, Shield, Clock, X } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { useRouter, useSearchParams } from "next/navigation"

interface PasswordStrength {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
  score: number
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    score: 0,
  })

  useEffect(() => {
    const urlToken = searchParams.get("token")
    const urlEmail = searchParams.get("email")

    if (urlToken && urlEmail) {
      setToken(urlToken)
      setEmail(urlEmail)
      validateToken(urlToken, urlEmail)
    } else {
      setError("Invalid or missing reset token. Please request a new password reset.")
      setIsCheckingToken(false)
    }
  }, [searchParams])

  useEffect(() => {
    if (tokenExpiry) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, tokenExpiry - Date.now())
        setTimeRemaining(Math.floor(remaining / 1000))

        if (remaining <= 0) {
          setError("Reset token has expired. Please request a new password reset.")
          setIsValidToken(false)
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [tokenExpiry])

  const validateToken = (token: string, email: string) => {
    setIsCheckingToken(true)

    // Simulate token validation
    setTimeout(() => {
      const storedData = localStorage.getItem(`reset_token_${email}`)

      if (storedData) {
        try {
          const { token: storedToken, expiry, attempts, verified } = JSON.parse(storedData)

          if (storedToken === token && Date.now() < expiry && attempts < 3 && verified) {
            setIsValidToken(true)
            setTokenExpiry(expiry)
            setTimeRemaining(Math.floor((expiry - Date.now()) / 1000))
          } else if (!verified) {
            setError("Invalid reset token. Please complete the email verification process first.")
          } else if (Date.now() >= expiry) {
            setError("Reset token has expired. Please request a new password reset.")
          } else if (attempts >= 3) {
            setError("Reset token has been used too many times. Please request a new password reset.")
          } else {
            setError("Invalid reset token. Please request a new password reset.")
          }
        } catch (error) {
          setError("Invalid token format. Please request a new password reset.")
        }
      } else {
        setError("Reset token not found. Please request a new password reset.")
      }

      setIsCheckingToken(false)
    }, 1000)
  }

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const strength: PasswordStrength = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      score: 0,
    }

    // Calculate score
    const criteria = [strength.length, strength.uppercase, strength.lowercase, strength.number, strength.special]
    strength.score = criteria.filter(Boolean).length

    return strength
  }

  const getPasswordStrengthColor = (score: number): string => {
    if (score <= 2) return "bg-red-500"
    if (score <= 3) return "bg-yellow-500"
    if (score <= 4) return "bg-blue-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = (score: number): string => {
    if (score <= 2) return "Weak"
    if (score <= 3) return "Fair"
    if (score <= 4) return "Good"
    return "Strong"
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordStrength(checkPasswordStrength(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Enhanced password validation
    if (passwordStrength.score < 4) {
      setError(
        "Password does not meet security requirements. Please ensure it contains at least 8 characters, including uppercase, lowercase, numbers, and special characters.",
      )
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Check for common passwords (expanded list)
    const commonPasswords = [
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
      "1234567890",
      "password1",
      "123123",
      "12345678",
      "qwerty123",
      "1q2w3e4r",
      "admin123",
    ]
    if (commonPasswords.some((common) => password.toLowerCase().includes(common.toLowerCase()))) {
      setError("Password is too common or contains dictionary words. Please choose a more secure password.")
      setIsLoading(false)
      return
    }

    // Check if password contains email parts
    const emailParts = email.split("@")[0].toLowerCase()
    if (emailParts.length > 3 && password.toLowerCase().includes(emailParts)) {
      setError("Password should not contain parts of your email address.")
      setIsLoading(false)
      return
    }

    // Simulate API call to reset password
    setTimeout(() => {
      // Increment token usage attempts
      const storedData = localStorage.getItem(`reset_token_${email}`)
      if (storedData) {
        try {
          const data = JSON.parse(storedData)
          data.attempts = (data.attempts || 0) + 1
          localStorage.setItem(`reset_token_${email}`, JSON.stringify(data))
        } catch (error) {
          console.error("Error updating token attempts:", error)
        }
      }

      // Clear the reset token after successful use
      localStorage.removeItem(`reset_token_${email}`)

      setIsLoading(false)
      setIsSuccess(true)
    }, 2000)
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="text-center space-y-6 p-8">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <div>
                <CardTitle className="text-xl mb-2">Validating Reset Token</CardTitle>
                <CardDescription>Please wait while we verify your reset token...</CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="text-center space-y-6 p-8">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <X className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl mb-2">Invalid Reset Token</CardTitle>
                <CardDescription>{error}</CardDescription>
              </div>
              <div className="space-y-2">
                <Link href="/forgot-password">
                  <Button className="w-full">Request New Reset Link</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="text-center space-y-6 p-8">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl mb-2">Password Reset Successful</CardTitle>
                <CardDescription>
                  Your password has been successfully updated. You can now sign in with your new password.
                </CardDescription>
              </div>
              <div className="space-y-2">
                <Link href="/login">
                  <Button className="w-full">Sign In with New Password</Button>
                </Link>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    For security, you've been logged out of all devices. Please sign in again.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
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
              <Shield className="h-5 w-5" />
              Reset Your Password
            </CardTitle>
            <CardDescription>Create a new secure password for your account</CardDescription>
            {timeRemaining > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Token expires in: {formatTime(timeRemaining)}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Password Strength:</span>
                      <span
                        className={`font-medium ${
                          passwordStrength.score <= 2
                            ? "text-red-600"
                            : passwordStrength.score <= 3
                              ? "text-yellow-600"
                              : passwordStrength.score <= 4
                                ? "text-blue-600"
                                : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <Progress value={(passwordStrength.score / 5) * 100} className="h-2" />
                  </div>
                )}

                {/* Password Requirements */}
                {password && (
                  <div className="space-y-2 text-xs">
                    <p className="text-muted-foreground">Password must contain:</p>
                    <div className="grid grid-cols-1 gap-1">
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.length ? "text-green-600" : "text-muted-foreground"}`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>At least 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.uppercase ? "text-green-600" : "text-muted-foreground"}`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>One uppercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.lowercase ? "text-green-600" : "text-muted-foreground"}`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>One lowercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.number ? "text-green-600" : "text-muted-foreground"}`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>One number</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.special ? "text-green-600" : "text-muted-foreground"}`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || passwordStrength.score < 4 || password !== confirmPassword}
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
