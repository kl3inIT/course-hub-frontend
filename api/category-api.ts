import { httpClient } from "@/api/http-client"
import { ApiResponse, Page } from "@/types/common"
import { CategoryRequestDTO, CategoryResponseDTO, CategorySearchParams } from "@/types/category"

export const categoryApi = {
  getAllCategories: async (params?: CategorySearchParams): Promise<ApiResponse<Page<CategoryResponseDTO>>> => {
    const response = await httpClient.get("/api/categories", { params })
    return response.data
  },

  searchCategories: async (params: CategorySearchParams): Promise<ApiResponse<Page<CategoryResponseDTO>>> => {
    return categoryApi.getAllCategories(params)
  },

  getCategoryById: async (id: string): Promise<ApiResponse<CategoryResponseDTO>> => {
    const response = await httpClient.get(`/api/categories/${id}`)
    return response.data
  },

  createCategory: async (data: CategoryRequestDTO): Promise<ApiResponse<CategoryResponseDTO>> => {
    const response = await httpClient.post("/api/categories", data)
    return response.data
  },

  updateCategory: async (id: string, data: CategoryRequestDTO): Promise<ApiResponse<CategoryResponseDTO>> => {
    const response = await httpClient.put(`/api/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/api/categories/${id}`)
    return response.data
  }
} 