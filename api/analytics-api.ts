import { httpClient } from '@/api/http-client'
import { CategoryDetailDTO, CourseAnalyticsDetailResponseDTO, StudentAnalyticsDetailResponseDTO } from '@/types/analytics'
import { ApiResponse, Page, PaginationParams } from '@/types/common'

export type CategoryAnalyticsSearchParams = PaginationParams & {
  startDate?: string
  endDate?: string
  range?: string
}

export type CourseAnalyticsSearchParams = PaginationParams & {
  startDate?: string
  endDate?: string
  range?: string
}

export type StudentAnalyticsSearchParams = PaginationParams & {
  startDate?: string
  endDate?: string
  range?: string
}

export const analyticsApi = {
  getCategoryAnalyticsDetails: async (
    params?: CategoryAnalyticsSearchParams
  ): Promise<ApiResponse<Page<CategoryDetailDTO>>> => {
    const response = await httpClient.get('/api/analytics/categories/details', { params })
    return response.data
  },
  
  getCourseAnalyticsDetails: async (
    params?: CourseAnalyticsSearchParams
  ): Promise<ApiResponse<Page<CourseAnalyticsDetailResponseDTO>>> => {
    const response = await httpClient.get('/api/analytics/courses/details', { params })
    return response.data
  },

  getStudentAnalyticsDetails: async (
    params?: StudentAnalyticsSearchParams
  ): Promise<ApiResponse<Page<StudentAnalyticsDetailResponseDTO>>> => {
    const response = await httpClient.get('/api/analytics/students/details', { params })
    return response.data
  },
}
