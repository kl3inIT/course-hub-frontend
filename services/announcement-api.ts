import { httpClient } from '@/services/http-client'
import {
  Announcement,
  AnnouncementFilter,
  AnnouncementStats,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '@/types/announcement'
import { ApiResponse, Page } from '@/types/common'

export const announcementApi = {
  // Get announcements with pagination and filters
  getAnnouncements: async (
    params: {
      page?: number
      size?: number
      sortBy?: string
      direction?: 'ASC' | 'DESC'
    } & AnnouncementFilter = {}
  ) => {
    const response = await httpClient.get<ApiResponse<Page<Announcement>>>(
      '/api/announcements',
      { params }
    )
    return response
  },

  // Get announcement by ID
  getAnnouncementById: async (id: string) => {
    const response = await httpClient.get<ApiResponse<Announcement>>(
      `/api/announcements/${id}`
    )
    return response
  },

  // Create new announcement
  createAnnouncement: async (
    data: CreateAnnouncementRequest & { status?: string }
  ) => {
    const response = await httpClient.post<ApiResponse<Announcement>>(
      '/api/announcements',
      data
    )
    return response
  },

  // Update announcement
  updateAnnouncement: async (
    id: string,
    data: UpdateAnnouncementRequest & { status?: string }
  ) => {
    const response = await httpClient.put<ApiResponse<Announcement>>(
      `/api/announcements/${id}`,
      data
    )
    return response
  },

  // Permanently delete announcement (hard delete)
  permanentlyDeleteAnnouncement: async (id: string) => {
    return httpClient.delete(`/api/announcements/${id}/permanent`)
  },

  // Send announcement immediately
  sendAnnouncement: async (id: string) => {
    const response = await httpClient.post<ApiResponse<Announcement>>(
      `/api/announcements/${id}/send`
    )
    return response
  },

  // Schedule announcement
  scheduleAnnouncement: async (id: string, scheduledTime: string) => {
    const response = await httpClient.post<ApiResponse<Announcement>>(
      `/api/announcements/${id}/schedule?scheduledTime=${scheduledTime}`
    )
    return response
  },

  // Cancel scheduled announcement
  cancelAnnouncement: async (id: string) => {
    const response = await httpClient.post<ApiResponse<void>>(
      `/api/announcements/${id}/cancel`
    )
    return response
  },

  // Clone announcement
  cloneAnnouncement: async (id: string) => {
    const response = await httpClient.post<ApiResponse<Announcement>>(
      `/api/announcements/${id}/clone`
    )
    return response
  },

  // Get announcement statistics
  getAnnouncementStats: async () => {
    const response = await httpClient.get<ApiResponse<AnnouncementStats>>(
      '/api/announcements/stats'
    )
    return response
  },

  // Mark announcement as read
  markAsRead: async (announcementId: string) => {
    const response = await httpClient.post<ApiResponse<void>>(
      `/api/announcements/${announcementId}/read`
    )
    return response
  },

  // Mark announcement as deleted (soft delete)
  markAnnouncementAsDeleted: async (announcementId: string) => {
    return httpClient.delete(`/api/announcements/${announcementId}/delete`)
  },

  // Unarchive announcement (restore from soft delete)
  unarchiveAnnouncement: async (announcementId: string) => {
    const response = await httpClient.post<ApiResponse<Announcement>>(
      `/api/announcements/${announcementId}/restore`
    )
    return response
  },

  // Archive announcement (soft delete for sent announcements)
  archiveAnnouncement: async (announcementId: string) => {
    const response = await httpClient.post<ApiResponse<void>>(
      `/api/announcements/${announcementId}/archive`
    )
    return response
  },

  // Get user's announcements
  getUserAnnouncements: async () => {
    const response = await httpClient.get<ApiResponse<Announcement[]>>(
      '/api/announcements/user',
      { params: { status: 'SENT' } }
    )
    return response
  },
}
