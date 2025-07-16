'use client'

import type React from 'react'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, type UserRole } from '@/context/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Shield, LogIn } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requireAuth = true,
  redirectTo = '/login',
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, requireAuth, redirectTo, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner message='Checking authentication...' fullScreen />
  }

  // Check role permissions
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Alert className='max-w-md border-destructive' role='alert'>
          <Shield className='h-4 w-4' aria-hidden='true' />
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
                  aria-label='Go back to previous page'
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  size='sm'
                  aria-label='Go to home page'
                >
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
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Alert className='max-w-md' role='alert'>
          <LogIn className='h-4 w-4' aria-hidden='true' />
          <AlertDescription className='mt-2'>
            <div className='space-y-3'>
              <div>
                <h3 className='font-semibold'>Authentication Required</h3>
                <p>Please log in to access this page.</p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                size='sm'
                aria-label='Go to login page'
              >
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
