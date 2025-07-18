'use client'

import { httpClient } from '@/services/http-client'
import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

// Định nghĩa các role có trong hệ thống
export type UserRole = 'learner' | 'manager' | 'admin'

// Interface cho thông tin user
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  joinDate?: string
}

// Interface cho AuthContext
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (userData: User, token: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  isRole: (role: UserRole) => boolean
  getToken: () => string | null
}

// Tạo context với giá trị mặc định là undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user data từ localStorage khi component mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user')
        const token = localStorage.getItem('accessToken')

        if (userData && token) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Hàm đăng nhập
  const login = async (userData: User, token: string): Promise<void> => {
    try {
      // Lưu thông tin user và token
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('accessToken', token)

      // Kiểm tra và xử lý redirect
      const urlParams = new URLSearchParams(window.location.search)
      const redirectUrl = urlParams.get('redirect')
      if (redirectUrl) {
        window.location.href = decodeURIComponent(redirectUrl)
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Hàm đăng xuất
  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        // Gọi API logout
        // Xóa thông tin user và token
        setUser(null)
        localStorage.clear()
        await httpClient.post('/api/auth/logout', { token })     
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Hàm cập nhật thông tin user
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  // Hàm kiểm tra role
  const isRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  // Hàm lấy token
  const getToken = (): string | null => {
    return localStorage.getItem('accessToken')
  }

  // Giá trị context
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isRole,
    getToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook để sử dụng auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
