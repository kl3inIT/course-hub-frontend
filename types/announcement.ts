import { Page } from './common'

// Announcement Types for broadcast notifications
export enum AnnouncementType {
  GENERAL = 'GENERAL',
  COURSE_UPDATE = 'COURSE_UPDATE',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  PROMOTION = 'PROMOTION',
  EMERGENCY = 'EMERGENCY',
}

// Announcement Status for lifecycle management
export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  CANCELLED = 'CANCELLED',
}

// Target Groups for announcement recipients
export enum TargetGroup {
  ALL_USERS = 'ALL_USERS',
  LEARNERS_ONLY = 'LEARNERS_ONLY',
  MANAGERS_ONLY = 'MANAGERS_ONLY',
  SPECIFIC_USERS = 'SPECIFIC_USERS',
}

// Enhanced Announcement DTO
export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  targetGroup: TargetGroup
  targetGroupDescription?: string
  status: AnnouncementStatus
  link?: string
  scheduledTime?: string
  sentTime?: string
  createdAt: string
  updatedAt?: string
  createdBy: number
  createdByName?: string
  isRead: number // 0 hoặc 1
  isDeleted: number // 0 hoặc 1
  readCount?: number
  totalRecipients?: number
  customRecipients?: number[] // User IDs for custom targeting
  targetCourseIds?: string // JSON string of course IDs
  targetUserIds?: string // JSON string of user IDs
}

// Create Announcement Request
export interface CreateAnnouncementRequest {
  title: string
  content: string
  type: AnnouncementType
  targetGroup: TargetGroup
  link?: string
  scheduledTime?: string
  isScheduled: boolean
  isPersonalized: boolean
  personalizedRecipients: string[]
  attachments: string[]
  customRecipients?: number[]
  courseIds?: number[]
  userIds?: number[]
  createdByName?: string
  sentTime?: string
  isDeleted?: boolean
}

// Update Announcement Request
export interface UpdateAnnouncementRequest {
  title?: string
  content?: string
  type?: AnnouncementType
  targetGroup?: TargetGroup
  link?: string
  scheduledTime?: string
  status?: AnnouncementStatus
  customRecipients?: number[]
  courseIds?: number[]
  userIds?: number[]
}

// Announcement List Response with pagination
export interface AnnouncementListResponse {
  content: Announcement[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// Re-export Page type for convenience
export type AnnouncementPage = Page<Announcement>

// Announcement Statistics
export interface AnnouncementStats {
  sent: number
  draft: number
  scheduled: number
  cancelled?: number
  total?: number
  readRate?: number
}

// Announcement Filter Options
export interface AnnouncementFilter {
  type?: AnnouncementType
  status?: AnnouncementStatus
  targetGroup?: TargetGroup
  dateFrom?: string
  dateTo?: string
  search?: string
  mode?: 'list' | 'history'
  isDeleted?: number
}
