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
  FAILED = 'FAILED',
}

export interface PaymentHistoryRequestDTO {
  startDate?: string
  endDate?: string
  status?: string
  page: number
  size: number
  nameSearch?: string
}

export interface PaymentHistoryResponseDTO {
  id: number
  transactionCode: string
  courseName: string
  userName: string // This will contain the email address
  amount: number
  status: string
  date: string
}

export interface PageResponse<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface PaymentOverallStats {
  totalAmount: string
  successfulPayments: string
  pendingPayments: string
  failedPayments: string
}

export interface PaymentOverallResponse {
  data: PaymentOverallStats
  message: string
  detail: null
}
