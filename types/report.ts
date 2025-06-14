export type ReportType = 'COMMENT' | 'REVIEW'
export type ReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH'
export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

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
  createdAt: string
}
