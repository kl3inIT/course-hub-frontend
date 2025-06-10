'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Smartphone, Mail, Shield, Copy, CheckCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { OTPConfirmation } from '@/components/auth/otp-confirmation'

export default function Setup2FAPage() {
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [method, setMethod] = useState<'sms' | 'email'>('sms')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [qrSecret, setQrSecret] = useState('JBSWY3DPEHPK3PXP')
  const [backupCodes] = useState([
    '1a2b3c4d',
    '5e6f7g8h',
    '9i0j1k2l',
    '3m4n5o6p',
    '7q8r9s0t',
    '1u2v3w4x',
    '5y6z7a8b',
    '9c0d1e2f',
  ])

  const handleSetup = async () => {
    setIsLoading(true)

    // Simulate API call to send OTP
    setTimeout(() => {
      setIsLoading(false)
      setStep('verify')
    }, 1000)
  }

  const handleVerificationSuccess = () => {
    // Redirect to dashboard or profile
    window.location.href = '/dashboard?2fa=enabled'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (step === 'verify') {
    return (
      <div className='min-h-screen bg-background'>
        <Navbar />
        <div className='container mx-auto px-4 py-16'>
          <OTPConfirmation
            type='two-factor'
            destination={method === 'sms' ? phoneNumber : email}
            onSuccess={handleVerificationSuccess}
            onBack={() => setStep('setup')}
            title='Verify Two-Factor Authentication'
            description={`Enter the verification code sent to your ${method === 'sms' ? 'phone' : 'email'}`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-16 max-w-2xl'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold mb-2'>
            Set Up Two-Factor Authentication
          </h1>
          <p className='text-muted-foreground'>
            Add an extra layer of security to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-green-500' />
              Choose Your 2FA Method
            </CardTitle>
            <CardDescription>
              Select how you'd like to receive your two-factor authentication
              codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={method}
              onValueChange={value => setMethod(value as 'sms' | 'email')}
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='sms' className='flex items-center gap-2'>
                  <Smartphone className='h-4 w-4' />
                  SMS
                </TabsTrigger>
                <TabsTrigger value='email' className='flex items-center gap-2'>
                  <Mail className='h-4 w-4' />
                  Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value='sms' className='space-y-4'>
                <Alert>
                  <Smartphone className='h-4 w-4' />
                  <AlertDescription>
                    We'll send a 6-digit code to your phone number whenever you
                    sign in.
                  </AlertDescription>
                </Alert>

                <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone Number</Label>
                  <Input
                    id='phone'
                    type='tel'
                    placeholder='+1 (555) 123-4567'
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSetup}
                  disabled={!phoneNumber || isLoading}
                  className='w-full'
                >
                  {isLoading ? 'Setting up...' : 'Send Verification Code'}
                </Button>
              </TabsContent>

              <TabsContent value='email' className='space-y-4'>
                <Alert>
                  <Mail className='h-4 w-4' />
                  <AlertDescription>
                    We'll send a 6-digit code to your email address whenever you
                    sign in.
                  </AlertDescription>
                </Alert>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email Address</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='your@email.com'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSetup}
                  disabled={!email || isLoading}
                  className='w-full'
                >
                  {isLoading ? 'Setting up...' : 'Send Verification Code'}
                </Button>
              </TabsContent>
            </Tabs>

            <div className='mt-8 space-y-4'>
              <div className='border-t pt-6'>
                <h3 className='font-semibold mb-3'>Backup Recovery Codes</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Save these backup codes in a safe place. You can use them to
                  access your account if you lose access to your 2FA method.
                </p>

                <div className='grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg'>
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between bg-background p-2 rounded'
                    >
                      <code className='text-sm font-mono'>{code}</code>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => copyToClipboard(code)}
                        className='h-6 w-6 p-0'
                      >
                        <Copy className='h-3 w-3' />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className='flex items-center gap-2 mt-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                    className='flex items-center gap-2'
                  >
                    <Copy className='h-4 w-4' />
                    Copy All Codes
                  </Button>
                  <Badge variant='outline' className='text-xs'>
                    <CheckCircle className='h-3 w-3 mr-1' />
                    Each code can only be used once
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
