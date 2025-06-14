'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, ArrowLeft, Home, LogIn } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useEffect } from 'react'

export default function UnauthorizedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, logout } = useAuth()

  const requiredRole = searchParams.get('requiredRole')
  const currentRole = searchParams.get('currentRole')

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleSwitchAccount = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
            <Shield className='h-6 w-6 text-destructive' />
          </div>
          <CardTitle className='text-2xl font-bold'>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert variant='destructive'>
            <Shield className='h-4 w-4' />
            <AlertDescription>
              {requiredRole ? (
                <>
                  This page requires <strong>{requiredRole}</strong> role
                  access.
                  {currentRole && (
                    <>
                      {' '}
                      Your current role is <strong>{currentRole}</strong>.
                    </>
                  )}
                </>
              ) : (
                "You don't have the necessary permissions to view this page."
              )}
            </AlertDescription>
          </Alert>

          {user && (
            <div className='text-sm text-muted-foreground'>
              <p>
                Logged in as: <strong>{user.email}</strong>
              </p>
              <p>
                Role: <strong className='capitalize'>{user.role}</strong>
              </p>
            </div>
          )}

          <div className='space-y-2'>
            <Button onClick={handleGoBack} variant='outline' className='w-full'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
            <Button onClick={handleGoHome} variant='outline' className='w-full'>
              <Home className='mr-2 h-4 w-4' />
              Go to Homepage
            </Button>
            <Button
              onClick={handleSwitchAccount}
              variant='secondary'
              className='w-full'
            >
              <LogIn className='mr-2 h-4 w-4' />
              Switch Account
            </Button>
          </div>

          <div className='text-xs text-muted-foreground text-center'>
            If you believe this is an error, please contact your administrator.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
