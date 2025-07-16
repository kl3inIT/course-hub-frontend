'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRPayment } from '@/components/payment/qr-payment'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Loader2 } from 'lucide-react'

interface PaymentResponseDTO {
  transactionCode: string
  bankNumber: string
  bankCode: string
  accountHolder: string
  amount: number
}

export default function QRPaymentPage() {
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<PaymentResponseDTO | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializePaymentData = () => {
      // Get payment data from localStorage that was stored after createPayment API call
      const paymentResponse = localStorage.getItem('paymentData')
      console.log('Retrieved from localStorage:', paymentResponse)

      if (!paymentResponse) {
        setError('No payment data found')
        return
      }

      try {
        const data = JSON.parse(paymentResponse)
        console.log('Parsed payment data:', data)

        // Validate required fields
        const requiredFields = [
          'transactionCode',
          'bankNumber',
          'bankCode',
          'accountHolder',
          'amount',
        ]
        const missingFields = requiredFields.filter(field => !data[field])

        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields)
          setError(`Missing required payment data: ${missingFields.join(', ')}`)
          return
        }

        setPaymentData(data)
      } catch (err) {
        console.error('Error parsing payment data:', err)
        setError('Invalid payment data')
      }
    }

    initializePaymentData()
  }, []) // Empty dependency array means this effect runs once on mount

  // Add debug render to check current state
  console.log('Current state:', { paymentData, error })

  if (error) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-red-500 mb-2'>Error</h1>
            <p className='text-gray-600'>{error}</p>
            <button
              onClick={() => router.push('/courses')}
              className='mt-4 text-blue-500 hover:underline'
            >
              Return to Courses
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!paymentData) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className='flex items-center justify-center min-h-screen'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <QRPayment paymentData={paymentData} />
    </ProtectedRoute>
  )
}
