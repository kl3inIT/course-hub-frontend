import { httpClient } from '@/api/http-client'
import { ApiResponse, Page } from '@/types/common'
import {
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
    userId: number,
    data: ReviewRequestDTO
  ): Promise<ApiResponse<ReviewResponseDTO>> => {
    const response = await httpClient.post('/api/reviews', data, {
      params: { userId },
    })
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
}
