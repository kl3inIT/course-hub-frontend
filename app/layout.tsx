import { AuthProvider } from '@/context/auth-context'
import { FeedbackDetailProvider } from '@/context/feedback-detail-context'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type React from 'react'
import { Toaster } from 'sonner'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Course Hub Online Traning SystemSystem',
  description: 'Transform your career with expert-led courses',
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
          <AuthProvider>
            <FeedbackDetailProvider>{children}</FeedbackDetailProvider>
          </AuthProvider>
          <Toaster position='top-right' richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
