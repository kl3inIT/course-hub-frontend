import { discountApi } from '@/services/discount-api'
import { Coupon, CouponSearchParams, PaginationState } from '@/types/discount'
import { transformCoupon } from '@/utils/transform'
import { useCallback, useState } from 'react'

export const useAvailableCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 8,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  })

  const fetchCoupons = useCallback(
    async (page = 0, params?: CouponSearchParams) => {
      try {
        setLoadingCoupons(true)
        const searchParams: CouponSearchParams = {
          page,
          size: pagination.size,
          isActive: 1,
          ...params,
        }

        const response = await discountApi.getAvailableCoupons(searchParams)
        const backendData = response.data

        const transformedCoupons = backendData.content.map(transformCoupon)
        setCoupons(transformedCoupons)

        setPagination({
          page: backendData.page.number,
          size: backendData.page.size,
          totalElements: backendData.page.totalElements,
          totalPages: backendData.page.totalPages,
          first: backendData.page.number === 0,
          last: backendData.page.number === backendData.page.totalPages - 1,
        })
      } catch (error) {
        console.error('Error fetching available coupons:', error)
        setCoupons([])
      } finally {
        setLoadingCoupons(false)
      }
    },
    [pagination.size]
  )

  return {
    coupons,
    loadingCoupons,
    pagination,
    fetchCoupons,
  }
}
