import { BaseResponse } from './common'

export interface ModuleRequestDTO {
  title: string
}

export interface ModuleResponseDTO extends BaseResponse {
  id: number
  title: string
  orderNumber: number
  totalLessons: number
  totalDuration: number
  courseId: number
}

export interface ModuleCreationRequest {
  title: string
}

export interface ModuleResponse {
  id: number
  title: string
  orderNumber: number
  courseId: number
}
