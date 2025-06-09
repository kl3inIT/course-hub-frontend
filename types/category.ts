import { BaseResponse } from './common'

export interface Category {
  id: string;
  name: string;
  description: string;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequestDTO {
  name: string;
  description: string;
}

export interface CategoryResponseDTO extends BaseResponse {
  name: string;
  description: string;
  courseCount: number;
  createdDate: string;
  modifiedDate: string;
}

export interface CategoryStats {
  total: number;
  totalCourses: number;
}

export interface CategorySearchParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface CategoryChartDTO {
  categoryName: string;
  courseCount: number;
  percentage: number;
}

export interface CategoryDetailDTO {
  categoryId: number;
  categoryName: string;
  description: string;
  courseCount: number;
  averageRating: number;
  totalStudents: number;
  totalRevenue: number;
  createdDate: string;
  modifiedDate: string;
} 