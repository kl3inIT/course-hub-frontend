'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, Copy, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface DiscountCode {
  code: string
  description: string
  discount: number
  expiryDate: string
  minPurchase?: number
}

// Sample data - will be replaced with API call
const sampleDiscountCodes: DiscountCode[] = [
  {
    code: 'NEWSTUDENT',
    description: 'Special discount for new students',
    discount: 20,
    expiryDate: '2024-12-31',
    minPurchase: 50,
  },
  {
    code: 'SPRING24',
    description: 'Spring season special offer',
    discount: 15,
    expiryDate: '2024-04-30',
    minPurchase: 30,
  },
  {
    code: 'SUMMER50',
    description: 'Summer mega sale',
    discount: 50,
    expiryDate: '2024-08-31',
    minPurchase: 100,
  },
]

export default function DiscountCodesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [copiedCodes, setCopiedCodes] = useState<{ [key: string]: boolean }>({})

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCodes({ ...copiedCodes, [code]: true })
      toast({
        title: 'Code copied',
        description: 'Discount code has been copied to clipboard',
        variant: 'default',
      })

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedCodes({ ...copiedCodes, [code]: false })
      }, 2000)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not copy code. Please try again',
        variant: 'destructive',
      })
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='max-w-3xl mx-auto'>
        <Button
          variant='ghost'
          className='mb-6 flex items-center gap-2'
          onClick={handleBack}
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Your Discount Codes</CardTitle>
            <CardDescription>
              Available discount codes for your courses. Click the button to
              copy the code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {sampleDiscountCodes.map(discount => (
                <div
                  key={discount.code}
                  className='flex items-center justify-between p-4 border rounded-lg bg-gray-50'
                >
                  <div className='space-y-1'>
                    <p className='font-medium'>{discount.code}</p>
                    <p className='text-sm text-gray-500'>
                      {discount.description}
                    </p>
                    <div className='flex gap-4 text-sm text-gray-500'>
                      <span>{discount.discount}% OFF</span>
                      {discount.minPurchase && (
                        <span>Min. purchase: ${discount.minPurchase}</span>
                      )}
                      <span>
                        Expires:{' '}
                        {new Date(discount.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-2'
                    onClick={() => handleCopyCode(discount.code)}
                  >
                    {copiedCodes[discount.code] ? (
                      <>
                        <Check className='h-4 w-4' />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className='h-4 w-4' />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
