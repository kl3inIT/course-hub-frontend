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
import { Badge } from '@/components/ui/badge'
import { Mail, Smartphone, Shield, Key } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { OTPConfirmation } from '@/components/auth/otp-confirmation'

type DemoType =
  | 'email-verification'
  | 'password-reset'
  | 'two-factor'
  | 'phone-verification'
  | null

export default function OTPDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<DemoType>(null)

  const demos = [
    {
      type: 'email-verification' as const,
      title: 'Email Verification',
      description: 'Verify email address during registration',
      icon: <Mail className='h-6 w-6 text-blue-500' />,
      destination: 'user@example.com',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      type: 'password-reset' as const,
      title: 'Password Reset',
      description: 'Confirm identity before password reset',
      icon: <Key className='h-6 w-6 text-green-500' />,
      destination: 'user@example.com',
      color: 'bg-green-50 border-green-200',
    },
    {
      type: 'two-factor' as const,
      title: 'Two-Factor Authentication',
      description: 'Additional security layer for login',
      icon: <Shield className='h-6 w-6 text-purple-500' />,
      destination: '+1 (555) 123-4567',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      type: 'phone-verification' as const,
      title: 'Phone Verification',
      description: 'Verify phone number for account security',
      icon: <Smartphone className='h-6 w-6 text-orange-500' />,
      destination: '+1 (555) 123-4567',
      color: 'bg-orange-50 border-orange-200',
    },
  ]

  const handleSuccess = (data: any) => {
    alert(`${selectedDemo} verification successful! Code: ${data.code}`)
    setSelectedDemo(null)
  }

  const handleBack = () => {
    setSelectedDemo(null)
  }

  if (selectedDemo) {
    const demo = demos.find(d => d.type === selectedDemo)!
    return (
      <div className='min-h-screen bg-background'>
        <Navbar />
        <div className='container mx-auto px-4 py-16'>
          <OTPConfirmation
            type={selectedDemo}
            destination={demo.destination}
            onSuccess={handleSuccess}
            onBack={handleBack}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold mb-4'>OTP Verification Demo</h1>
            <p className='text-xl text-muted-foreground mb-6'>
              Experience our comprehensive One-Time Password verification system
            </p>
            <Badge variant='outline' className='text-sm'>
              Interactive Demo - Try all verification types
            </Badge>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12'>
            {demos.map(demo => (
              <Card
                key={demo.type}
                className={`cursor-pointer transition-all hover:shadow-lg ${demo.color}`}
                onClick={() => setSelectedDemo(demo.type)}
              >
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    {demo.icon}
                    <div>
                      <CardTitle className='text-lg'>{demo.title}</CardTitle>
                      <CardDescription>{demo.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <p className='text-sm text-muted-foreground'>
                      <strong>Destination:</strong> {demo.destination}
                    </p>
                    <Button variant='outline' className='w-full'>
                      Try Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>Features Demonstrated</CardTitle>
              <CardDescription>
                Our OTP verification system includes all these features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <h4 className='font-semibold'>User Experience</h4>
                  <ul className='text-sm text-muted-foreground space-y-1'>
                    <li>• Auto-focus and navigation between inputs</li>
                    <li>• Paste support for quick entry</li>
                    <li>• Auto-submit when complete</li>
                    <li>• Clear visual feedback</li>
                    <li>• Responsive design</li>
                  </ul>
                </div>
                <div className='space-y-2'>
                  <h4 className='font-semibold'>Security & Reliability</h4>
                  <ul className='text-sm text-muted-foreground space-y-1'>
                    <li>• Attempt limiting (5 max attempts)</li>
                    <li>• Resend cooldown (60 seconds)</li>
                    <li>• Expiration handling</li>
                    <li>• Input validation</li>
                    <li>• Error handling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3 text-sm'>
                <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                  <p className='font-medium text-green-800'>✅ Success Code</p>
                  <p className='text-green-700'>
                    Enter{' '}
                    <code className='bg-green-100 px-1 rounded'>123456</code>{' '}
                    for successful verification
                  </p>
                </div>
                <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                  <p className='font-medium text-yellow-800'>⏰ Expired Code</p>
                  <p className='text-yellow-700'>
                    Enter{' '}
                    <code className='bg-yellow-100 px-1 rounded'>000000</code>{' '}
                    to simulate expired code
                  </p>
                </div>
                <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                  <p className='font-medium text-red-800'>❌ Invalid Code</p>
                  <p className='text-red-700'>
                    Enter any other 6-digit code to see error handling
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
