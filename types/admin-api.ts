import { User, UserDetail } from './user'

export interface UserManagementResponse {
  data: {
    content: User[]
    page: {
      totalElements: number
      totalPages: number
      pageSize: number
      pageNumber: number
    }
  }
  message: string
  detail: string | null
}

export interface UserDetailResponse {
  data: UserDetail
  message: string
  detail: string | null
}

export interface CourseStatsResponse {
  data: number
  message: string
  detail: string | null
}

export interface CreateManagerResponse {
  data: UserDetail
  message: string
  detail: string | null
}

// Basic response interface for reports compatibility
export interface ApiResponse<T> {
  data: T
  message: string
  detail: string | null
}
