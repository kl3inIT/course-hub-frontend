import { httpClient } from '@/services/http-client'
import { DashboardManagerResponse } from '@/types/dashboard'

const dashboardApi = {
  getManagerDashboard: async (): Promise<DashboardManagerResponse> => {
    const response = await httpClient.get('/api/dashboard/manager')
    return response.data
  },
}

export function getManagerDashboardStats(month: number, year: number) {
  return httpClient
    .get<DashboardManagerResponse>(`/api/dashboard/manager/stats`, {
      params: { month, year },
    })
    .then(res => res.data)
}

export function getRevenueChartByYear(year: number) {
  return httpClient
    .get<{ data: number[] }>(`/api/dashboard/manager/revenue-chart`, {
      params: { year },
    })
    .then(res => res.data.data)
}

export function getNewCoursesChartByYear(year: number) {
  return httpClient
    .get<{ data: number[] }>(`/api/dashboard/manager/new-courses-chart`, {
      params: { year },
    })
    .then(res => res.data.data)
}

export function getStudentEnrollmentChartByYear(year: number) {
  return httpClient
    .get<{ data: number[] }>(
      `/api/dashboard/manager/student-enrollment-chart`,
      {
        params: { year },
      }
    )
    .then(res => res.data.data)
}

export function getTopCoursesByMonthYear(month: number, year: number) {
  return httpClient
    .get<{ data: any[] }>(`/api/dashboard/manager/top-courses`, {
      params: { month, year },
    })
    .then(res => res.data.data)
}

export function getRevenueInsightsByMonthYear(month: number, year: number) {
  return httpClient
    .get<{ data: DashboardManagerResponse }>(
      `/api/dashboard/manager/revenue-insights`,
      {
        params: { month, year },
      }
    )
    .then(res => res.data.data)
}

export default dashboardApi
