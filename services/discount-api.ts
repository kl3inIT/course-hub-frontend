import { httpClient } from '@/services/http-client'
import { ApiResponse, Page } from '@/types/common'
import {
  DiscountRequestDTO,
  DiscountResponseDTO,
} from '@/types/discount'

export const discountApi = {
  validateDiscount: async (
    data: DiscountRequestDTO
  ): Promise<ApiResponse<DiscountResponseDTO>> => {
    const response = await httpClient.post('/api/discounts/verify', data)
    return response.data
  },
}
