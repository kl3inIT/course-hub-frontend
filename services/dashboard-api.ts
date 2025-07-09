import { httpClient } from '@/services/http-client'
import { DashboardManagerResponse } from '@/types/dashboard'

const dashboardApi = {
  getManagerDashboard: async (): Promise<DashboardManagerResponse> => {
    const response = await httpClient.get('/api/dashboard/manager')
    return response.data
  },
}

export default dashboardApi;
