import { httpClient } from "@/api/http-client"
import { ApiResponse, Page } from "@/types/common"
import { 
  LessonPreparedUploadRequestDTO,
  LessonConfirmCreationRequestDTO,
  LessonResponseDTO,
  LessonUploadResponseDTO
} from "@/types/lesson"
import { CategoryRequestDTO, CategoryResponseDTO, CategorySearchParams } from "@/types/category"

export const lessonApi = {
  // Chuẩn bị upload video
  prepareUpload: async (
    moduleId: string, 
    data: LessonPreparedUploadRequestDTO
  ): Promise<ApiResponse<LessonUploadResponseDTO>> => {
    const response = await httpClient.post(`lessons/${moduleId}/prepare-upload`, data)
    return response.data
  },

  // Hoàn thành upload video
  completeUpload: async (
    lessonId: string, 
    data: LessonConfirmCreationRequestDTO
  ): Promise<ApiResponse<LessonResponseDTO>> => {
    const response = await httpClient.post(`lessons/${lessonId}/complete-upload`, data)
    return response.data
  },

  // Lấy thông tin một bài học
  getLessonById: async (lessonId: string): Promise<ApiResponse<LessonResponseDTO>> => {
    const response = await httpClient.get(`lessons/${lessonId}`)
    return response.data
  },

  // Lấy danh sách bài học của một module
  getLessonsByModuleId: async (moduleId: string): Promise<ApiResponse<LessonResponseDTO[]>> => {
    const response = await httpClient.get(`lessons/module/${moduleId}`)
    return response.data
  },

  // Xóa bài học
  deleteLesson: async (lessonId: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`lessons/${lessonId}`)
    return response.data
  }
}

export const categoryApi = {
  getAllCategories: async (params?: CategorySearchParams): Promise<ApiResponse<Page<CategoryResponseDTO>>> => {
    const response = await httpClient.get("/categories", { params })
    return response.data
  },
  // ... các hàm khác giữ nguyên
}
