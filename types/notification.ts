export enum NotificationType {
  COMMENT_LIKED = 'COMMENT_LIKED',
  COMMENT_REPLIED = 'COMMENT_REPLIED',
  NOTIFICATION_HIDDEN = 'NOTIFICATION_HIDDEN',
  NOTIFICATION_SHOWN = 'NOTIFICATION_SHOWN',
  USER_WARNED = 'USER_WARNED',
  USER_BANNED = 'USER_BANNED',
  USER_UNBANNED = 'USER_UNBANNED',
  ADMIN_ANNOUNCEMENT = 'ADMIN_ANNOUNCEMENT',
  COURSE_UPDATE = 'COURSE_UPDATE',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  EMERGENCY = 'EMERGENCY',
}

export interface NotificationDTO {
  id: number
  userId: number
  userName: string
  actorId: number
  actorName: string
  type: NotificationType
  message: string
  isRead: number
  resourceId?: number
  resourceType?: string
  createdAt: string
  link?: string
  // Additional properties for admin notifications
  title?: string
  status?: string
  recipientType?: string
  readCount?: number
  totalRecipients?: number
  scheduledFor?: string
  sentAt?: string
}

export interface NotificationCountResponse {
  unreadCount: number
}
