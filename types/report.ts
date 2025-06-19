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
