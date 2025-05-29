"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { OTPConfirmation } from "@/components/auth/otp-confirmation"
import { Navbar } from "@/components/layout/navbar"

export default function VerifyOTPPage() {
  const searchParams = useSearchParams()
  const [otpData, setOtpData] = useState({
    type: "email-verification" as "email-verification" | "password-reset" | "two-factor" | "phone-verification",
    destination: "",
    redirectTo: "/dashboard",
  })

  useEffect(() => {
    // Get parameters from URL
    const type = searchParams.get("type") as "email-verification" | "password-reset" | "two-factor" | "phone-verification"
    const destination = searchParams.get("destination") || ""
    const redirectTo = searchParams.get("redirect") || "/dashboard"

    setOtpData({
      type: type || "email-verification",
      destination: decodeURIComponent(destination),
      redirectTo,
    })
  }, [searchParams])

  const handleSuccess = (data: any) => {
    // Handle different success scenarios based on type
    switch (otpData.type) {
      case "email-verification":
        window.location.href = otpData.redirectTo
        break

      case "password-reset":
        window.location.href = `/reset-password?token=${data.code}&verified=true`
        break

      case "two-factor":
        window.location.href = otpData.redirectTo
        break

      case "phone-verification":
        window.location.href = otpData.redirectTo
        break

      default:
        window.location.href = otpData.redirectTo
    }
  }

  const handleBack = () => {
    // Navigate back based on type
    switch (otpData.type) {
      case "email-verification":
        window.location.href = "/register"
        break
      case "password-reset":
        window.location.href = "/login"
        break
      case "two-factor":
        window.location.href = "/login"
        break
      case "phone-verification":
        window.location.href = "/profile"
        break
      default:
        window.location.href = "/"
    }
  }

  if (!otpData.destination) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Verification Request</h1>
            <p className="text-muted-foreground mb-6">
              This verification link is invalid or has expired. Please try again.
            </p>
            <a href="/" className="text-primary hover:underline">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <OTPConfirmation
          type={otpData.type}
          destination={otpData.destination}
          onSuccess={handleSuccess}
          onBack={handleBack}
        />
      </div>
    </div>
  )
}
