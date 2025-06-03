import { BaseResponse } from "./common"

export interface ModuleRequestDTO {
  title: string
}

export interface ModuleResponseDTO extends BaseResponse {
  title: string
  courseId: string
  lessonCount?: number
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