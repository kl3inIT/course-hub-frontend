import { BaseResponse } from './common'

export interface PaymentRequestDTO {
  courseId: number
  discountCode?: string
  amount: number
}

export interface PaymentResponseDTO extends BaseResponse {
  id: number
  courseId: number
  userId: number
  amount: number
  discountCode?: string
  status: PaymentStatus
  createdAt: string
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
} 