// types/lesson.ts

// Request DTOs
export interface LessonRequestDTO {
  title: string
  description?: string
  duration?: number
  orderNumber?: number
  isPreview?: boolean
}

export interface LessonUploadRequestDTO {
  title: string
  fileName: string
  fileType: string
}

export interface LessonConfirmRequestDTO {
  duration: number
}

export interface LessonUpdateRequestDTO {
  title?: string
  description?: string
  duration?: number
  order?: number
  isPreview?: boolean
}

// Response DTOs
export interface LessonResponseDTO {
  id: number
  title: string
  duration: number | null
  orderNumber: number
  isPreview: number // Backend trả về Long (0 hoặc 1)
}

export interface LessonUploadResponseDTO {
  lessonId: number
  preSignedPutUrl: string
  s3Key: string
}

export interface LessonVideoUpdateResponseDTO {
  lessonId: number
  preSignedPutUrl: string
  s3Key: string
  fileName: string
  fileType: string
}
