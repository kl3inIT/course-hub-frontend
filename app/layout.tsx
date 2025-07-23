import { AuthProvider } from '@/context/auth-context'
import { FeedbackDetailProvider } from '@/context/feedback-detail-context'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type React from 'react'
import { Toaster } from 'sonner'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LearnHub - Professional Online Learning Platform',
  description: 'Transform your career with expert-led courses',
  generator: 'v0.dev',
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return (
    <button
      aria-label='Toggle theme'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{ position: 'fixed', top: 18, right: 24, zIndex: 50, background: 'none', border: 'none', cursor: 'pointer' }}
    >
      {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <ThemeToggleButton />
          <AuthProvider>
            <FeedbackDetailProvider>{children}</FeedbackDetailProvider>
          </AuthProvider>
          <Toaster position='top-right' richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
