import { httpClient } from '@/api/http-client'
import { ApiResponse } from '@/types/common'
import {
  Coupon,
  CouponCreateRequestDTO,
  CouponSearchParams,
  CouponUpdateRequestDTO,
  DiscountRequestDTO,
  DiscountResponseDTO,
  PaginatedCouponResponse
} from '@/types/discount'

export const discountApi = {
  validateDiscount: async (
    data: DiscountRequestDTO
  ): Promise<ApiResponse<DiscountResponseDTO>> => {
    const response = await httpClient.post('/api/discounts/verify', data)
    return response.data
  },

  // Coupon Management APIs
  getCoupons: async (params?: CouponSearchParams): Promise<ApiResponse<PaginatedCouponResponse>> => {
    const response = await httpClient.get('/api/discounts', { params })
    return response.data
  },

  createCoupon: async (data: CouponCreateRequestDTO): Promise<ApiResponse<Coupon>> => {
    const response = await httpClient.post('/api/discounts', data)
    return response.data
  },

  updateCoupon: async (
    id: string,
    data: CouponUpdateRequestDTO
  ): Promise<ApiResponse<Coupon>> => {
    const response = await httpClient.put(`/api/discounts/${id}`, data)
    return response.data
  },

  deleteCoupon: async (id: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/api/discounts/${id}`)
    return response.data
  },

  toggleCouponStatus: async (id: string): Promise<ApiResponse<Coupon>> => {
    const response = await httpClient.patch(`/api/coupons/${id}/toggle-status`)
    return response.data
  },
}
