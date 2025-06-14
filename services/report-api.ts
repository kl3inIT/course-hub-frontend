import { httpClient } from '@/services/http-client'
import { ApiResponse } from '@/types/common'
import {
  ReportRequest,
  ReportResponse,
  ReportStatusRequest,
} from '@/types/report'

interface GetReportsParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  type?: string
  severity?: string
  status?: string
  search?: string
}

interface ReportListResponse {
  content: ReportResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const reportApi = {
  createReport: async (
    data: ReportRequest
  ): Promise<ApiResponse<ReportResponse>> => {
    const response = await httpClient.post('/api/reports', data)
    return response.data
  },

  getReports: async (
    params: GetReportsParams = {}
  ): Promise<ApiResponse<ReportListResponse>> => {
    const {
      page = 0,
      size = 10,
      sortBy = 'createdDate',
      sortDir = 'desc',
      type,
      severity,
      status,
      search,
    } = params

    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('size', size.toString())
    queryParams.append('sortBy', sortBy)
    queryParams.append('sortDir', sortDir)

    if (type) queryParams.append('type', type)
    if (severity) queryParams.append('severity', severity)
    if (status) queryParams.append('status', status)
    if (search) queryParams.append('search', search)

    try {
      const response = await httpClient.get(`/api/reports?${queryParams}`)
      return response.data
    } catch (error) {
      console.error('Error fetching reports:', error)
      throw error
    }
  },

  getReportById: async (id: number): Promise<ApiResponse<ReportResponse>> => {
    const response = await httpClient.get(`/api/reports/${id}`)
    return response.data
  },

  updateReportStatus: async (
    id: number,
    data: ReportStatusRequest
  ): Promise<ApiResponse<ReportResponse>> => {
    const response = await httpClient.patch(`/api/reports/${id}/status`, data)
    return response.data
  },

  deleteReport: async (id: number): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/api/reports/${id}`)
    return response.data
  },
}
