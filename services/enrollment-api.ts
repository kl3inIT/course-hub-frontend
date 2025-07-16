import { httpClient } from '@/services/http-client'
import { ApiResponse } from '@/types/common'
import { EnrollmentStatusResponseDTO } from '@/types/enrollment'

export const enrollmentApi = {
  getEnrollmentStatus: async (
    courseId: string
  ): Promise<ApiResponse<EnrollmentStatusResponseDTO>> => {
    const response = await httpClient.get(`/api/enrollments/status/${courseId}`)
    return response.data
  },

  // Helper function to check if user can access course (enrolled OR manager/admin)
  canAccessCourse: async (
    courseId: string,
    userRole?: string
  ): Promise<boolean> => {
    try {
      // Manager and Admin can access any course without enrollment
      if (userRole === 'manager' || userRole === 'admin') {
        return true
      }

      // For other users, check enrollment status
      const response = await enrollmentApi.getEnrollmentStatus(courseId)
      return response.data?.enrolled || false
    } catch (error) {
      console.error('Error checking course access:', error)
      return false
    }
  },

  // Enhanced enrollment status that considers role-based access
  getEnhancedEnrollmentStatus: async (
    courseId: string,
    userRole?: string
  ): Promise<
    ApiResponse<
      EnrollmentStatusResponseDTO & {
        canAccess: boolean
        accessReason?: string
      }
    >
  > => {
    try {
      // Use the new enhanced-status endpoint from backend
      const response = await httpClient.get(
        `/api/enrollments/enhanced-status/${courseId}`
      )
      return response.data
    } catch (error) {
      console.error('Error getting enhanced enrollment status:', error)
      return {
        data: {
          enrolled: false,
          completed: false,
          progress: 0,
          canAccess: false,
          accessReason: 'Error checking access',
        },
        message: 'Error occurred',
        detail: 'Failed to check enrollment status',
      }
    }
  },
}
