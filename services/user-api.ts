import { httpClient } from '@/services/http-client'
import { ApiResponse, Page } from '@/types/common'
import { CouponSearchParams, PaginatedCouponResponse } from '@/types/discount'
import {
  CreateManagerRequest,
  ProfileData,
  User,
  UserDetail,
  UserSearchParams,
} from '@/types/user'

export const userApi = {
  // Get user's own profile info
  getMyInfo: async (): Promise<ApiResponse<ProfileData>> => {
    const response = await httpClient.get('/api/users/myInfo')
    return response.data
  },

  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<ApiResponse<UserDetail>> => {
    const response = await httpClient.get(`/api/users/profile/${userId}`)
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

  // Admin APIs
  admin: {
    // Get all users with pagination and filters
    getUsers: async (
      params: UserSearchParams
    ): Promise<ApiResponse<Page<User>>> => {
      const response = await httpClient.get('/api/admin/users', { params })
      return response.data
    },

    // Create new manager
    createManager: async (
      data: CreateManagerRequest
    ): Promise<ApiResponse<User>> => {
      const response = await httpClient.post('/api/admin/users', data)
      return response.data
    },

    // Update user status
    updateUserStatus: async (
      userId: string,
      status: 'active' | 'banned'
    ): Promise<ApiResponse<void>> => {
      const response = await httpClient.put(
        `/api/admin/users/${userId}/status`,
        null,
        { params: { status } }
      )
      return response.data
    },

    // Delete user (manager only)
    deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
      const response = await httpClient.delete(`/api/admin/users/${userId}`)
      return response.data
    },

    // Warn user
    warnUser: async (
      userId: number,
      resourceType?: string,
      resourceId?: number
    ): Promise<ApiResponse<void>> => {
      const response = await httpClient.post(
        `/api/admin/users/${userId}/warn`,
        {
          resourceType,
          resourceId,
        }
      )
      return response.data
    },
  },
}
