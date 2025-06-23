import type React from 'react'
import type { Metadata } from 'next'
import { Inter, Ms_Madi, Dancing_Script } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const msMadi = Ms_Madi({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-ms-madi',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-dancing-script'
})

export const metadata: Metadata = {
  title: 'LearnHub - Professional Online Learning Platform',
  description: 'Transform your career with expert-led courses',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          msMadi.variable,
          dancingScript.variable
        )}
      >
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Toaster position='top-right' richColors closeButton />
      </body>
    </html>
  )
}
