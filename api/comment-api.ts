import { httpClient } from '@/api/http-client'
import { CommentRequestDTO, CommentResponseDTO } from '@/types/comment'
import { ApiResponse } from '@/types/common'

export const commentApi = {
  // Get all comments for a lesson
  getCommentsByLesson: async (
    lessonId: string | number
  ): Promise<ApiResponse<CommentResponseDTO[]>> => {
    const response = await httpClient.get(`/api/comments/lesson/${lessonId}`)
    return response.data
  },

  // Create a new comment or reply
  createComment: async (
    lessonId: string | number,
    data: CommentRequestDTO
  ): Promise<ApiResponse<CommentResponseDTO>> => {
    const response = await httpClient.post(
      `/api/comments/lesson/${lessonId}`,
      data
    )
    return response.data
  },

  // Update an existing comment
  updateComment: async (
    commentId: number,
    data: CommentRequestDTO
  ): Promise<ApiResponse<CommentResponseDTO>> => {
    const response = await httpClient.put(`/api/comments/${commentId}`, data)
    return response.data
  },

  // Delete a comment
  deleteComment: async (
    commentId: number
  ): Promise<ApiResponse<string>> => {
    const response = await httpClient.delete(`/api/comments/${commentId}`)
    return response.data
  },

  // Toggle like on a comment
  toggleLike: async (
    commentId: number
  ): Promise<ApiResponse<boolean>> => {
    const response = await httpClient.put(`/api/comments/${commentId}/like`)
    return response.data
  },

  // Report a comment
  reportComment: async (
    commentId: number,
    reason: string,
    description?: string
  ): Promise<ApiResponse<string>> => {
    const response = await httpClient.post(
      `/api/comments/${commentId}/report`,
      {
        reason,
        description,
      }
    )
    return response.data
  },

  getCommentById: async (
    commentId: number
  ): Promise<ApiResponse<CommentResponseDTO>> => {
    const response = await httpClient.get(`/api/comments/${commentId}`)
    return response.data
  },

  // Admin/Manager APIs
  admin: {
    // Hide a comment (admin/manager only)
    hideComment: async (commentId: number): Promise<ApiResponse<string>> => {
      const response = await httpClient.patch(`/api/comments/${commentId}/hide`)
      return response.data
    },
  },

}
