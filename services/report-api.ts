import { httpClient } from '@/services/http-client'
import { ApiResponse } from '@/types/common'
import {
  AggregatedReportDTO,
  AggregatedReportPage,
  GetReportsParams,
  ReportListResponse,
  ReportRequest,
  ReportResponse,
  ReportStatusRequest,
  ResourceLocationDTO,
} from '@/types/report'

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
      size = 55,
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

  getResourceLocation: async (
    reportId: number
  ): Promise<ApiResponse<ResourceLocationDTO>> => {
    const response = await httpClient.get(
      `/api/reports/${reportId}/resource-location`
    )
    return response.data
  },

  getResourceLocationByResourceId: async (
    resourceId: number
  ): Promise<ApiResponse<ResourceLocationDTO>> => {
    const response = await httpClient.get(
      `/api/reports/resource-location/${resourceId}`
    )
    return response.data
  },

  updateReportStatus: async (
    id: number,
    data: ReportStatusRequest
  ): Promise<ApiResponse<ReportResponse>> => {
    const response = await httpClient.patch(
      `/api/reports/resource/${id}/status`,
      data
    )
    return response.data
  },

  deleteReport: async (id: number): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete(`/api/reports/${id}`)
    return response.data
  },

  getAggregatedReports: async (
    params: GetReportsParams = {}
  ): Promise<ApiResponse<AggregatedReportPage>> => {
    const {
      page = 0,
      size = 5,
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
    if (params.resourceId) queryParams.append('resourceId', params.resourceId)

    try {
      const response = await httpClient.get(
        `/api/reports/aggregated?${queryParams}`
      )
      return response.data
    } catch (error) {
      console.error('Error fetching aggregated reports:', error)
      throw error
    }
  },

  getAggregatedReportByResourceId: async (
    resourceId: number
  ): Promise<ApiResponse<AggregatedReportDTO>> => {
    try {
      const response = await httpClient.get(
        `/api/reports/aggregated/${resourceId}`
      )
      return response.data
    } catch (error) {
      console.error('Error fetching aggregated report by resourceId:', error)
      throw error
    }
  },
}
