import { ApiResponse } from "@/types/common"

export interface CertificateRequestDTO {
    enrollmentId: string
    issueDate?: Date
    expiryDate?: Date
    additionalInfo?: {
        [key: string]: any
    }
}

export interface CertificateResponseDTO {
    id: string
    userId: string
    courseId: string
    courseName: string
    userName: string
    issueDate: Date
    expiryDate?: Date
    certificateNumber: string
    verificationUrl: string
    status: 'VALID' | 'EXPIRED' | 'REVOKED'
    metadata?: {
        grade?: number
        completionDate?: Date
        duration?: string
        skills?: string[]
        [key: string]: any
    }
}

export interface CertificateSearchParams {
    page?: number
    size?: number
    sort?: string
    status?: 'VALID' | 'EXPIRED' | 'REVOKED'
    fromDate?: Date
    toDate?: Date
    courseId?: string
}

export type ResponseGeneral<T> = ApiResponse<T>
