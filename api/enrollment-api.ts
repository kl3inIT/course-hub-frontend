import { httpClient } from "@/api/http-client"
import { ApiResponse, Page } from "@/types/common"
import {
    EnrollmentRequestDTO,
    EnrollmentResponseDTO,
    EnrollmentSearchParams,
    UserEnrollmentStatistics,
    ResponseGeneral
} from "@/types/enrollment"
import { CourseResponseDTO } from "@/types/course"
import axios, { AxiosError } from 'axios'

// Define error response type
interface ErrorResponse {
    message: string
    detail?: string
}

export interface EnrollmentPageResponse extends Page<EnrollmentResponseDTO> {
    totalElements: number
    content: EnrollmentResponseDTO[]
}

export const enrollmentApi = {
    // Get total number of enrolled courses for current user
    getEnrolledCount: async (): Promise<ApiResponse<number>> => {
        try {
            const response = await httpClient.get("/enrollments/count")
            return response.data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>
                throw new Error(`Failed to get enrolled count: ${axiosError.response?.data?.message || axiosError.message}`)
            }
            throw error
        }
    },

    // Get list of enrolled courses for current user
    getEnrolledCourses: async (params?: EnrollmentSearchParams): Promise<ApiResponse<Page<EnrollmentResponseDTO>>> => {
        try {
            const response = await httpClient.get("/enrollments/enrolled", {
                params,
                timeout: 10000
            })
            return response.data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 500) {
                    throw new Error("Server error while fetching enrolled courses. Please try again later.")
                }
                // If no enrollments found (404), return empty page instead of throwing error
                if (error.response?.status === 404) {
                    return {
                        message: "No enrolled courses found",
                        data: {
                            content: [],
                            totalElements: 0,
                            totalPages: 0,
                            size: params?.size || 10,
                            number: params?.page || 0
                        }
                    }
                }
                const errorMessage = error.response?.data?.message || error.message || "Failed to get enrolled courses"
                throw new Error(errorMessage)
            }
            throw error
        }
    },

    getEnrollmentById: async (id: string): Promise<ApiResponse<EnrollmentResponseDTO>> => {
        const response = await httpClient.get(`/enrollments/${id}`)
        return response.data
    },

    createEnrollment: async (data: EnrollmentRequestDTO): Promise<ApiResponse<EnrollmentResponseDTO>> => {
        const response = await httpClient.post("/enrollments", data)
        return response.data
    },

    updateEnrollment: async (id: string, data: Partial<EnrollmentRequestDTO>): Promise<ApiResponse<EnrollmentResponseDTO>> => {
        const response = await httpClient.put(`/enrollments/${id}`, data)
        return response.data
    },

    deleteEnrollment: async (id: string): Promise<ApiResponse<void>> => {
        const response = await httpClient.delete(`/enrollments/${id}`)
        return response.data
    },

    updateEnrollmentStatus: async (id: string, status: 'ENROLLED' | 'COMPLETED' | 'DROPPED'): Promise<ApiResponse<EnrollmentResponseDTO>> => {
        const response = await httpClient.put(`/enrollments/${id}/status`, { status })
        return response.data
    },

    updateEnrollmentProgress: async (id: string, progress: number): Promise<ApiResponse<EnrollmentResponseDTO>> => {
        const response = await httpClient.put(`/enrollments/${id}/progress`, { progress })
        return response.data
    },

    updateEnrollmentGrade: async (id: string, grade: number): Promise<ApiResponse<EnrollmentResponseDTO>> => {
        const response = await httpClient.put(`/enrollments/${id}/grade`, { grade })
        return response.data
    },

    getEnrollmentStatistics: async (courseId: number): Promise<ApiResponse<{
        totalEnrolled: number
        completed: number
        dropped: number
        averageGrade: number
        averageProgress: number
    }>> => {
        const response = await httpClient.get(`/enrollments/courses/${courseId}/statistics`)
        return response.data
    }
} 