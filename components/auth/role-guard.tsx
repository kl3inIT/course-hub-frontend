'use client'

import type React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, type UserRole } from '@/context/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  redirectOnUnauthorized?: boolean
  redirectTo?: string
}

export function RoleGuard({
                            children,
                            allowedRoles,
                            redirectOnUnauthorized = true,
                            redirectTo = '/unauthorized',
                          }: RoleGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-muted-foreground'>Checking permissions...</p>
        </div>
      </div>
    )
  }

  // Check if user has required role
  const hasRequiredRole = user && allowedRoles.includes(user.role)

  // If user is not authenticated or doesn't have required role
  if (!user || !hasRequiredRole) {
    if (redirectOnUnauthorized) {
      // Redirect to unauthorized page with role information
      const searchParams = new URLSearchParams()
      if (user) {
        searchParams.set('currentRole', user.role)
      }
      searchParams.set('requiredRole', allowedRoles.join(','))
      router.push(`${redirectTo}?${searchParams.toString()}`)
      return null
    }

    // Show access denied message if not redirecting
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
                {user && <p className='text-sm'>Your role: {user.role}</p>}
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

  return <>{children}</>
}