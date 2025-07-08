import { AuthProvider } from '@/context/auth-context'
import { FeedbackDetailProvider } from '@/context/feedback-detail-context'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type React from 'react'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang='en'>
      <body className={inter.className}>
        <AuthProvider>
          <FeedbackDetailProvider>
            {children}
          </FeedbackDetailProvider>
        </AuthProvider>
        <Toaster position='top-right' richColors closeButton />
      </body>
    </html>
  )
}
