"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface AccessDeniedProps {
  title?: string
  description?: string
  requiredRole?: string
  currentRole?: string
  showActions?: boolean
  variant?: "alert" | "card"
}

export function AccessDenied({
  title = "Access Denied",
  description = "You don't have permission to access this resource",
  requiredRole,
  currentRole,
  showActions = true,
  variant = "alert",
}: AccessDeniedProps) {
  const router = useRouter()

  const content = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4 text-destructive" />
        <span className="font-medium">{title}</span>
      </div>
      <div className="space-y-2">
        <p className="text-sm">{description}</p>
        {requiredRole && (
          <p className="text-sm">
            Required role: <strong>{requiredRole}</strong>
          </p>
        )}
        {currentRole && (
          <p className="text-sm">
            Your current role: <strong className="capitalize">{currentRole}</strong>
          </p>
        )}
      </div>
      {showActions && (
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button size="sm" variant="outline" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>
      )}
    </>
  )

  if (variant === "card") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {(requiredRole || currentRole) && (
            <div className="space-y-1 mb-4 text-sm">
              {requiredRole && (
                <p>
                  Required role: <strong>{requiredRole}</strong>
                </p>
              )}
              {currentRole && (
                <p>
                  Your current role: <strong className="capitalize">{currentRole}</strong>
                </p>
              )}
            </div>
          )}
          {showActions && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button size="sm" variant="outline" onClick={() => router.push("/")}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Alert variant="destructive" className="max-w-md mx-auto">
      <AlertDescription>{content}</AlertDescription>
    </Alert>
  )
}
