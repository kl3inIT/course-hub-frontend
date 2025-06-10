import { useState, useEffect, useCallback } from 'react'

interface Transaction {
  id: string
  bank_brand_name: string
  account_number: string
  transaction_date: string
  amount_out: string
  amount_in: string
  accumulated: string
  transaction_content: string
  reference_number: string
  code: string | null
  sub_account: string | null
  bank_account_id: string
}

interface TransactionResponse {
  status: number
  error: null | string
  messages: {
    success: boolean
  }
  transactions: Transaction[]
}

interface UseTransactionCheckProps {
  accountNumber: string
  expectedAmount: number
  paymentCode: string
  onSuccess: () => void
  onTimeout: () => void
  timeoutDuration?: number
}

export function useTransactionCheck({
  accountNumber,
  expectedAmount,
  paymentCode,
  onSuccess,
  onTimeout,
  timeoutDuration = 60, // 1 minute in seconds
}: UseTransactionCheckProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [timeLeft, setTimeLeft] = useState(timeoutDuration)

  const checkTransaction = useCallback(async () => {
    try {
      // Call the transaction check API
      const response = await fetch(
        `https://my.sepay.vn/userapi/transactions/list?transaction_description=${paymentCode}`
      )
      const data = await response.json()

      // Log the response for debugging
      console.log('Transaction check response:', data)

      // If the response indicates a successful transaction
      if (data && data.success) {
        console.log('Found successful transaction')
        setIsChecking(false)
        onSuccess()
        return true
      }

      // If no matching transaction found
      console.log('No matching transaction found')
      return false
    } catch (error) {
      console.error('Error checking transaction:', error)
      return false
    }
  }, [paymentCode, onSuccess])

  useEffect(() => {
    if (!isChecking) return

    console.log('Starting transaction check polling...')

    // Initial check
    checkTransaction()

    // Set up polling interval
    const pollInterval = setInterval(checkTransaction, 2000) // Check every 2 seconds

    // Set up countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          console.log('Payment timeout reached')
          clearInterval(timer)
          clearInterval(pollInterval)
          setIsChecking(false)
          onTimeout()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    // Cleanup
    return () => {
      console.log('Cleaning up transaction check...')
      clearInterval(pollInterval)
      clearInterval(timer)
    }
  }, [isChecking, checkTransaction, onTimeout])

  return {
    isChecking,
    timeLeft,
  }
}
