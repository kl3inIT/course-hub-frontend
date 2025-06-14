import { httpClient } from '@/services/http-client'
import { ApiResponse } from '@/types/common'
import {
  LessonUploadRequestDTO,
  LessonConfirmRequestDTO,
  LessonResponseDTO,
  LessonUploadResponseDTO,
} from '@/types/lesson'

export const lessonApi = {
  // Chuẩn bị upload video
  prepareUpload: async (
    moduleId: string,
    data: LessonUploadRequestDTO
  ): Promise<ApiResponse<LessonUploadResponseDTO>> => {
    const response = await httpClient.post(
      `/api/lessons/${moduleId}/prepare-upload`,
      data
    )
    return response.data
  },

  // Hoàn thành upload video
  completeUpload: async (
    lessonId: string,
    data: LessonConfirmRequestDTO
  ): Promise<ApiResponse<LessonResponseDTO>> => {
    const response = await httpClient.post(
      `/api/lessons/${lessonId}/complete-upload`,
      data
    )
    return response.data
  },

  // Lấy thông tin một bài học
  getLessonById: async (
    lessonId: string
  ): Promise<ApiResponse<LessonResponseDTO>> => {
    const response = await httpClient.get(`/api/lessons/${lessonId}`)
    return response.data
  },

  // Lấy danh sách bài học của một module
  getLessonsByModuleId: async (
    moduleId: string
  ): Promise<ApiResponse<LessonResponseDTO[]>> => {
    const response = await httpClient.get(`/api/lessons/module/${moduleId}`)
    return response.data
  },

  // Xóa bài học
  deleteLesson: async (lessonId: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/api/lessons/${lessonId}`)
    return response.data
  },

  // Lấy URL preview cho bài học
  getLessonPreviewUrl: async (lessonId: string): Promise<string> => {
    const response = await httpClient.get(
      `/api/lessons/${lessonId}/preview-url`
    )
    return response.data
  },

  getLessonVideoUrl: async (lessonId: string): Promise<string> => {
    const response = await httpClient.get(`/api/lessons/${lessonId}/video-url`)
    return response.data
  },

  // Check if lesson is a preview lesson and return the appropriate URL
  getLessonUrl: async (lessonId: string): Promise<string> => {
    const lessonResponse = await lessonApi.getLessonById(lessonId)
    if (lessonResponse.data.isPreview) {
      return await lessonApi.getLessonPreviewUrl(lessonId)
    } else {
      return await lessonApi.getLessonVideoUrl(lessonId)
    }
  },
}
