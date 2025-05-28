"use client"

import { useAuth, type UserRole } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useRBAC() {
  const { user, hasPermission, isRole } = useAuth()
  const router = useRouter()

  const checkAccess = useCallback(
    (allowedRoles: UserRole[]): boolean => {
      if (!user) return false
      return allowedRoles.includes(user.role)
    },
    [user],
  )

  const checkPermission = useCallback(
    (permission: string): boolean => {
      return hasPermission(permission)
    },
    [hasPermission],
  )

  const checkMultiplePermissions = useCallback(
    (permissions: string[], requireAll = false): boolean => {
      if (!user) return false

      return requireAll
        ? permissions.every((permission) => hasPermission(permission))
        : permissions.some((permission) => hasPermission(permission))
    },
    [user, hasPermission],
  )

  const redirectIfUnauthorized = useCallback(
    (allowedRoles: UserRole[], redirectPath = "/unauthorized"): boolean => {
      if (!checkAccess(allowedRoles)) {
        const params = new URLSearchParams({
          requiredRole: allowedRoles.join(" or "),
          currentRole: user?.role || "none",
        })
        router.push(`${redirectPath}?${params.toString()}`)
        return false
      }
      return true
    },
    [checkAccess, router, user],
  )

  const canAccessRoute = useCallback(
    (route: string): boolean => {
      if (!user) return false

      // Define route access rules
      const routeRules: Record<string, UserRole[]> = {
        "/admin": ["admin"],
        "/manager": ["manager", "admin"],
        "/create-course": ["manager", "admin"],
        "/profile/edit": ["learner", "manager", "admin"],
        "/profile/create": ["learner", "manager", "admin"],
      }

      const allowedRoles = routeRules[route]
      if (!allowedRoles) return true // Public route

      return allowedRoles.includes(user.role)
    },
    [user],
  )

  const canAccessCourse = useCallback(
    (courseId: string): boolean => {
      if (!user) return false

      // Managers and admins can access any course without enrollment
      if (user.role === "manager" || user.role === "admin") {
        return true
      }

      // Learners need to be enrolled
      const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "[]")
      return enrolledCourses.includes(courseId)
    },
    [user],
  )

  return {
    user,
    checkAccess,
    checkPermission,
    checkMultiplePermissions,
    redirectIfUnauthorized,
    canAccessRoute,
    canAccessCourse,
    isRole,
    hasPermission,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    isLearner: user?.role === "learner",
  }
}
