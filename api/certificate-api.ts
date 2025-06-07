import { httpClient } from "@/api/http-client"
import { ApiResponse, Page } from "@/types/common"
import {
    CertificateRequestDTO,
    CertificateResponseDTO,
    CertificateSearchParams,
    ResponseGeneral
} from "@/types/certificate"

export interface CertificatePageResponse extends Page<CertificateResponseDTO> {
    totalElements: number
    content: CertificateResponseDTO[]
}

export const certificateApi = {
    // Get total number of certificates for current user
    getCertificateCount: async (): Promise<ResponseGeneral<number>> => {
        const response = await httpClient.get("/certificates/count")
        return response.data
    },

    // Get list of certificates for current user
    getMyCertificates: async (params?: CertificateSearchParams): Promise<ApiResponse<Page<CertificateResponseDTO>>> => {
        const response = await httpClient.get("/certificates/my", { params })
        return response.data
    },

    // Get certificate by ID
    getCertificateById: async (id: string): Promise<ApiResponse<CertificateResponseDTO>> => {
        const response = await httpClient.get(`/certificates/${id}`)
        return response.data
    },

    // Generate certificate for a completed course
    generateCertificate: async (enrollmentId: string): Promise<ApiResponse<CertificateResponseDTO>> => {
        const response = await httpClient.post(`/certificates/generate/${enrollmentId}`)
        return response.data
    },

    // Verify certificate by ID
    verifyCertificate: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await httpClient.get(`/certificates/verify/${id}`)
        return response.data
    },

    // Download certificate as PDF
    downloadCertificate: async (id: string): Promise<Blob> => {
        const response = await httpClient.get(`/certificates/${id}/download`, {
            responseType: 'blob'
        })
        return response.data
    },

    // Share certificate (e.g., generate shareable link)
    shareCertificate: async (id: string): Promise<ApiResponse<string>> => {
        const response = await httpClient.post(`/certificates/${id}/share`)
        return response.data
    },

    // Get certificate statistics
    getCertificateStatistics: async (): Promise<ApiResponse<{
        totalIssued: number
        totalVerified: number
        averageCompletionTime: number
        certificatesByMonth: {
            month: string
            count: number
        }[]
    }>> => {
        const response = await httpClient.get('/certificates/statistics')
        return response.data
    }
} 