import { httpClient } from '@/api/http-client'
import { ApiResponse } from '@/types/common'

interface PaymentRequestDTO {
  courseId: number
  amount: number
  discountCode?: string
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

  }

  
} 

