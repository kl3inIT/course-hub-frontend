import { ApiResponse } from '@/api/api'

export interface CourseRequestDTO {
  title: string
  description: string
  price: number
  discount?: number
  level: string
  categoryCode: number
}

export interface CourseResponseDTO {
  id: number
  title: string
  description: string
  price: number
  discount?: number | null
  thumbnailUrl?: string | null
  category: string
  level: string
  finalPrice: number
  status: string
  instructorName: string
  averageRating: number | null
  totalReviews: number
  totalStudents: number
  totalLessons: number
}

export interface PagedCourseResponse {
  content: CourseResponseDTO[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface CourseSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

class CourseAPI {
  private baseUrl = 'http://localhost:8080'

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken')
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }

  async createCourse(courseData: CourseRequestDTO): Promise<ApiResponse<CourseResponseDTO>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(courseData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<CourseResponseDTO>
    } catch (error) {
      console.error('Create course error:', error)
      throw error
    }
  }

  async uploadThumbnail(courseId: number, thumbnailFile: File): Promise<ApiResponse<string>> {
    try {
      const formData = new FormData()
      formData.append('thumbnail', thumbnailFile)

      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}/thumbnail`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
        },
        body: formData,
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<string>
    } catch (error) {
      console.error('Upload thumbnail error:', error)
      throw error
    }
  }

  async getCourseById(courseId: number): Promise<ApiResponse<CourseResponseDTO>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<CourseResponseDTO>
    } catch (error) {
      console.error('Get course error:', error)
      throw error
    }
  }

  // Simple pagination only - no filtering
  async getAllCourses(params?: { page?: number; size?: number }): Promise<ApiResponse<PagedCourseResponse>> {
    try {
      const searchParams = new URLSearchParams({
        page: (params?.page ?? 0).toString(),
        size: (params?.size ?? 20).toString(),
      })

      const response = await fetch(`${this.baseUrl}/api/courses?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<PagedCourseResponse>
    } catch (error) {
      console.error('Get all courses error:', error)
      throw error
    }
  }

  // Advanced search with filtering
  async searchCourses(params: CourseSearchParams): Promise<ApiResponse<PagedCourseResponse>> {
    try {
      const searchParams = new URLSearchParams({
        page: (params?.page ?? 0).toString(),
        size: (params?.size ?? 20).toString(),
      })
      
      if (params?.sort) searchParams.append('sort', params.sort)
      if (params?.search) searchParams.append('search', params.search)
      if (params?.category) searchParams.append('category', params.category)
      if (params?.level) searchParams.append('level', params.level)
      if (params?.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString())
      if (params?.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString())

      const response = await fetch(`${this.baseUrl}/api/courses/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<PagedCourseResponse>
    } catch (error) {
      console.error('Search courses error:', error)
      throw error
    }
  }

  async getCoursesByCategory(categoryCode: number): Promise<ApiResponse<CourseResponseDTO[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/categories/${categoryCode}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<CourseResponseDTO[]>
    } catch (error) {
      console.error('Get courses by category error:', error)
      throw error
    }
  }

  async getFeaturedCourses(params?: { page?: number; size?: number }): Promise<ApiResponse<CourseResponseDTO[]>> {
    try {
      const searchParams = new URLSearchParams({
        page: (params?.page ?? 0).toString(),
        size: (params?.size ?? 10).toString(),
      })

      const response = await fetch(`${this.baseUrl}/api/courses/featured?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<CourseResponseDTO[]>
    } catch (error) {
      console.error('Get featured courses error:', error)
      throw error
    }
  }
}

export const courseAPI = new CourseAPI()
