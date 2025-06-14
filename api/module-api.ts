import { httpClient } from '@/api/http-client'
import { ApiResponse } from '@/types/common'
import { ModuleRequestDTO, ModuleResponseDTO } from '@/types/module'

export const moduleApi = {
  getModulesByCourseId: async (
    courseId: string
  ): Promise<ApiResponse<ModuleResponseDTO[]>> => {
    const response = await httpClient.get(`/api/modules/course/${courseId}`)
    return response.data
  },

  createModule: async (
    courseId: string,
    data: ModuleRequestDTO
  ): Promise<ApiResponse<ModuleResponseDTO>> => {
    const response = await httpClient.post(`/api/modules/${courseId}`, data)
    return response.data
  },

  updateModule: async (
    moduleId: string,
    data: ModuleRequestDTO
  ): Promise<ApiResponse<ModuleResponseDTO>> => {
    const response = await httpClient.put(`/api/modules/${moduleId}`, data)
    return response.data
  },

  deleteModule: async (moduleId: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/api/modules/${moduleId}`)
    return response.data
  },

  getModuleById: async (
    moduleId: string
  ): Promise<ApiResponse<ModuleResponseDTO>> => {
    const response = await httpClient.get(`/api/modules/${moduleId}`)
    return response.data
  },

}
