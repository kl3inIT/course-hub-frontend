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