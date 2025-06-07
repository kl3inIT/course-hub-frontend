import { BaseResponse, ApiResponse } from "./common"
import { CourseResponseDTO } from "./course"

export interface EnrollmentSearchParams {
    page?: number
    size?: number
    sort?: string
    courseId?: number
    userId?: number
    status?: 'ENROLLED' | 'COMPLETED' | 'DROPPED'
    startDate?: string
    endDate?: string
}

export interface EnrollmentRequestDTO {
    courseId: number
    userId: number
    status?: 'ENROLLED' | 'COMPLETED' | 'DROPPED'
}

export interface EnrollmentResponseDTO extends BaseResponse {
    courseId: number
    userId: number
    completionDate?: string
    status: 'ENROLLED' | 'COMPLETED' | 'DROPPED'
    progress: number
    grade?: number
    course?: CourseResponseDTO
}

export interface UserEnrollmentStatistics {
    totalEnrolledCourses: number
    completedCourses: number
    inProgressCourses: number
    averageProgress: number
    averageGrade: number
}

export type ResponseGeneral<T> = ApiResponse<T> 