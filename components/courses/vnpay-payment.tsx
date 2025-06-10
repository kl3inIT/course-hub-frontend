'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  Smartphone,
  CreditCard,
  Building,
  QrCode,
  Shield,
} from 'lucide-react'

interface VNPayPaymentProps {
  course: {
    id: number
    title: string
    price: number
    instructor: { name: string }
  }
  onSuccess: () => void
  onError: (error: string) => void
  onBack: () => void
}

type VNPayStep = 'options' | 'processing' | 'redirect' | 'confirming'

export function VNPayPayment({
  course,
  onSuccess,
  onError,
  onBack,
}: VNPayPaymentProps) {
  const [currentStep, setCurrentStep] = useState<VNPayStep>('options')
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [countdown, setCountdown] = useState(10)

  // Simulate payment processing countdown
  useEffect(() => {
    if (currentStep === 'redirect' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (currentStep === 'redirect' && countdown === 0) {
      setCurrentStep('confirming')
      // Simulate payment confirmation
      setTimeout(() => {
        // 90% success rate for demo
        const success = Math.random() > 0.1
        if (success) {
          onSuccess()
        } else {
          onError(
            'Payment was cancelled or failed at VNPAY gateway. Please try again.'
          )
        }
      }, 2000)
    }
  }, [currentStep, countdown, onSuccess, onError])

  const paymentOptions = [
    {
      id: 'vnpay_qr',
      name: 'VNPAY QR',
      description: 'Scan QR code with your banking app',
      icon: QrCode,
      popular: true,
    },
    {
      id: 'atm_card',
      name: 'ATM/Debit Card',
      description: 'Vietnamese domestic cards',
      icon: CreditCard,
      popular: false,
    },
    {
      id: 'internet_banking',
      name: 'Internet Banking',
      description: 'Direct bank transfer',
      icon: Building,
      popular: false,
    },
    {
      id: 'mobile_banking',
      name: 'Mobile Banking',
      description: 'Banking apps (Vietcombank, BIDV, etc.)',
      icon: Smartphone,
      popular: true,
    },
  ]

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
  }

  const handleProceedPayment = () => {
    if (!selectedOption) return

    setIsProcessing(true)
    setCurrentStep('processing')

    // Simulate VNPAY API call
    setTimeout(() => {
      setCurrentStep('redirect')
      setCountdown(10)
      setIsProcessing(false)
    }, 2000)
  }

  const renderPaymentOptions = () => (
    <div className='space-y-6'>
      <div className='flex items-center gap-2'>
        <Button variant='ghost' size='sm' onClick={onBack}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-6 bg-gradient-to-r from-blue-600 to-red-600 rounded flex items-center justify-center'>
            <span className='text-white text-xs font-bold'>VNP</span>
          </div>
          <h3 className='text-lg font-semibold'>VNPAY Payment</h3>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>{course.title}</CardTitle>
          <CardDescription>by {course.instructor.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex justify-between items-center'>
            <span>Total Amount:</span>
            <span className='text-xl font-bold'>${course.price}</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h4 className='font-medium mb-4'>Select Payment Method</h4>
        <div className='space-y-3'>
          {paymentOptions.map(option => {
            const Icon = option.icon
            return (
              <div
                key={option.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                  selectedOption === option.id
                    ? 'border-primary bg-primary/5'
                    : ''
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Icon className='h-6 w-6 text-muted-foreground' />
                    <div>
                      <div className='font-medium flex items-center gap-2'>
                        {option.name}
                        {option.popular && (
                          <Badge variant='secondary' className='text-xs'>
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {option.description}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedOption === option.id
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {selectedOption === option.id && (
                      <div className='w-full h-full rounded-full bg-white scale-50'></div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Alert>
        <Shield className='h-4 w-4' />
        <AlertDescription>
          You will be redirected to VNPAY's secure payment gateway to complete
          your transaction.
        </AlertDescription>
      </Alert>

      <Button
        onClick={handleProceedPayment}
        className='w-full'
        size='lg'
        disabled={!selectedOption || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            Connecting to VNPAY...
          </>
        ) : (
          `Pay $${course.price} with VNPAY`
        )}
      </Button>
    </div>
  )

  const renderProcessing = () => (
    <div className='text-center space-y-6 py-8'>
      <div className='flex justify-center'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
      <div>
        <h3 className='text-lg font-semibold mb-2'>Connecting to VNPAY</h3>
        <p className='text-muted-foreground'>
          Setting up your secure payment session...
        </p>
      </div>
    </div>
  )

  const renderRedirect = () => (
    <div className='text-center space-y-6 py-8'>
      <div className='flex justify-center'>
        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
          <ExternalLink className='h-8 w-8 text-blue-600' />
        </div>
      </div>
      <div>
        <h3 className='text-lg font-semibold mb-2'>Redirecting to VNPAY</h3>
        <p className='text-muted-foreground mb-4'>
          You will be redirected to VNPAY's secure payment gateway in{' '}
          <strong>{countdown}</strong> seconds.
        </p>
        <Alert>
          <AlertDescription>
            <strong>Demo Mode:</strong> This is a simulated VNPAY integration.
            In production, you would be redirected to the actual VNPAY gateway.
          </AlertDescription>
        </Alert>
      </div>
      <div className='space-y-3'>
        <Button onClick={() => setCountdown(0)} className='w-full' size='lg'>
          Continue to VNPAY Now
        </Button>
        <Button variant='outline' onClick={onBack} className='w-full'>
          Cancel Payment
        </Button>
      </div>
    </div>
  )

  const renderConfirming = () => (
    <div className='text-center space-y-6 py-8'>
      <div className='flex justify-center'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
      <div>
        <h3 className='text-lg font-semibold mb-2'>Confirming Payment</h3>
        <p className='text-muted-foreground'>
          Please wait while we confirm your payment with VNPAY...
        </p>
      </div>
    </div>
  )

  return (
    <div>
      {currentStep === 'options' && renderPaymentOptions()}
      {currentStep === 'processing' && renderProcessing()}
      {currentStep === 'redirect' && renderRedirect()}
      {currentStep === 'confirming' && renderConfirming()}
    </div>
  )
}
