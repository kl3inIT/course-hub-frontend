import { ApiResponse } from '@/api/api'

export interface Category {
  id: string
  name: string
  description: string
  courseCount: number
  createdAt: string
  updatedAt: string
}

export interface CategoryRequestDTO {
  name: string
  description: string
}

export interface CategoryResponseDTO {
  id: number
  name: string
  description?: string
  isActive: boolean
  courseCount?: number
  createdDate?: string
  modifiedDate?: string
}

export interface CategoryStats {
  total: number
  totalCourses: number
} 

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface CategoryFilters {
  name?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

// Spring Page interface structure for categories
export interface PagedCategoryResponse {
  content: CategoryResponseDTO[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface CategorySearchParams {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  isActive?: boolean;
}

class CategoryAPI {
  private baseUrl = 'http://localhost:8080'

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken')
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }

  async getAllCategories(params?: CategorySearchParams): Promise<ApiResponse<PagedCategoryResponse>> {
    try {
      const searchParams = new URLSearchParams({
        page: (params?.page ?? 0).toString(),
        size: (params?.size ?? 100).toString(),
      })
      
      if (params?.name) {
        searchParams.append('name', params.name)
      }
      
      if (params?.sort) {
        searchParams.append('sort', params.sort)
      }
      
      if (params?.isActive !== undefined) {
        searchParams.append('isActive', params.isActive.toString())
      }

      const response = await fetch(`${this.baseUrl}/api/categories?${searchParams}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<PagedCategoryResponse>
    } catch (error) {
      console.error('Get all categories error:', error)
      throw error
    }
  }

  async searchCategories(params: CategorySearchParams): Promise<ApiResponse<PagedCategoryResponse>> {
    return this.getAllCategories(params)
  }

  async getCategoryById(categoryId: string): Promise<ApiResponse<CategoryResponseDTO>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // ...this.getAuthHeaders(),
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<CategoryResponseDTO>
    } catch (error) {
      console.error('Get category error:', error)
      throw error
    }
  }

  async createCategory(categoryData: CategoryRequestDTO): Promise<ApiResponse<CategoryResponseDTO>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(categoryData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<CategoryResponseDTO>
    } catch (error) {
      console.error('Create category error:', error)
      throw error
    }
  }

  async updateCategory(id: number, categoryData: CategoryRequestDTO): Promise<ApiResponse<CategoryResponseDTO>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(categoryData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<CategoryResponseDTO>
    } catch (error) {
      console.error('Update category error:', error)
      throw error
    }
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<void>
    } catch (error) {
      console.error('Delete category error:', error)
      throw error
    }
  }
}

export const categoryAPI = new CategoryAPI() 