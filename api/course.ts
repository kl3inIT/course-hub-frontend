import { ApiResponse } from '@/types/api'

export interface CourseRequestDTO {
  title: string
  description: string
  price: number
  discount?: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  categoryCode: number
  isActive?: boolean
}

export interface CourseResponseDTO {
  id: number
  title: string
  description: string
  price: number
  discount?: number
  thumbnailUrl?: string
  courseLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  finalPrice: number
  isActive: boolean
  instructorName: string
  averageRating: number
  totalReviews: number
  totalStudents: number
  totalLessons: number
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

}

export const courseAPI = new CourseAPI()
