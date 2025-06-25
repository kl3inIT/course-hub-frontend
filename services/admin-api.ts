import {
  CourseStatsResponse,
  CreateManagerResponse,
  UserDetailResponse,
  UserManagementResponse,
} from '@/types/admin-api'
import { User, UserStatus } from '@/types/user'
import { CreateManagerRequest } from '@/types/user-management'
import { httpClient } from './http-client'

export const adminApi = {
  // Get all users with pagination and filters
  getAllUsers: async (params: {
    pageSize?: number
    pageNo?: number
    role?: string
    status?: UserStatus | 'all'
  }): Promise<UserManagementResponse> => {
    const queryParams = new URLSearchParams()

    if (params.pageSize)
      queryParams.append('pageSize', params.pageSize.toString())
    if (params.pageNo) queryParams.append('pageNo', params.pageNo.toString())
    if (params.role) queryParams.append('role', params.role.toUpperCase())
    if (params.status && params.status !== 'all') {
      queryParams.append('status', params.status.toUpperCase())
    }

    const response = await httpClient.get(`/api/admin/users?${queryParams}`)
    return response.data
  },

  // Get user details by ID
  getUserDetails: async (userId: number): Promise<UserDetailResponse> => {
    const response = await httpClient.get(`/api/admin/users/${userId}/detail`)
    return response.data
  },

  // Get user course statistics
  getUserCourseStats: async (userId: string): Promise<CourseStatsResponse> => {
    const response = await httpClient.get(
      `/api/admin/users/${userId}/course-stats`
    )
    return response.data
  },

  // Update user status
  updateUserStatus: async (
    userId: number,
    status: UserStatus
  ): Promise<{ message: string }> => {
    // Use query parameter instead of form data
    const response = await httpClient.put(
      `/api/admin/users/${userId}/status?status=${encodeURIComponent(status)}`,
      {}, // empty body
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  },

  // Create new manager
  createManager: async (
    data: CreateManagerRequest
  ): Promise<CreateManagerResponse> => {
    const response = await httpClient.post(
      '/api/admin/users/create-manager',
      data
    )
    return response.data
  },

  // Get users count by status (for statistics)
  getUsersCountByStatus: async (
    role: string,
    status: UserStatus | 'all'
  ): Promise<number> => {
    try {
      const response = await adminApi.getAllUsers({
        pageSize: 1,
        pageNo: 0,
        role,
        status,
      })

      // Use content length as fallback if totalElements is 0 or undefined
      const count =
        response.data?.page?.totalElements ||
        response.data?.content?.length ||
        0
      return count
    } catch (error) {
      return 0
    }
  },

  // Get total course statistics
  getTotalCourseStats: async (role: string): Promise<number> => {
    try {
      const response = await adminApi.getAllUsers({
        pageSize: 1000,
        pageNo: 0,
        role: role.toUpperCase(),
      })

      if (!response.data?.content) {
        return 0
      }

      const content = response.data.content

      if (role.toLowerCase() === 'learner') {
        const total = content.reduce((total: number, user: User) => {
          const count = user.enrolledCoursesCount || 0
          return total + count
        }, 0)
        return total
      } else {
        const total = content.reduce((total: number, user: User) => {
          const count = user.managedCoursesCount || 0
          return total + count
        }, 0)
        return total
      }
    } catch (error) {
      return 0
    }
  },

  // Warn user (for reports)
  warnUser: async (
    userId: number,
    resourceType?: string,
    resourceId?: number
  ): Promise<{ message: string }> => {
    const response = await httpClient.post(`/api/admin/users/${userId}/warn`, {
      resourceType,
      resourceId,
    })
    return response.data
  },
}
