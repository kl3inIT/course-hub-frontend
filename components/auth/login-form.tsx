'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { GoogleSignInButton } from './google-signin-button'
import { ForgotPasswordModal } from './forgot-password-modal'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { httpClient } from '@/api/http-client'

// Function to decode JWT token
function parseJwt(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )
  return JSON.parse(jsonPayload)
}

export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await httpClient.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      })

      const { data } = response.data

      if (!data?.token) {
        throw new Error('No token received from server')
      }

      // Lưu token vào localStorage
      const token = data.token

      // Giải mã token để lấy thông tin user
      const decodedToken = parseJwt(token)

      // Cập nhật context với thông tin user từ payload
      const user = {
        id: decodedToken.jti,
        email: decodedToken.sub,
        name: decodedToken.name,
        avatar: decodedToken.avatar,
        role: decodedToken.scope.toLowerCase(),
        joinDate: new Date().toISOString(),
      }

      await login(user, token)

      // Điều hướng dựa trên role
      if (decodedToken.scope === 'ADMIN') {
        router.push('/admin')
      } else if (decodedToken.scope === 'MANAGER') {
        router.push('/manager')
      } else {
        router.push('/')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(
        err.response?.data?.message ||
        err.message ||
        'An error occurred during login. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>
          Sign In
        </CardTitle>
        <CardDescription className='text-center'>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              placeholder='Enter your email'
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete='email'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                autoComplete='new-password'
                aria-autocomplete='none'
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          <div className='flex justify-end'>
            <button
              type='button'
              onClick={() => setShowForgotPassword(true)}
              className='text-sm text-primary hover:underline'
            >
              Forgot password?
            </button>
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='space-y-2'>
          <GoogleSignInButton />
        </div>
      </CardContent>
      <CardFooter>
        <div className='text-center text-sm text-muted-foreground w-full'>
          Don't have an account?{' '}
          <Link href='/register' className='text-primary hover:underline'>
            Sign up
          </Link>
        </div>
      </CardFooter>
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </Card>
  )
}