"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { paymentStorage } from '@/utils/payment'

interface PaymentResponseDTO {
  transactionCode: string
  bankNumber: string
  bankCode: string
  accountHolder: string
  amount: number
}

interface QRPaymentProps {
  paymentData: PaymentResponseDTO
}

const BANK_NAMES: { [key: string]: string } = {
  'TPBank': 'Tien Phong Bank',
  'VCB': 'Vietcombank',
  'TCB': 'Techcombank',
  'MB': 'MB Bank',
  // Add more banks as needed
}

export function QRPayment({ paymentData }: QRPaymentProps) {
  const [timeLeft, setTimeLeft] = useState(60) // 1 minute in seconds
  const [qrUrl, setQrUrl] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'expired' | 'success'>('pending')
  const router = useRouter()

  useEffect(() => {
    // Check payment status from localStorage
    const status = paymentStorage.getStatus(paymentData.transactionCode)
    if (status === 'expired') {
      setPaymentStatus('expired')
      // Clean up after displaying expired status
      setTimeout(() => {
        paymentStorage.removeStatus(paymentData.transactionCode)
      }, 1000)
    } else if (status === 'success') {
      setPaymentStatus('success')
      // Clean up after displaying success status
      setTimeout(() => {
        paymentStorage.removeStatus(paymentData.transactionCode)
      }, 1000)
      router.push('/dashboard')
    }
  }, [paymentData.transactionCode, router])

  // Only start countdown if payment is still pending
  useEffect(() => {
    if (paymentStatus !== 'pending') return

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentStatus])

  useEffect(() => {
    // Generate QR code URL with rounded amount
    const roundedAmount = Math.floor(paymentData.amount)
    const qrUrl = `https://qr.sepay.vn/img?acc=${paymentData.bankNumber}&bank=${paymentData.bankCode}&amount=${roundedAmount}&des=${paymentData.transactionCode}`
    console.log('QR URL:', qrUrl)
    setQrUrl(qrUrl)
  }, [paymentData])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // You can add a toast notification here
        console.log('Copied to clipboard')
      })
  }

  const handleReturnToCourses = () => {
    paymentStorage.removeStatus(paymentData.transactionCode)
    router.push('/courses')
  }

  if (paymentStatus === 'expired') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Expired</h2>
          <p className="text-gray-600">This payment session has timed out.</p>
        </div>
        <Button onClick={handleReturnToCourses} className="mt-4">
          Return to Courses
        </Button>
      </div>
    )
  }

  if (!qrUrl) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Scan QR Code to Pay</h1>
        {paymentStatus === 'pending' && timeLeft > 0 && (
          <p className="text-red-500">
            Order will be cancelled in: {formatTime(timeLeft)}
          </p>
        )}
        <p className="text-sm text-gray-600">
          Use your banking app to scan the QR code. Make sure the transfer description is <span className="font-bold text-red-500">{paymentData.transactionCode}</span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-center mb-6">
          <div className="relative w-64 h-64">
            <Image
              src={qrUrl}
              alt="QR Code"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Bank</span>
            <div className="flex items-center gap-2">
              <span className="font-bold">{BANK_NAMES[paymentData.bankCode] || paymentData.bankCode}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(paymentData.bankCode)}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Account Number</span>
            <div className="flex items-center gap-2">
              <span className="font-bold">{paymentData.bankNumber}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(paymentData.bankNumber)}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Account Holder</span>
            <div className="flex items-center gap-2">
              <span className="font-bold">{paymentData.accountHolder}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(paymentData.accountHolder)}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Amount</span>
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND'
                }).format(Math.floor(paymentData.amount)).replace(/\,00/, '')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(Math.floor(paymentData.amount).toString())}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Description</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-500">{paymentData.transactionCode}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(paymentData.transactionCode)}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Note: If your order is not automatically activated within 1 minute after transfer, please contact support.</p>
        </div>

        {paymentStatus === 'pending' && timeLeft > 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}