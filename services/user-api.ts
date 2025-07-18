import { httpClient } from '@/services/http-client'
import { ApiResponse } from '@/types/common'
import { CouponSearchParams, PaginatedCouponResponse } from '@/types/discount'
import { ProfileData, UserDetail } from '@/types/user'

export const userApi = {
  // Get user's own profile info
  getMyInfo: async (): Promise<ApiResponse<ProfileData>> => {
    const response = await httpClient.get('/api/users/myInfo')
    return response.data
  },

  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<ApiResponse<UserDetail>> => {
    const response = await httpClient.get(`/api/users/${userId}`)
    return response.data
  },

  // Get user detail by ID (admin/manager only)
  getUserDetail: async (userId: string): Promise<ApiResponse<UserDetail>> => {
    const response = await httpClient.get(`/api/admin/users/${userId}/detail`)
    return response.data
  },

  // Update user profile
  updateProfile: async (
    profileData: FormData
  ): Promise<ApiResponse<ProfileData>> => {
    const response = await httpClient.put('/api/users/profile', profileData)
    return response.data
  },

  // Upload avatar
  uploadAvatar: async (
    avatarFile: FormData
  ): Promise<ApiResponse<{ avatar: string }>> => {
    const response = await httpClient.post('/api/users/avatar', avatarFile)
    return response.data
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    const response = await httpClient.put('/api/users/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },

  // Get all coupons of the current user with pagination/filter
  getMyCoupons: async (
    params: CouponSearchParams
  ): Promise<ApiResponse<PaginatedCouponResponse>> => {
    const response = await httpClient.get('/api/users/discounts', { params })
    return response.data
  },

  // Claim a coupon for the current user
  claimCoupon: async (couponId: string): Promise<ApiResponse<any>> => {
    const response = await httpClient.post(`/api/users/discounts/${couponId}`)
    return response.data
  },

  // Get total user count
  getUserCount: async (): Promise<number> => {
    const response = await httpClient.get('/api/users/count')
    return response.data.data
  },

  // Get active user count
  getActiveUserCount: async (): Promise<number> => {
    const response = await httpClient.get('/api/users/active')
    return response.data.data
  },
}
