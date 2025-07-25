'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/context/auth-context'
import { discountApi } from '@/services/discount-api'
import { paymentApi } from '@/services/payment-api'
import { ApplicableCoupon } from '@/types/discount'
import { paymentStorage } from '@/utils/payment'
import { Clock, Loader2, Star, Users, Video, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  course: {
    id: number
    title: string
    price: number
    discountedPrice?: number
    thumbnail?: string
    duration?: number // in hours
    totalVideos?: number
    rating?: number
    totalStudents?: number
  }
}

export function PaymentModal({ isOpen, onClose, course }: PaymentModalProps) {
  const [discountCode, setDiscountCode] = useState('')
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null)
  const [isEditingDiscount, setIsEditingDiscount] = useState(false)
  const [successfulCode, setSuccessfulCode] = useState<string>('')
  const [appliedDiscountId, setAppliedDiscountId] = useState<number | null>(
    null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuth()
  const router = useRouter()

  // State for coupons
  const [couponModalOpen, setCouponModalOpen] = useState(false)
  const [couponList, setCouponList] = useState<ApplicableCoupon[]>([])
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const originalPrice = course.price
  const discountedPrice = appliedDiscount
    ? originalPrice * (1 - appliedDiscount / 100)
    : course.discountedPrice || originalPrice
  const formattedOriginalPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(originalPrice)
  const formattedDiscountedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(discountedPrice)

  const PAYMENT_TIMEOUT = 1 * 60 * 1000 // 1 minute in milliseconds
  const POLLING_INTERVAL = 3000 // 3 seconds

  const setPaymentStatus = (
    transactionCode: string,
    status: 'success' | 'expired'
  ) => {
    paymentStorage.setStatus(transactionCode, status)
  }

  const getPaymentStatus = (transactionCode: string) => {
    return localStorage.getItem(`payment_status_${transactionCode}`)
  }

  const checkAuth = () => {
    const token = getToken()
    if (!token) {
      const currentPath = window.location.pathname
      router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`)
      onClose()
      toast.error('Please login to continue with the payment')
      return false
    }
    return true
  }

  const handleApplyDiscount = async () => {
    if (!checkAuth()) return
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code')
      return
    }

    setIsApplyingDiscount(true)
    try {
      const response = await discountApi.validateDiscount({
        code: discountCode,
        courseId: course.id,
      })

      if (response && response.data && response.data.percentage) {
        setAppliedDiscount(response.data.percentage)
        setSuccessfulCode(discountCode)
        setIsEditingDiscount(false)
        toast.success(
          `Discount applied successfully! You save ${response.data.percentage}%`
        )
      }
    } catch (error: any) {
      setAppliedDiscount(null)
      toast.error('Discount code is not valid')
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const handleEditDiscount = () => {
    setIsEditingDiscount(true)
    setAppliedDiscount(null)
    // Keep the successful code in the input but allow editing
    setDiscountCode(successfulCode)
    setSuccessfulCode('') // Reset successful code when editing
  }

  const handleClearDiscount = () => {
    setDiscountCode('')
    setIsEditingDiscount(false)
    setAppliedDiscount(null)
    setSuccessfulCode('')
  }

  const handlePayment = async () => {
    if (!checkAuth()) return

    setLoading(true)
    setError(null)
    try {
      // Clear all old payment statuses before starting new payment
      paymentStorage.clearAllPaymentStatus()

      const paymentData = {
        courseId: course.id,
        amount: discountedPrice,
        ...(appliedDiscountId ? { discountId: appliedDiscountId } : {}),
      }

      const response = await paymentApi.createPayment(paymentData)

      if (response.data) {
        // Store payment response data in localStorage
        localStorage.setItem('paymentData', JSON.stringify(response.data))
        // Set initial payment status as pending
        paymentStorage.setStatus(response.data.transactionCode, 'pending')
        // Redirect to QR payment page
        router.push('/payment/qr')
        onClose()
      }
    } catch (err: any) {
      console.error('Error processing payment:', err)
      const errorMessage =
        err.response?.data?.message || 'Failed to process payment'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Get coupons when coupon modal opens
  const fetchCoupons = async () => {
    setIsCouponLoading(true)
    setCouponError(null)
    try {
      const res = await discountApi.getCouponsForCourse(course.id)
      setCouponList(res.data || [])
    } catch (err: any) {
      setCouponError('Failed to fetch coupons')
    } finally {
      setIsCouponLoading(false)
    }
  }

  // When coupon modal opens, fetch coupons
  useEffect(() => {
    if (couponModalOpen) fetchCoupons()
    // eslint-disable-next-line
  }, [couponModalOpen])

  // When selecting a coupon
  const handleSelectCoupon = (coupon: ApplicableCoupon) => {
    setAppliedDiscount(coupon.percentage)
    setSuccessfulCode(coupon.code || '') // Ensure code is not null
    setAppliedDiscountId(coupon.id)
    setIsEditingDiscount(false)
    setDiscountCode(coupon.code || '')
    setCouponModalOpen(false)
    toast.success(`Applied coupon: ${coupon.code || ''}`)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[800px] p-0 gap-0'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='flex flex-col items-center space-y-4'>
              <Loader2 className='h-8 w-8 animate-spin' />
              <p className='text-muted-foreground'>Processing payment...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[800px] p-0 gap-0'>
        <DialogHeader className='sr-only'>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <div className='grid grid-cols-5'>
          {/* Left side - Course Info */}
          <div className='col-span-3 p-6 bg-gray-50'>
            <div className='flex items-center gap-2 mb-8'>
              <Image
                src='/assets/favicon.png'
                alt='Logo'
                width={32}
                height={32}
                className='rounded'
              />
              <span className='text-xl font-bold'>Course Information</span>
            </div>

            <div className='space-y-6'>
              <h3 className='text-lg font-semibold'>{course.title}</h3>

              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm'>
                  <Clock className='w-5 h-5 text-blue-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Duration</p>
                    <p className='font-medium'>{course.duration ? (course.duration / 3600).toFixed(1) : '0.0'} hours</p>
                  </div>
                </div>

                <div className='flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm'>
                  <Video className='w-5 h-5 text-blue-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Lessons</p>
                    <p className='font-medium'>
                      {course.totalVideos || 0} videos
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm'>
                  <Star className='w-5 h-5 text-yellow-400' />
                  <div>
                    <p className='text-sm text-gray-600'>Rating</p>
                    <p className='font-medium'>{course.rating || 0}/5 stars</p>
                  </div>
                </div>

                <div className='flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm'>
                  <Users className='w-5 h-5 text-blue-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Students</p>
                    <p className='font-medium'>
                      {course.totalStudents || 0} enrolled
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Payment Details */}
          <div className='col-span-2 p-6 border-l'>
            <div className='mb-6'>
              <h2 className='text-xl font-bold'>Payment Details</h2>
            </div>

            <div className='space-y-4'>
              <div className='flex justify-between items-center text-sm text-gray-600'>
                <span>Original Price</span>
                <span className={appliedDiscount ? 'line-through' : ''}>
                  {formattedOriginalPrice}
                </span>
              </div>
              {appliedDiscount && (
                <div className='flex justify-between items-center font-medium'>
                  <span>Discounted Price</span>
                  <span>{formattedDiscountedPrice}</span>
                </div>
              )}

              <div className='space-y-2'>
                {appliedDiscount && !isEditingDiscount ? (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md'>
                      <div className='flex-1'>
                        <p className='text-sm text-green-700'>
                          Coupon applied:{' '}
                          <span className='font-medium'>{successfulCode}</span>
                        </p>
                        <p className='text-xs text-green-600'>
                          You save {appliedDiscount}% on this course
                        </p>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleEditDiscount}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='flex gap-2'>
                    <Button
                      className='flex-1'
                      variant='outline'
                      onClick={() => setCouponModalOpen(true)}
                      disabled={isApplyingDiscount}
                    >
                      Select Coupon
                    </Button>
                    {discountCode && (
                      <button
                        onClick={handleClearDiscount}
                        className='text-gray-400 hover:text-gray-600 px-2'
                        type='button'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    )}
                  </div>
                )}
                <a
                  href='/coupons'
                  className='text-sm text-blue-600 hover:underline'
                >
                  👉 View your discount codes
                </a>
              </div>

              <div className='flex justify-between items-center font-bold text-lg pt-4'>
                <span>TOTAL</span>
                <span>{formattedDiscountedPrice}</span>
              </div>

              <Button
                className='w-full'
                size='lg'
                onClick={handlePayment}
                disabled={
                  loading ||
                  (discountCode.trim() !== '' &&
                    (discountCode !== successfulCode || isEditingDiscount))
                }
              >
                {discountCode.trim() !== '' &&
                (discountCode !== successfulCode || isEditingDiscount)
                  ? 'Please apply discount code first'
                  : 'Continue to Payment'}
              </Button>

              <div className='text-center text-sm text-gray-500'>
                <span>🔒 Secure payment with SePay</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      {/* Coupon Selection Modal */}
      <Dialog open={couponModalOpen} onOpenChange={setCouponModalOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Select applicable coupon</DialogTitle>
          </DialogHeader>
          {isCouponLoading ? (
            <div className='text-center py-4'>Loading...</div>
          ) : couponError ? (
            <div className='text-center text-red-500 py-4'>{couponError}</div>
          ) : couponList.length === 0 ? (
            <div className='text-center py-4'>
              No coupons available for this course.
            </div>
          ) : (
            <div className='space-y-2 max-h-60 overflow-y-auto'>
              {couponList.map(coupon => (
                <div
                  key={coupon.id}
                  className='border rounded p-3 flex flex-col gap-1 hover:bg-gray-50 cursor-pointer'
                  onClick={() => handleSelectCoupon(coupon)}
                >
                  <div className='font-semibold'>
                    {coupon.code}{' '}
                    <span className='text-green-600'>
                      -{coupon.percentage}%
                    </span>
                  </div>
                  <div className='text-xs text-gray-600'>
                    {coupon.description}
                  </div>
                  <div className='text-xs'>
                    Expires: {formatDate(coupon.expiryDate)}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className='flex justify-end pt-2'>
            <Button variant='ghost' onClick={() => setCouponModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
