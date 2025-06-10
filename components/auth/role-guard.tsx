'use client'

import type React from 'react'
import { useAuth, type UserRole } from '@/context/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useState } from 'react'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
  showActions?: boolean
  redirectOnUnauthorized?: boolean
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback,
  showActions = true,
  redirectOnUnauthorized = false,
}: RoleGuardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // Handle loading state
    if (user !== undefined) {
      setIsLoading(false)
    }

    // Handle redirects in useEffect to avoid state updates during render
    if (!isLoading && redirectOnUnauthorized) {
      if (!user) {
        setShouldRedirect(true)
      } else if (!allowedRoles.includes(user.role)) {
        setShouldRedirect(true)
      }
    }
  }, [user, isLoading, redirectOnUnauthorized, allowedRoles])

  useEffect(() => {
    if (shouldRedirect) {
      if (!user) {
        router.push('/login')
      } else if (!allowedRoles.includes(user.role)) {
        router.push(
          `/unauthorized?requiredRole=${allowedRoles.join(' or ')}&currentRole=${user.role}`
        )
      }
      setShouldRedirect(false)
    }
  }, [shouldRedirect, user, allowedRoles, router])

  // Loading state while auth is being determined
  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-32 w-full' />
      </div>
    )
  }

  // User not authenticated
  if (!user) {
    if (redirectOnUnauthorized) {
      return (
        <div className='space-y-4 p-6'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-full' />
        </div>
      )
    }

    return (
      fallback || (
        <Alert className='max-w-md mx-auto mt-8'>
          <Shield className='h-4 w-4' />
          <AlertDescription className='space-y-4'>
            <p>Please log in to access this content.</p>
            {showActions && (
              <div className='flex gap-2'>
                <Button size='sm' onClick={() => router.push('/login')}>
                  Log In
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => router.push('/')}
                >
                  <Home className='mr-2 h-4 w-4' />
                  Home
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )
    )
  }

  // User doesn't have required role
  if (!allowedRoles.includes(user.role)) {
    if (redirectOnUnauthorized) {
      return (
        <div className='space-y-4 p-6'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-full' />
        </div>
      )
    }

    return (
      fallback || (
        <Alert variant='destructive' className='max-w-md mx-auto mt-8'>
          <Shield className='h-4 w-4' />
          <AlertDescription className='space-y-4'>
            <div>
              <p className='font-medium'>Access Denied</p>
              <p className='text-sm'>
                You don't have permission to access this content. Required role:{' '}
                <strong>{allowedRoles.join(' or ')}</strong>
              </p>
              <p className='text-sm'>
                Your current role:{' '}
                <strong className='capitalize'>{user.role}</strong>
              </p>
            </div>
            {showActions && (
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => router.back()}
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Go Back
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => router.push('/')}
                >
                  <Home className='mr-2 h-4 w-4' />
                  Home
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
