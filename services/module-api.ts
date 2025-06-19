import { httpClient } from '@/services/http-client'
import { ApiResponse } from '@/types/common'
import { ModuleRequestDTO, ModuleResponseDTO } from '@/types/module'

export const moduleApi = {
  // Tạo module mới
  createModule: async (
    courseId: string,
    data: ModuleRequestDTO
  ): Promise<ApiResponse<ModuleResponseDTO>> => {
    const response = await httpClient.post(`/api/modules/${courseId}`, data)
    return response.data
  },

  // Cập nhật module
  updateModule: async (
    moduleId: string,
    data: ModuleRequestDTO
  ): Promise<ApiResponse<ModuleResponseDTO>> => {
    const response = await httpClient.put(`/api/modules/${moduleId}`, data)
    return response.data
  },

  // Xóa module
  deleteModule: async (moduleId: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/api/modules/${moduleId}`)
    return response.data
  },

  // Lấy thông tin một module
  getModuleById: async (
    moduleId: string
  ): Promise<ApiResponse<ModuleResponseDTO>> => {
    const response = await httpClient.get(`/api/modules/${moduleId}`)
    return response.data
  },

  // Lấy danh sách module của một course
  getModulesByCourseId: async (
    courseId: string
  ): Promise<ApiResponse<ModuleResponseDTO[]>> => {
    const response = await httpClient.get(`/api/modules/course/${courseId}`)
    return response.data
  },
}
