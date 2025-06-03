import { httpClient } from "@/api/http-client"
import { ApiResponse } from "@/types/common"
import { ModuleRequestDTO, ModuleResponseDTO } from "@/types/module"

export const moduleApi = {
  getModulesByCourseId: async (courseId: string): Promise<ApiResponse<ModuleResponseDTO[]>> => {
    const response = await httpClient.get(`modules/course/${courseId}`)
    return response.data
  },

  createModule: async (courseId: string, data: ModuleRequestDTO): Promise<ApiResponse<ModuleResponseDTO>> => {
    const response = await httpClient.post(`modules/${courseId}`, data)
    return response.data
  },

  updateModule: async (moduleId: string, data: ModuleRequestDTO): Promise<ApiResponse<ModuleResponseDTO>> => {
    const response = await httpClient.put(`modules/${moduleId}`, data)
    return response.data
  },

  deleteModule: async (moduleId: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`modules/${moduleId}`)
    return response.data
  }
}
