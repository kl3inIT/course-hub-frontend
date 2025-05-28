"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { OTPConfirmation } from "@/components/auth/otp-confirmation"

export default function VerifyPhonePage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<"input" | "verify">("input")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const phone = searchParams.get("phone")
    if (phone) {
      setPhoneNumber(decodeURIComponent(phone))
      setStep("verify")
    }
  }, [searchParams])

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a valid phone number")
      return
    }

    // Basic phone validation
    const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number with country code")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setStep("verify")
    }, 1000)
  }

  const handleVerificationSuccess = () => {
    // Mark phone as verified
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    user.phoneNumber = phoneNumber
    user.phoneVerified = true
    localStorage.setItem("user", JSON.stringify(user))

    // Redirect to profile or dashboard
    window.location.href = "/profile?phone=verified"
  }

  const handleBack = () => {
    if (step === "verify") {
      setStep("input")
    } else {
      window.location.href = "/profile"
    }
  }

  if (step === "verify") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <OTPConfirmation
            type="phone-verification"
            destination={phoneNumber}
            onSuccess={handleVerificationSuccess}
            onBack={handleBack}
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
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-orange-100 p-3">
                <Smartphone className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <CardTitle>Verify Your Phone Number</CardTitle>
            <CardDescription>We'll send you a verification code via SMS to confirm your phone number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Include your country code (e.g., +1 for US)</p>
            </div>

            <Button onClick={handleSendCode} disabled={isLoading || !phoneNumber} className="w-full">
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>

            <div className="text-center">
              <Button variant="ghost" onClick={handleBack} className="text-sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
