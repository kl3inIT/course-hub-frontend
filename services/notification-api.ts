import { httpClient } from '@/services/http-client'
import { ApiResponse, Page } from '@/types/common'
import { NotificationDTO, NotificationType } from '@/types/notification'

export const notificationApi = {
  getNotifications: async (params: {
    page: number
    size: number
    sortBy?: string
    direction?: 'ASC' | 'DESC'
  }) => {
    const response = await httpClient.get<ApiResponse<Page<NotificationDTO>>>(
      '/api/notifications',
      { params }
    )
    return response
  },

  getUnreadCount: async () => {
    const response = await httpClient.get<ApiResponse<number>>(
      '/api/notifications/unread-count'
    )
    return response
  },

  markAsRead: async (notificationId: number) => {
    const response = await httpClient.post<ApiResponse<void>>(
      `/api/notifications/${notificationId}/read`
    )
    return response
  },

  markAllAsRead: async () => {
    const response = await httpClient.post<ApiResponse<void>>(
      '/api/notifications/read-all'
    )
    return response
  },

  deleteNotification: async (notificationId: number) => {
    return httpClient.delete(`/api/notifications/${notificationId}`)
  },

  deleteAllNotifications: async () => {
    return httpClient.delete(`/api/notifications/all`)
  },

  createNotification: async (data: {
    type: NotificationType
    message: string
    recipientType: string
  }) => {
    const response = await httpClient.post<ApiResponse<NotificationDTO>>(
      '/api/notifications',
      data
    )
    return response
  },
}
