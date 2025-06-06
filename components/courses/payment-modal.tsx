"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Lock, CheckCircle, AlertCircle, ArrowLeft, Loader2, Shield, Smartphone, Globe } from "lucide-react"
import { VNPayPayment } from "./vnpay-payment"
import { CourseDetailsResponseDTO } from "@/types/course"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  course: CourseDetailsResponseDTO
}

type PaymentStep = "method-selection" | "card-payment" | "vnpay-payment" | "processing" | "success" | "error"
type PaymentMethod = "card" | "vnpay"

export function PaymentModal({ isOpen, onClose, course }: PaymentModalProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>("method-selection")
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("vnpay")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
  })

  const handleMethodSelection = () => {
    setError(null)
    if (selectedMethod === "vnpay") {
      setCurrentStep("vnpay-payment")
    } else {
      setCurrentStep("card-payment")
    }
  }

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setCurrentStep("processing")

    // Simulate card payment processing
    setTimeout(() => {
      // Simulate random success/failure for demo
      const success = Math.random() > 0.2 // 80% success rate

      if (success) {
        completeEnrollment()
      } else {
        setError("Payment failed. Please check your card details and try again.")
        setCurrentStep("error")
      }
      setIsProcessing(false)
    }, 3000)
  }

  const handleVNPaySuccess = () => {
    completeEnrollment()
  }

  const handleVNPayError = (errorMessage: string) => {
    setError(errorMessage)
    setCurrentStep("error")
  }

  const completeEnrollment = () => {
    // Add course to user's enrolled courses
    const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "[]")
    enrolledCourses.push(course.id)
    localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses))

    setCurrentStep("success")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const resetModal = () => {
    setCurrentStep("method-selection")
    setSelectedMethod("vnpay")
    setError(null)
    setIsProcessing(false)
    setPaymentData({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      name: "",
    })
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const goBack = () => {
    if (currentStep === "card-payment" || currentStep === "vnpay-payment") {
      setCurrentStep("method-selection")
    } else if (currentStep === "error") {
      setCurrentStep(selectedMethod === "vnpay" ? "vnpay-payment" : "card-payment")
    }
    setError(null)
  }

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
        <p className="text-sm text-muted-foreground">Select your preferred payment option</p>
      </div>

      <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
        <div className="space-y-3">
          {/* VNPAY Option */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="vnpay" id="vnpay" />
            <Label htmlFor="vnpay" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-red-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VNP</span>
                  </div>
                  <div>
                    <div className="font-medium">VNPAY</div>
                    <div className="text-sm text-muted-foreground">Vietnam's leading payment gateway</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Recommended
                  </Badge>
                  <div className="flex gap-1">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </Label>
          </div>

          {/* Credit Card Option */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard, American Express</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    V
                  </div>
                  <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    M
                  </div>
                </div>
              </div>
            </Label>
          </div>
        </div>
      </RadioGroup>

      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
        <Shield className="h-4 w-4" />
        <span>All payments are secured with 256-bit SSL encryption</span>
      </div>

      <Button onClick={handleMethodSelection} className="w-full" size="lg">
        Continue with {selectedMethod === "vnpay" ? "VNPAY" : "Credit Card"}
      </Button>
    </div>
  )

  const renderCardPayment = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">Credit Card Payment</h3>
      </div>

      <form onSubmit={handleCardPayment} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Cardholder Name</Label>
          <Input
            id="name"
            name="name"
            value={paymentData.name}
            onChange={handleInputChange}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              required
            />
            <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              value={paymentData.expiryDate}
              onChange={handleInputChange}
              placeholder="MM/YY"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              name="cvv"
              value={paymentData.cvv}
              onChange={handleInputChange}
              placeholder="123"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
          {isProcessing ? "Processing..." : `Pay $${course.price}`}
        </Button>
      </form>
    </div>
  )

  const renderProcessing = () => (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
        <p className="text-muted-foreground">Please wait while we process your payment...</p>
      </div>
    </div>
  )

  const renderSuccess = () => (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4">
          You have successfully enrolled in <strong>{course.title}</strong>
        </p>
        <p className="text-sm text-muted-foreground">You can now access the course content and start learning.</p>
      </div>
      <div className="space-y-3">
        <Button
          onClick={() => {
            handleClose()
            window.location.href = `/learn/${course.id}`
          }}
          className="w-full"
          size="lg"
        >
          Start Learning
        </Button>
        <Button variant="outline" onClick={handleClose} className="w-full">
          Continue Browsing
        </Button>
      </div>
    </div>
  )

  const renderError = () => (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
      <div className="space-y-3">
        <Button onClick={goBack} className="w-full" size="lg">
          Try Again
        </Button>
        <Button variant="outline" onClick={handleClose} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  )

  const getDialogTitle = () => {
    switch (currentStep) {
      case "method-selection":
        return "Complete Your Purchase"
      case "card-payment":
        return "Credit Card Payment"
      case "vnpay-payment":
        return "VNPAY Payment"
      case "processing":
        return "Processing Payment"
      case "success":
        return "Payment Successful"
      case "error":
        return "Payment Failed"
      default:
        return "Complete Your Purchase"
    }
  }

  const getDialogDescription = () => {
    switch (currentStep) {
      case "method-selection":
        return `You're about to enroll in ${course.title}`
      case "success":
        return "Your enrollment has been confirmed"
      case "error":
        return "There was an issue processing your payment"
      default:
        return `Enrolling in ${course.title}`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {(currentStep === "method-selection" || currentStep === "card-payment") && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>by {course.instructorName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span>Course Price:</span>
                  <span className="text-xl font-bold">${course.price}</span>
                </div>
              </CardContent>
            </Card>
            <Separator />
          </>
        )}

        {currentStep === "method-selection" && renderMethodSelection()}
        {currentStep === "card-payment" && renderCardPayment()}
        {currentStep === "vnpay-payment" && (
          <VNPayPayment course={course} onSuccess={handleVNPaySuccess} onError={handleVNPayError} onBack={goBack} />
        )}
        {currentStep === "processing" && renderProcessing()}
        {currentStep === "success" && renderSuccess()}
        {currentStep === "error" && renderError()}
      </DialogContent>
    </Dialog>
  )
}
