import { httpClient } from '@/services/http-client'
import { ApiResponse } from '@/types/common'
import { PageResponse, PaymentHistoryRequestDTO, PaymentHistoryResponseDTO } from '@/types/payment'

interface PaymentRequestDTO {
  courseId: number
  amount: number
  discountId?: number
}

interface PaymentResponseDTO {
  transactionCode: string
  bankNumber: string
  bankCode: string
  accountHolder: string
  amount: number
}

interface UpdatePaymentStatusDTO {
  transactionCode: string
  status: 'success' | 'failed'
}

interface PaymentStatusResponse {
  data: {
    isPaid: boolean
  }
  message: string
  detail: null
}

interface PaymentOverallResponse {
  data: {
    totalAmount: string
    successfulPayments: string
    pendingPayments: string
    failedPayments: string
  }
  message: string
  detail: null
}

export const paymentApi = {
  createPayment: async (
    data: PaymentRequestDTO
  ): Promise<ApiResponse<PaymentResponseDTO>> => {
    const response = await httpClient.post('/api/payments/init', data)
    return response.data
  },

  checkPaymentStatus: async (
    transactionCode: string
  ): Promise<PaymentStatusResponse> => {
    const response = await httpClient.get(
      `/api/payments/${transactionCode}/payment-status`
    )
    return response.data
  },

  updatePaymentStatus: async (
    transactionCode: string
  ): Promise<ApiResponse<void>> => {
    const response = await httpClient.patch(
      `/api/payments/${transactionCode}/expired`,
      {}
    )
    return response.data
  },

  getPaymentHistory: async (
    params: PaymentHistoryRequestDTO
  ): Promise<ApiResponse<PageResponse<PaymentHistoryResponseDTO>>> => {
    const response = await httpClient.get('/api/payments', { params })
    return response.data
  },

  exportToExcel: async (params: PaymentHistoryRequestDTO): Promise<Blob> => {
    const response = await httpClient.get('/api/payments/excel', { 
      params,
      responseType: 'blob'
    })
    return response.data 
  },

  getPaymentOverall: async (params: PaymentHistoryRequestDTO): Promise<PaymentOverallResponse> => {
    const response = await httpClient.get('/api/payments/overall', { params })
    return response.data
  },

  getMyPaymentHistory: async (params: PaymentHistoryRequestDTO): Promise<ApiResponse<PageResponse<PaymentHistoryResponseDTO>>> => {
    const response = await httpClient.get('/api/payments/my', { params })
    return response.data
  },
}
