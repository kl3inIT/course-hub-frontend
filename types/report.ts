export type ReportType = 'COMMENT' | 'REVIEW'
export type ReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH'
export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ResourceLocationDTO {
  resourceType: string
  resourceId: number
  lessonId: number
  moduleId: number
  courseId: number
  courseName: string
  moduleName: string
  lessonName: string
}

export interface GetReportsParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  type?: string
  severity?: string
  status?: string
  search?: string
  resourceId?: string
}

export interface ReportListResponse {
  content: ReportResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface ReportRequest {
  resourceType: ReportType
  resourceId: number
  reason: string
  severity: ReportSeverity
  description?: string
}

export interface ReportStatusRequest {
  status: ReportStatus
  actionNote?: string
}

export interface ReportResponse {
  reportId: number
  type: ReportType
  resourceId: number
  resourceTitle: string
  reason: string
  description?: string
  severity: ReportSeverity
  status: ReportStatus
  actionNote?: string
  reporterName: string
  reportedUserName: string
  reportedUserId: number
  reportedUserStatus: string
  reportedUserMemberSince: string
  warningCount: number
  hidden: boolean
  createdAt: string
}

// Aggregated report types for new BE API
export interface AggregatedReportDTO {
  resourceId: number
  resourceType: ReportType
  resourceContent: string
  resourceOwner: string
  resourceOwnerId: number
  resourceOwnerAvatar: string
  resourceOwnerStatus: string
  resourceOwnerMemberSince: string
  hidden: boolean
  totalReports: number | string
  status: ReportStatus
  severity: ReportSeverity
  createdAt: string | Date
  reports: ReportDetailDTO[]
}

export interface ReportDetailDTO {
  reportId: number
  reporterId: number
  reporterName: string
  reporterAvatar: string
  reason: string
  severity: ReportSeverity
  createdAt: string
}

export interface AggregatedReportPage {
  content: AggregatedReportDTO[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}
