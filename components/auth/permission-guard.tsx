"use client"

import type React from "react"
import { useAuth } from "@/context/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

interface PermissionGuardProps {
  permissions: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAll?: boolean // If true, user must have ALL permissions. If false, user needs ANY permission
}

export function PermissionGuard({ permissions, children, fallback, requireAll = false }: PermissionGuardProps) {
  const { user, hasPermission } = useAuth()

  if (!user) {
    return (
      fallback || (
        <Alert className="max-w-md mx-auto mt-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>Please log in to access this content.</AlertDescription>
        </Alert>
      )
    )
  }

  const hasRequiredPermissions = requireAll
    ? permissions.every((permission) => hasPermission(permission))
    : permissions.some((permission) => hasPermission(permission))

  if (!hasRequiredPermissions) {
    return (
      fallback || (
        <Alert variant="destructive" className="max-w-md mx-auto mt-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have the required permissions to access this content. Required:{" "}
            {permissions.join(requireAll ? " and " : " or ")}
          </AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
