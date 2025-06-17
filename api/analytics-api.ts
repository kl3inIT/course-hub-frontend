import { httpClient } from '@/api/http-client'
import { CategoryDetailDTO } from '@/types/analytics'
import { ApiResponse, Page, PaginationParams } from '@/types/common'

export type CategoryAnalyticsSearchParams = PaginationParams & {
  startDate?: string
  endDate?: string
}

export const analyticsApi = {
  getCategoryAnalyticsDetails: async (
    params?: CategoryAnalyticsSearchParams
  ): Promise<ApiResponse<Page<CategoryDetailDTO>>> => {
    const response = await httpClient.get('/api/analytics/categories/details', { params })
    return response.data
  },
}
