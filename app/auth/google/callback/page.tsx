'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'
import { httpClient } from '@/services/http-client'

// Hàm giải mã JWT
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

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const hasHandled = useRef(false) // Ngăn chạy lại

  useEffect(() => {
    if (hasHandled.current) return
    hasHandled.current = true

    const code = searchParams.get('code')
    const returnUrl = searchParams.get('state') // Google OAuth state parameter contains returnUrl

    if (!code) {
      router.push('/login?error=No code received from Google')
      return
    }

    const handleGoogleCallback = async () => {
      try {
        const response = await httpClient.post('/api/auth/google/callback', {
          code,
        })
        const { data } = response.data

        if (!data?.token) {
          throw new Error('No token received from server')
        }

        const token = data.token
        const decodedToken = parseJwt(token)

        const user = {
          id: decodedToken.jti,
          email: decodedToken.sub,
          name: decodedToken.name,
          avatar: decodedToken.avatar,
          role: decodedToken.scope.toLowerCase(),
          joinDate: new Date().toISOString(),
        }

        await login(user, token)

        // Điều hướng theo role hoặc returnUrl
        const baseUrl = window.location.origin
        if (decodedToken.scope === 'ADMIN') {
          window.location.href = `${baseUrl}/admin`
        } else if (decodedToken.scope === 'MANAGER') {
          window.location.href = `${baseUrl}/manager`
        } else if (returnUrl) {
          // Nếu có returnUrl (từ state parameter), sử dụng nó
          const fullUrl = returnUrl.startsWith('http')
            ? returnUrl
            : `${baseUrl}${returnUrl.startsWith('/') ? '' : '/'}${returnUrl}`
          window.location.href = decodeURIComponent(fullUrl)
        } else {
          window.location.href = baseUrl
        }
      } catch (error: any) {
        console.error('Google authentication error:', error)
        router.push(
          `/login?error=${encodeURIComponent(error.message || 'Failed to authenticate with Google')}`
        )
      }
    }

    handleGoogleCallback()
  }, [searchParams, router, login])

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <Card className='w-full max-w-md'>
        <CardContent className='flex flex-col items-center p-6'>
          <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
          <p className='mt-4 text-center text-muted-foreground'>
            Completing Google sign in...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
