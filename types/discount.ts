import { BaseResponse } from './common'

export interface DiscountRequestDTO {
  code: string
  courseId: number
}

export interface DiscountResponseDTO extends BaseResponse {
  code: string
  percentage: number
  isValid: boolean
  minPurchase?: number
  maxDiscount?: number
  description?: string
  expiryDate?: string
}

export interface DiscountSearchParams {
  page?: number
  size?: number
  sort?: string
  search?: string
  isValid?: boolean
}
