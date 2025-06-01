import { ApiResponse } from '@/api/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export interface Review {
  id: number
  userId: number
  userName: string
  userAvatar: string
  courseId: number
  courseName: string
  star: number
  comment: string
  createdDate: string
  modifiedDate: string
}

export interface PagedReviewResponse {
  content: Review[]
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

class ReviewAPI {
  private baseUrl = 'http://localhost:8080'

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken')
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }

  async getTopReviews(): Promise<Review[]> {
    try {
      const searchParams = new URLSearchParams({
        size: '3',
        sortBy: 'star',
        direction: 'DESC'
      })

      const response = await fetch(`${this.baseUrl}/api/reviews?${searchParams}`, {
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

      return responseData.data?.content || []
    } catch (error) {
      console.error("Error fetching top reviews:", error)
      return []
    }
  }

  async getReviews(page = 0, size = 5, sortBy = "modifiedDate", direction = "DESC"): Promise<PagedReviewResponse> {
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        direction
      })

      const response = await fetch(`${this.baseUrl}/api/reviews?${searchParams}`, {
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

      return responseData.data || { content: [], totalPages: 0, totalElements: 0 }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      return { content: [], totalPages: 0, totalElements: 0 } as PagedReviewResponse
    }
  }
}

export const reviewAPI = new ReviewAPI()

// Backward compatibility - export the old service structure
export const reviewService = {
  getTopReviews: () => reviewAPI.getTopReviews(),
  getReviews: (page = 0, size = 5, sortBy = "modifiedDate", direction = "DESC") => 
    reviewAPI.getReviews(page, size, sortBy, direction)
}