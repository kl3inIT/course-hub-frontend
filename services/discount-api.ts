import { httpClient } from '@/services/http-client'
import { ApiResponse } from '@/types/common'
import {
  ApplicableCoupon,
  Coupon,
  CouponCreateRequestDTO,
  CouponSearchParams,
  CouponStatsResponse,
  CouponStatusResponse,
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
  getCoupons: async (
    params?: CouponSearchParams
  ): Promise<ApiResponse<PaginatedCouponResponse>> => {
    const response = await httpClient.get('/api/discounts', { params })
    return response.data
  },

  getAvailableCoupons: async (
    params?: CouponSearchParams
  ): Promise<ApiResponse<PaginatedCouponResponse>> => {
    const response = await httpClient.get('/api/discounts/available', { params })
    return response.data
  },

  getMyCoupons: async (
    params: CouponSearchParams
  ): Promise<ApiResponse<PaginatedCouponResponse>> => {
    const response = await httpClient.get('/api/discounts/my', { params })
    return response.data
  },

  createCoupon: async (
    data: CouponCreateRequestDTO
  ): Promise<ApiResponse<Coupon>> => {
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
  // New API to get coupons applicable to a specific course
  getCouponsForCourse: async (
    courseId: number
  ): Promise<ApiResponse<ApplicableCoupon[]>> => {
    const response = await httpClient.get(`/api/discounts/${courseId}/my`)
    return response.data
  },

  // Add new API to get coupon statuses
  getCouponStatuses: async (): Promise<ApiResponse<CouponStatusResponse>> => {
    const response = await httpClient.get('/api/discounts/statuses')
    return response.data
  },

  // Add new API to get coupon stats
  getCouponStats: async (): Promise<ApiResponse<CouponStatsResponse>> => {
    const response = await httpClient.get('/api/discounts/stats')
    return response.data
  },
}