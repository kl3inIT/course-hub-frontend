export interface EnrollmentStatusResponseDTO {
  enrolled: boolean
  completed: boolean
  enrollDate?: string
  progress: number
}

export interface EnrollmentResponseDTO {
  id: number
  userId: number
  courseId: number
  enrolledAt: string
  progressPercentage: number
  isCompleted: boolean
}
