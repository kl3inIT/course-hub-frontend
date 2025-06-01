import { ApiResponse } from '@/types/api'

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
  id: string
  name: string
  description: string
  courseCount: number
  createdAt: string
  updatedAt: string
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

export interface CategoryResponseDTO {
  id: string
  name: string
  description: string
  courseCount: number
  createdDate: string
  modifiedDate: string
}

class CategoryAPI {
  private baseUrl = 'http://localhost:8080'

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken')
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }

  async getAllCategories(
    pagination: PaginationParams = {},
    filters: CategoryFilters = {}
  ): Promise<ApiResponse<PaginatedResponse<CategoryResponseDTO>>> {
    try {
      const {
        page = 0,
        size = 10,
        sort = 'name,asc'
      } = pagination;

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort
      });

      // Add filters if provided
      if (filters.name) params.append('name', filters.name);

      console.log('Fetching categories with URL:', `${this.baseUrl}/api/categories?${params}`);

      const response = await fetch(`${this.baseUrl}/api/categories?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`)
      }

      return responseData as ApiResponse<PaginatedResponse<CategoryResponseDTO>>
    } catch (error) {
      console.error('Get categories error:', error)
      throw error
    }
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
      console.log('Creating category:', categoryData);

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

  async updateCategory(categoryId: string, categoryData: CategoryRequestDTO): Promise<ApiResponse<CategoryResponseDTO>> {
    try {
      console.log('Updating category:', categoryId, categoryData);

      const response = await fetch(`${this.baseUrl}/api/categories/${categoryId}`, {
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

  async deleteCategory(categoryId: string): Promise<ApiResponse<void>> {
    try {
      console.log('Deleting category:', categoryId);

      const response = await fetch(`${this.baseUrl}/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
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