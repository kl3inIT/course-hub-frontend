import { httpClient } from '@/services/http-client'
import { ApiResponse, Page } from '@/types/common'
import {
  ReviewFiltersParams,
  ReviewRequestDTO,
  ReviewResponseDTO,
  ReviewSearchParams,
} from '@/types/review'

export const reviewApi = {
  getAllReviews: async (
    params?: ReviewSearchParams
  ): Promise<ApiResponse<Page<ReviewResponseDTO>>> => {
    const response = await httpClient.get('/api/reviews', { params })
    return response.data
  },

  getReviewById: async (
    id: number
  ): Promise<ApiResponse<ReviewResponseDTO>> => {
    const response = await httpClient.get(`/api/reviews/${id}`)
    return response.data
  },

  createReview: async (
    data: ReviewRequestDTO
  ): Promise<ApiResponse<ReviewResponseDTO>> => {
    const response = await httpClient.post('/api/reviews', data)
    return response.data
  },

  updateReview: async (
    id: number,
    data: ReviewRequestDTO
  ): Promise<ApiResponse<ReviewResponseDTO>> => {
    const response = await httpClient.put(`/api/reviews/${id}`, data)
    return response.data
  },

  deleteReview: async (id: number): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/api/reviews/${id}`)
    return response.data
  },

  getMyReviews: async (params?: {
    page?: number
    size?: number
  }): Promise<ApiResponse<Page<ReviewResponseDTO>>> => {
    const response = await httpClient.get('/api/reviews/my', { params })
    return response.data
  },

  setReviewVisibility: async (
    reviewId: number,
    hide: boolean
  ): Promise<ApiResponse<string>> => {
    const response = await httpClient.patch(
      `/api/reviews/${reviewId}/hide?hide=${hide}`
    )
    return response.data
  },

  // Get total reviews from backend
  getTotalReviews: async (): Promise<ApiResponse<number>> => {
    const response = await httpClient.get('/api/reviews/total-visible')
    return response.data
  },

  // Get overall average rating from backend
  getOverallAverageRating: async (): Promise<ApiResponse<number>> => {
    const response = await httpClient.get('/api/reviews/overall-average')
    return response.data
  },

  // Get reviews by visibility status (old method)
  getReviewsByVisibility: async (
    visibilityStatus: number,
    params?: {
      page?: number
      size?: number
      sortBy?: string
      direction?: 'ASC' | 'DESC'
    }
  ): Promise<ApiResponse<Page<ReviewResponseDTO>>> => {
    const response = await httpClient.get('/api/reviews/by-visibility', {
      params: { visibilityStatus, ...params },
    })
    return response.data
  },

  // Get reviews by visibility with advanced filters (new method)
  getReviewsByVisibilityWithFilters: async (
    params: ReviewFiltersParams
  ): Promise<ApiResponse<Page<ReviewResponseDTO>>> => {
    const response = await httpClient.get('/api/reviews/by-visibility-with-filters', { 
      params
    })
    return response.data
  },
}
