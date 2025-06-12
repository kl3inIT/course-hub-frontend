import { httpClient } from '@/api/http-client'
import { ApiResponse } from '@/types/common'
import { EnrollmentStatusResponseDTO } from '@/types/enrollment'

export const enrollmentApi = {
  getEnrollmentStatus: async (courseId: string): Promise<ApiResponse<EnrollmentStatusResponseDTO>> => {
    const response = await httpClient.get(`/api/enrollments/status/${courseId}`)
    return response.data
  }
}
