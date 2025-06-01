"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export type UserRole = "learner" | "manager" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  joinDate?: string
  permissions?: string[]
}

interface AuthContextType {
  user: User | null | undefined
  login: (userData: User, token: string) => Promise<boolean>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  hasPermission: (permission: string) => boolean
  isRole: (role: UserRole) => boolean
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Comprehensive role-based permissions
const PERMISSIONS = {
  learner: [
    "view_courses",
    "enroll_courses",
    "view_progress",
    "access_learning_materials",
    "submit_assignments",
    "view_certificates",
    "write_reviews",
    "view_notifications",
  ],
  manager: [
    // Course Management
    "create_courses",
    "edit_courses",
    "delete_courses",
    "manage_course_catalog",

    // Content Management
    "upload_content",
    "manage_videos",
    "manage_documents",
    "manage_exercises",
    "edit_course_content",

    // Reporting
    "view_course_reports",
    "view_student_analytics",
    "view_course_revenue",
    "view_course_reviews",

    // Promotions
    "create_promotions",
    "manage_discount_codes",
    "edit_promotions",
    "delete_promotions",

    // Reviews
    "approve_reviews",
    "moderate_reviews",
    "respond_to_reviews",

    // Notifications
    "create_notifications",
    "manage_news",
    "send_announcements",

    // Basic learner permissions
    "view_courses",
    "access_learning_materials",

    // Add to manager permissions array
    "create_modules",
    "edit_modules",
    "delete_modules",
    "create_lessons",
    "edit_lessons",
    "delete_lessons",
    "upload_videos",
    "manage_course_content",
  ],
  admin: [
    // Account Management
    "create_user_accounts",
    "edit_user_accounts",
    "delete_user_accounts",
    "create_manager_accounts",
    "edit_manager_accounts",
    "delete_manager_accounts",
    "assign_permissions",
    "manage_user_roles",

    // Payment Management
    "view_transactions",
    "process_refunds",
    "manage_payment_methods",
    "view_financial_reports",

    // System Reporting
    "view_overview_reports",
    "view_revenue_reports",
    "view_user_statistics",
    "view_popular_courses",
    "export_reports",

    // System Configuration
    "manage_website_settings",
    "configure_system",
    "manage_integrations",
    "backup_system",

    // Support
    "handle_complaints",
    "provide_technical_support",
    "manage_support_tickets",
    "access_user_data",

    // Homepage Management
    "edit_homepage",
    "manage_content_pages",
    "update_site_information",
    "manage_banners",

    // All manager permissions
    "create_courses",
    "edit_courses",
    "delete_courses",
    "manage_course_catalog",
    "upload_content",
    "manage_videos",
    "manage_documents",
    "manage_exercises",
    "view_course_reports",
    "create_promotions",
    "manage_discount_codes",
    "approve_reviews",
    "create_notifications",
    "manage_news",

    // All learner permissions
    "view_courses",
    "enroll_courses",
    "access_learning_materials",

    // Add to admin permissions array (they inherit all manager permissions)
    "create_modules",
    "edit_modules",
    "delete_modules",
    "create_lessons",
    "edit_lessons",
    "delete_lessons",
    "upload_videos",
    "manage_course_content",
  ],
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const syncUserToCookie = useCallback((userData: User | null) => {
    if (typeof window !== "undefined") {
      if (userData) {
        // Set cookie for middleware access
        document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=86400; SameSite=Strict`
      } else {
        // Clear cookie
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
      }
    }
  }, [])

  useEffect(() => {
    // Check for existing user session
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        syncUserToCookie(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("user")
      }
    }
    setIsInitialized(true)
  }, [syncUserToCookie])

  const login = async (userData: User, token: string): Promise<boolean> => {
    try {
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("accessToken", token)
      syncUserToCookie(userData)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (token) {
        const response = await fetch('http://localhost:8080/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })  // Gửi token trong body
        });

        if (!response.ok) {
          throw new Error('Logout failed');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("enrolledCourses")
      localStorage.removeItem("courseProgress")
      syncUserToCookie(null)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
      syncUserToCookie(updatedUser)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    const rolePermissions = PERMISSIONS[user.role] || []
    return rolePermissions.includes(permission)
  }

  const isRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const getToken = (): string | null => {
    return localStorage.getItem("accessToken")
  }

  const value: AuthContextType = {
    user: isInitialized ? user : undefined, // Return undefined during initialization
    login,
    logout,
    updateUser,
    hasPermission,
    isRole,
    getToken
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
