'use client'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return null
  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label='Toggle theme'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className='ml-2'
    >
      {theme === 'dark' ? (
        <Sun className='h-5 w-5' />
      ) : (
        <Moon className='h-5 w-5' />
      )}
    </Button>
  )
}
