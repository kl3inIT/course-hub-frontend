import { httpClient } from './http-client'

export type FeedbackCategory =
  | 'general'
  | 'technical'
  | 'billing'
  | 'course'
  | 'business'
  | 'feedback'

export interface FeedbackRequest {
  fullName: string
  email: string
  category: FeedbackCategory
  subject: string
  message: string
}

export interface Feedback {
  id: number
  fullName: string
  email: string
  category: string
  subject: string
  message: string
  createdAt: string
  adminReply?: string
  userEntity?: {
    id: number
    name: string
    email: string
  }
}

const categoryMap: Record<FeedbackCategory, string> = {
  general: 'GENERAL_SUPPORT',
  technical: 'TECHNICAL_ISSUE',
  billing: 'BILLING_QUESTION',
  course: 'COURSE_RELATED',
  business: 'BUSINESS_INQUIRY',
  feedback: 'FEEDBACK',
}

export const feedbackApi = {
  submitFeedback: async (data: FeedbackRequest) => {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      category: categoryMap[data.category],
      subject: data.subject,
      message: data.message,
    }
    const response = await httpClient.post('/api/feedbacks', payload)
    return response.data
  },

  getAllFeedback: async () => {
    const response = await httpClient.get('/api/feedbacks/getAllFeedback')
    return response.data
  },

  getFeedbackById: async (id: number) => {
    const response = await httpClient.get(`/api/feedbacks/${id}`)
    return response.data
  },

  countAllFeedbacks: async () => {
    const response = await httpClient.get('/api/feedbacks/count')
    return response.data
  },
}

export default feedbackApi
