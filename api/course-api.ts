import { httpClient } from "@/api/http-client"
import { ApiResponse, Page } from "@/types/common"
import {
  CourseRequestDTO,
  CourseResponseDTO,
  CourseUpdateStatusAndLevelRequestDTO,
  CourseSearchParams
} from "@/types/course"
import { CategoryRequestDTO, CategoryResponseDTO, CategorySearchParams } from "@/types/category"

export interface CourseUpdateStatusRequestDTO {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OPEN_FOR_ENROLLMENT' | 'CLOSED_FOR_ENROLLMENT'
}

export const courseApi = {
  getAllCourses: async (params?: CourseSearchParams): Promise<ApiResponse<Page<CourseResponseDTO>>> => {
    const response = await httpClient.get("/courses", { params })
    return response.data
  },

  getCourseById: async (id: string): Promise<ApiResponse<CourseResponseDTO>> => {
    const response = await httpClient.get(`/courses/${id}`)
    return response.data
  },

  createCourse: async (data: CourseRequestDTO): Promise<ApiResponse<CourseResponseDTO>> => {
    const response = await httpClient.post("/courses", data)
    return response.data
  },

  updateCourse: async (id: string, data: CourseRequestDTO): Promise<ApiResponse<CourseResponseDTO>> => {
    const response = await httpClient.put(`/courses/${id}`, data)
    return response.data
  },

  deleteCourse: async (id: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/courses/${id}`)
    return response.data
  },

  enrollCourse: async (courseId: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.post(`/courses/${courseId}/enroll`)
    return response.data
  },

  unenrollCourse: async (courseId: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/courses/${courseId}/enroll`)
    return response.data
  },

  getEnrolledCourses: async (params?: CourseSearchParams): Promise<ApiResponse<Page<CourseResponseDTO>>> => {
    const response = await httpClient.get("/courses/enrolled", { params })
    return response.data
  },

  uploadThumbnail: async (courseId: number, thumbnailFile: File) => {
    const formData = new FormData()
    formData.append('thumbnail', thumbnailFile)
    const response = await httpClient.post<ApiResponse<string>>(`/courses/${courseId}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  updateCourseStatusAndLevel: async (courseId: number, updateData: CourseUpdateStatusAndLevelRequestDTO) => {
    const response = await httpClient.put<ApiResponse<CourseResponseDTO>>(`/courses/${courseId}/status`, updateData)
    return response.data
  },

  getCoursesByCategory: async (categoryId: number) => {
    const response = await httpClient.get<ApiResponse<CourseResponseDTO[]>>(`/courses/categories/${categoryId}`)
    return response.data
  },

  searchCourses: async (params: CourseSearchParams) => {
    const response = await httpClient.get<ApiResponse<Page<CourseResponseDTO>>>('/courses/search', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sort: params?.sort,
        search: params?.search,
        category: params?.category,
        level: params?.level,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
      },
    })
    return response.data
  },

  getFeaturedCourses: async (params?: { page?: number; size?: number; sort?: string }) => {
    const response = await httpClient.get<ApiResponse<CourseResponseDTO[]>>('/courses/featured', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sort: params?.sort,
      },
    })
    return response.data
  },
}

export const categoryAPI = {
  getAllCategories: async (paginationParams: { page?: number; size?: number } = {}, filters: CategorySearchParams = {}): Promise<ApiResponse<Page<CategoryResponseDTO>>> => {
    const params = { ...paginationParams, ...filters }
    const response = await httpClient.get("/categories", { params })
    return response.data
  },

  getCategoryById: async (id: string): Promise<ApiResponse<CategoryResponseDTO>> => {
    const response = await httpClient.get(`/categories/${id}`)
    return response.data
  },

  createCategory: async (data: CategoryRequestDTO): Promise<ApiResponse<CategoryResponseDTO>> => {
    const response = await httpClient.post("/categories", data)
    return response.data
  },

  updateCategory: async (id: string, data: CategoryRequestDTO): Promise<ApiResponse<CategoryResponseDTO>> => {
    const response = await httpClient.put(`/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/categories/${id}`)
    return response.data
  }
}
