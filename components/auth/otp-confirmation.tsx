'use client'

import type React from 'react'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  AlertCircle,
  Mail,
  MessageSquare,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react'
import { httpClient } from '@/services/http-client'

interface OTPConfirmationProps {
  type:
    | 'email-verification'
    | 'password-reset'
    | 'two-factor'
    | 'phone-verification'
  destination: string // email or phone number
  onSuccess: (data?: any) => void
  onBack?: () => void
  title?: string
  description?: string
}

export function OTPConfirmation({
  type,
  destination,
  onSuccess,
  onBack,
  title,
  description,
}: OTPConfirmationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const maxAttempts = 5
  const otpLength = 6
  const cooldownTime = 60 // seconds

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      )
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const getTypeConfig = () => {
    switch (type) {
      case 'email-verification':
        return {
          icon: <Mail className='h-6 w-6 text-blue-500' />,
          title: title || 'Verify Your Email',
          description:
            description || `We've sent a verification code to ${destination}`,
          successMessage: 'Email verified successfully!',
          resendText: 'Resend verification code',
        }
      case 'password-reset':
        return {
          icon: <Mail className='h-6 w-6 text-green-500' />,
          title: title || 'Confirm Password Reset',
          description:
            description ||
            `Enter the code sent to ${destination} to reset your password`,
          successMessage: 'Code verified! Redirecting to password reset...',
          resendText: 'Resend reset code',
        }
      case 'two-factor':
        return {
          icon: <CheckCircle className='h-6 w-6 text-purple-500' />,
          title: title || 'Two-Factor Authentication',
          description:
            description ||
            `Enter the 6-digit code from your authenticator app or SMS`,
          successMessage: 'Authentication successful!',
          resendText: 'Resend SMS code',
        }
      case 'phone-verification':
        return {
          icon: <MessageSquare className='h-6 w-6 text-orange-500' />,
          title: title || 'Verify Your Phone',
          description:
            description || `We've sent a verification code to ${destination}`,
          successMessage: 'Phone number verified successfully!',
          resendText: 'Resend SMS code',
        }
      default:
        return {
          icon: <Mail className='h-6 w-6' />,
          title: 'Verify Code',
          description: `Enter the code sent to ${destination}`,
          successMessage: 'Verification successful!',
          resendText: 'Resend code',
        }
    }
  }

  const config = getTypeConfig()

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take the last character

    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (
      newOtp.every(digit => digit !== '') &&
      newOtp.join('').length === otpLength
    ) {
      setTimeout(() => handleSubmit(newOtp.join('')), 100)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, otpLength)
    const newOtp = [...otp]

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }

    setOtp(newOtp)

    // Focus the next empty field or the last field
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '')
    const focusIndex = nextEmptyIndex === -1 ? otpLength - 1 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()

    // Auto-submit if complete
    if (pastedData.length === otpLength) {
      setTimeout(() => handleSubmit(pastedData), 100)
    }
  }

  const handleSubmit = async (otpCode?: string) => {
    const code = otpCode || otp.join('')
    if (code.length !== otpLength) {
      setError('Please enter the complete verification code')
      return
    }

    setIsLoading(true)
    setError('')
    setAttempts(prev => prev + 1)

    try {
      let endpoint = ''

      switch (type) {
        case 'email-verification':
          endpoint = '/api/auth/register/verify'
          break
        case 'password-reset':
          endpoint = '/api/auth/forgot-password/verify-otp'
          break
        default:
          throw new Error('Invalid verification type')
      }

      const response = await httpClient.post(endpoint, {
        email: destination,
        otp: code,
      })

      setSuccess(true)
      setTimeout(() => {
        onSuccess(response.data)
      }, 1500)
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Error validating verification code. Please try again.'
      )
      if (attempts >= maxAttempts - 1) {
        setError(
          'Too many failed attempts. Please request a new verification code.'
        )
      }
    }

    setIsLoading(false)
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)
    setError('')
    setAttempts(0)

    try {
      let endpoint = ''

      switch (type) {
        case 'email-verification':
          endpoint = '/api/auth/register/re-send-otp'
          break
        case 'password-reset':
          endpoint = '/api/auth/forgot-password/send-otp'
          break
        default:
          throw new Error('Invalid OTP type')
      }

      await httpClient.post(endpoint, {
        email: destination,
      })

      setResendCooldown(cooldownTime)
      // Clear current OTP
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (error: any) {
      setError(
        error.response?.data?.message || 'Failed to resend verification code'
      )
    } finally {
      setIsResending(false)
    }
  }

  const clearOtp = () => {
    setOtp(['', '', '', '', '', ''])
    setError('')
    inputRefs.current[0]?.focus()
  }

  if (success) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardContent className='text-center space-y-6 p-8'>
          <div className='flex justify-center'>
            <div className='rounded-full bg-green-100 p-4'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
          </div>
          <div>
            <CardTitle className='text-xl mb-2'>
              Verification Successful!
            </CardTitle>
            <CardDescription>{config.successMessage}</CardDescription>
          </div>
          <div className='flex items-center justify-center space-x-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
            <span className='text-sm text-muted-foreground'>
              Redirecting...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='text-center space-y-4'>
        <div className='flex justify-center'>{config.icon}</div>
        <div>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription className='mt-2'>
            {config.description}
          </CardDescription>
        </div>
        {attempts > 0 && (
          <Badge variant='outline' className='mx-auto'>
            Attempt {attempts} of {maxAttempts}
          </Badge>
        )}
      </CardHeader>

      <CardContent className='space-y-6'>
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='space-y-4'>
          <div className='flex justify-center space-x-2'>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el: HTMLInputElement | null) => {
                  inputRefs.current[index] = el
                }}
                type='text'
                inputMode='numeric'
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className='w-12 h-12 text-center text-lg font-semibold'
                disabled={isLoading}
                aria-label={`Digit ${index + 1} of verification code`}
              />
            ))}
          </div>

          <div className='text-center text-sm text-muted-foreground'>
            <p>Enter the 6-digit code sent to</p>
            <p className='font-medium'>{destination}</p>
          </div>
        </div>

        <div className='space-y-3'>
          <Button
            onClick={() => handleSubmit()}
            disabled={isLoading || otp.some(digit => digit === '')}
            className='w-full'
          >
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className='flex items-center justify-between'>
            <Button
              variant='ghost'
              size='sm'
              onClick={clearOtp}
              disabled={isLoading}
            >
              Clear
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className='flex items-center gap-2'
            >
              {isResending ? (
                <>
                  <RefreshCw className='h-4 w-4 animate-spin' />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <>
                  <RefreshCw className='h-4 w-4' />
                  {config.resendText}
                </>
              )}
            </Button>
          </div>
        </div>

        {onBack && (
          <div className='text-center'>
            <Button variant='ghost' onClick={onBack} className='text-sm'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
          </div>
        )}

        <div className='text-xs text-muted-foreground bg-muted p-3 rounded-lg'>
          <p className='font-medium mb-1'>Demo Instructions:</p>
          <p>• Enter "123456" for successful verification</p>
          <p>• Enter "000000" to simulate expired code</p>
          <p>• Any other code will show invalid error</p>
        </div>
      </CardContent>
    </Card>
  )
}
