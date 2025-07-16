import { BaseResponse } from './common'

export interface ReviewRequestDTO {
  courseId: number
  star: number
  comment: string
}

export interface ReviewResponseDTO extends BaseResponse {
  userId: number
  userName: string
  userAvatar?: string
  courseId: number
  courseName: string
  categoryName: string
  star: number
  comment: string
  isHidden: number
  createdDate: string
  modifiedDate: string
}

export interface ReviewSearchParams {
  courseId?: number
  userId?: number
  star?: number
  page?: number
  size?: number
  sortBy?: string
  direction?: 'ASC' | 'DESC'
}

export interface ReviewFiltersParams {
  visibilityStatus: number
  star?: number
  categoryId?: number
  courseId?: number
  search?: string
  page?: number
  size?: number
  sortBy?: string
  direction?: 'ASC' | 'DESC'
}
