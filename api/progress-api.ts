import { httpClient } from './http-client'
import { ApiResponse } from '@/types/common'
import {
  LessonProgressDTO,
  UpdateLessonProgressRequestDTO,
} from '../types/progress'

const BASE_PATH = '/api/progress'

export const progressApi = {
  // Update lesson progress
  updateLessonProgress: async (
    lessonId: number,
    data: UpdateLessonProgressRequestDTO
  ): Promise<ApiResponse<LessonProgressDTO>> => {
    const response = await httpClient.post<ApiResponse<LessonProgressDTO>>(
      `${BASE_PATH}/lessons/${lessonId}`,
      data
    )
    return response.data
  },

  // Get lesson progress
  getLessonProgress: async (
    lessonId: number
  ): Promise<ApiResponse<LessonProgressDTO>> => {
    const response = await httpClient.get<ApiResponse<LessonProgressDTO>>(
      `${BASE_PATH}/lessons/${lessonId}`
    )
    return response.data
  },
}
