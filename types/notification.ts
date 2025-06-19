export enum NotificationType {
  COMMENT_LIKED = 'COMMENT_LIKED',
  COMMENT_REPLIED = 'COMMENT_REPLIED',
  NOTIFICATION_HIDDEN = 'NOTIFICATION_HIDDEN',
  NOTIFICATION_SHOWN = 'NOTIFICATION_SHOWN',
  USER_WARNED = 'USER_WARNED',
  USER_BANNED = 'USER_BANNED',
  USER_UNBANNED = 'USER_UNBANNED',
  ADMIN_ANNOUNCEMENT = 'ADMIN_ANNOUNCEMENT',
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
}

export interface NotificationCountResponse {
  unreadCount: number
}
