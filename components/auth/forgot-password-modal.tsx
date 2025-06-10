'use client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import Link from 'next/link'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Mail className='h-5 w-5' />
            Reset Your Password
          </DialogTitle>
          <DialogDescription>
            We'll send you a secure 6-digit verification code to reset your
            password safely.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='text-sm text-muted-foreground space-y-2'>
            <p>Our secure OTP-based reset process includes:</p>
            <ul className='list-disc list-inside space-y-1 text-xs'>
              <li>6-digit verification code via email</li>
              <li>10-minute code expiration</li>
              <li>Attempt limiting and rate protection</li>
              <li>Strong password requirements</li>
              <li>Secure token generation</li>
            </ul>
          </div>

          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              className='flex-1'
            >
              Cancel
            </Button>
            <Link href='/forgot-password' className='flex-1'>
              <Button className='w-full' onClick={handleClose}>
                Continue to Reset
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
