'use client'

import type React from 'react'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, type UserRole } from '@/context/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Shield, LogIn } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requireAuth?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requireAuth = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && !user) {
      router.push(redirectTo)
    }
  }, [user, requireAuth, redirectTo, router])

  // Show loading or nothing while redirecting
  if (requireAuth && !user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-muted-foreground'>
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }

  // Check role permissions
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Alert className='max-w-md border-destructive'>
          <Shield className='h-4 w-4' />
          <AlertDescription className='mt-2'>
            <div className='space-y-3'>
              <div>
                <h3 className='font-semibold'>Access Denied</h3>
                <p>You don't have permission to access this page.</p>
                <p className='text-sm mt-1'>
                  Required role: {allowedRoles.join(' or ')}
                </p>
                <p className='text-sm'>Your role: {user.role}</p>
              </div>
              <div className='flex space-x-2'>
                <Button
                  onClick={() => router.back()}
                  variant='outline'
                  size='sm'
                >
                  Go Back
                </Button>
                <Button onClick={() => router.push('/')} size='sm'>
                  Go Home
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // User not authenticated and auth is required
  if (requireAuth && !user) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Alert className='max-w-md'>
          <LogIn className='h-4 w-4' />
          <AlertDescription className='mt-2'>
            <div className='space-y-3'>
              <div>
                <h3 className='font-semibold'>Authentication Required</h3>
                <p>Please log in to access this page.</p>
              </div>
              <Button onClick={() => router.push('/login')} size='sm'>
                Go to Login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
