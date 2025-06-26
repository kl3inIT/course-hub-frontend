import { useAuth, type UserRole } from '@/context/auth-context'
import { useMemo } from 'react'

interface UseAuthGuardOptions {
  allowedRoles?: UserRole[]
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { user, isLoading } = useAuth()
  const { allowedRoles = [] } = options

  const authState = useMemo(() => {
    if (isLoading) {
      return {
        status: 'loading' as const,
        canAccess: false,
        reason: null,
      }
    }

    if (!user) {
      return {
        status: 'unauthenticated' as const,
        canAccess: false,
        reason: 'User not logged in',
      }
    }

    // Check role permissions
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        status: 'unauthorized' as const,
        canAccess: false,
        reason: `Required role: ${allowedRoles.join(' or ')}, but user has: ${user.role}`,
      }
    }

    return {
      status: 'authorized' as const,
      canAccess: true,
      reason: null,
    }
  }, [user, isLoading, allowedRoles])

  return {
    ...authState,
    user,
    isLoading,
  }
}
