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

// Map frontend category to backend FeedbackType
const categoryMap: Record<FeedbackCategory, string> = {
  general: 'GENERAL_SUPPORT',
  technical: 'TECHNICAL_ISSUE',
  billing: 'BILLING_QUESTION',
  course: 'COURSE_RELATED',
  business: 'BUSINESS_INQUIRY',
  feedback: 'FEEDBACK',
}

export async function submitFeedback(data: FeedbackRequest) {
  const payload = {
    fullName: data.fullName,
    email: data.email,
    category: categoryMap[data.category],
    subject: data.subject,
    message: data.message,
  }
  return httpClient.post('/api/feedbacks', payload)
}

export const getAllFeedback = () => {
  return httpClient.get('/api/feedbacks/getAllFeedback')
}

export const getFeedbackById = (id: number) => {
  return httpClient.get(`/api/feedbacks/${id}`)
}
