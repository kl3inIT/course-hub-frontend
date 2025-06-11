import { discountApi } from '@/api/discount-api'
import { Coupon, CouponSearchParams, PaginationState } from '@/types/discount'
import { transformCoupon } from '@/utils/transform'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export const useCoupon = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 6,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  })

  const fetchCoupons = useCallback(async (page = 0, customParams?: CouponSearchParams) => {
    try {
      setLoadingCoupons(true)
      
      // Use custom params if provided, otherwise build default params
      const searchParams: CouponSearchParams = {
        page,
        size: pagination.size,
        isActive: 1, // Chỉ lấy coupon đang active
        ...customParams, // Spread custom params to override defaults if provided
      }
      
      const response = await discountApi.getCoupons(searchParams)
      const backendData = response.data
      
      // Transform backend coupons to frontend format
      const transformedCoupons = backendData.content.map(transformCoupon)
      
      setCoupons(transformedCoupons)
      
      // Update pagination state
      setPagination({
        page: backendData.number,
        size: backendData.size,
        totalElements: backendData.totalElements,
        totalPages: backendData.totalPages,
        first: backendData.first,
        last: backendData.last,
      })
      
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Failed to load coupons', {
        description: 'Please try refreshing the page.'
      })
    } finally {
      setLoadingCoupons(false)
    }
  }, [pagination.size]) // Only depend on pagination.size

  return {
    coupons,
    loadingCoupons,
    pagination,
    fetchCoupons,
  }
} 