export interface ApiResponse<T> {
  data: T
  message: string
  detail?: string
}

export interface ApiError {
  message: string
  detail?: string
  data?: any
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

export interface SortParams {
  sortBy?: string
  direction?: 'ASC' | 'DESC'
}

export interface BaseEntity {
  id: number
  createdDate?: string
  modifiedDate?: string
}

export interface BaseResponse {
  id: number
  createdDate?: string
  modifiedDate?: string
}
