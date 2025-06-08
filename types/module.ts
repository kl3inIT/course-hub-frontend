import { BaseResponse } from "./common"
import { LessonResponseDTO } from "./lesson"

export interface ModuleRequestDTO {
  title: string
  description: string
  orderNumber: number
}

export interface ModuleResponseDTO {
  id: string
  title: string
  description: string
  orderNumber: number
  courseId: string
  lessons?: LessonResponseDTO[]
  createdAt: string
  updatedAt: string
}

export interface ModuleCreationRequest {
  title: string;
}

export interface ModuleResponse {
  id: number;
  title: string;
  orderNumber: number;
  courseId: number;
} 