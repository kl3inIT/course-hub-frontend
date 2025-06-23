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
  getUserDetails: async (userId: string): Promise<UserDetailResponse> => {
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
    userId: string,
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

  // Delete/deactivate manager
  deleteManager: async (managerId: string): Promise<{ message: string }> => {
    const response = await httpClient.delete(`/api/admin/users/${managerId}`)
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
      console.log('getUsersCountByStatus response:', response)
      console.log('getUsersCountByStatus response.data:', response.data)
      console.log(
        'getUsersCountByStatus response.data.totalElements:',
        response.data?.totalElements
      )
      console.log(
        'getUsersCountByStatus response.data.content.length:',
        response.data?.content?.length
      )

      // Use content length as fallback if totalElements is 0 or undefined
      const count =
        response.data?.totalElements || response.data?.content?.length || 0
      console.log('getUsersCountByStatus returning count:', count)
      return count
    } catch (error) {
      console.error(`Error fetching ${role} count for status ${status}:`, error)
      return 0
    }
  },

  // Get total course statistics
  getTotalCourseStats: async (role: string): Promise<number> => {
    try {
      console.log('getTotalCourseStats called with role:', role)
      const response = await adminApi.getAllUsers({
        pageSize: 1000,
        pageNo: 0,
        role: role.toUpperCase(),
      })

      console.log('Course stats response:', response)

      if (!response.data?.content) {
        console.error('No content in response:', response)
        return 0
      }

      const content = response.data.content
      console.log('Users content:', content)

      if (role.toLowerCase() === 'learner') {
        const total = content.reduce((total: number, user: User) => {
          const count = user.enrolledCoursesCount || 0
          console.log(`User ${user.name}: ${count} enrolled courses`)
          return total + count
        }, 0)
        console.log('Total enrolled courses:', total)
        return total
      } else {
        const total = content.reduce((total: number, user: User) => {
          const count = user.managedCoursesCount || 0
          console.log(`Manager ${user.name}: ${count} managed courses`)
          return total + count
        }, 0)
        console.log('Total managed courses:', total)
        return total
      }
    } catch (error) {
      console.error(`Error fetching course stats for ${role}:`, error)
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
