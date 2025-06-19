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

export interface PageableResponse {
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

export interface PageResponse<T> {
  content: T[]
  pageable: PageableResponse
  last: boolean
  totalElements: number
  totalPages: number
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
