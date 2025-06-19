import { httpClient } from '@/api/http-client'
import { ApiResponse, Page } from '@/types/common'
import {
  CourseRequestDTO,
  CourseResponseDTO,
  CourseSearchParams,
  CourseDetailsResponseDTO,
  DashboardCourseResponseDTO,
  CourseSearchStatsResponseDTO,
} from '@/types/course'

export const courseApi = {
  getAllCourses: async (
    params?: CourseSearchParams
  ): Promise<ApiResponse<Page<CourseResponseDTO>>> => {
    const response = await httpClient.get('/api/courses', { params })
    return response.data
  },

  getCourseById: async (
    id: string
  ): Promise<ApiResponse<CourseResponseDTO>> => {
    const response = await httpClient.get(`/api/courses/${id}`)
    return response.data
  },

  createCourse: async (
    data: CourseRequestDTO
  ): Promise<ApiResponse<CourseResponseDTO>> => {
    const response = await httpClient.post('/api/courses', data)
    return response.data
  },

  updateCourse: async (
    id: string,
    data: CourseRequestDTO
  ): Promise<ApiResponse<CourseResponseDTO>> => {
    const response = await httpClient.put(`/api/courses/${id}`, data)
    return response.data
  },

  getEnrolledCourses: async (
    params?: CourseSearchParams
  ): Promise<ApiResponse<Page<CourseResponseDTO>>> => {
    const response = await httpClient.get('/api/courses/enrolled', { params })
    return response.data
  },

  uploadThumbnail: async (courseId: string, thumbnailFile: File) => {
    const formData = new FormData()
    formData.append('thumbnail', thumbnailFile)
    const response = await httpClient.post<ApiResponse<string>>(
      `/api/courses/${courseId}/thumbnail`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  getCoursesByCategory: async (categoryId: string) => {
    const response = await httpClient.get<ApiResponse<CourseResponseDTO[]>>(
      `/api/courses/categories/${categoryId}`
    )
    return response.data
  },

  advancedSearch: async (params: CourseSearchParams) => {
    const response = await httpClient.get<ApiResponse<Page<CourseResponseDTO>>>(
      '/api/courses/search/advanced-search',
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          sort: params?.sort,
          search: params?.search,
          category: params?.category,
          level: params?.level,
          minPrice: params?.minPrice,
          maxPrice: params?.maxPrice,
          searchTerm: params?.searchTerm,
          categoryId: params?.categoryId,
          minRating: params?.minRating,
          isFree: params?.isFree,
          isDiscounted: params?.isDiscounted,
          status: params?.status,
          sortBy: params?.sortBy,
          sortDirection: params?.sortDirection,
        },
      }
    )
    return response.data
  },

  getFeaturedCourses: async (params?: {
    page?: number
    size?: number
    sort?: string
  }) => {
    const response = await httpClient.get<ApiResponse<CourseResponseDTO[]>>(
      '/api/courses/featured',
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          sort: params?.sort,
        },
      }
    )
    return response.data
  },

  getCourseDetails: async (courseId: string) => {
    const response = await httpClient.get<
      ApiResponse<CourseDetailsResponseDTO>
    >(`/api/courses/${courseId}/details`)
    return response.data
  },

  getDashboardCourses: async (): Promise<
    ApiResponse<DashboardCourseResponseDTO[]>
  > => {
    const response = await httpClient.get<
      ApiResponse<DashboardCourseResponseDTO[]>
    >('/api/courses/dashboard')
    return response.data
  },

  getSearchStats: async (): Promise<
    ApiResponse<CourseSearchStatsResponseDTO>
  > => {
    const response = await httpClient.get<
      ApiResponse<CourseSearchStatsResponseDTO>
    >('/api/courses/search/stats')
    return response.data
  },
}
