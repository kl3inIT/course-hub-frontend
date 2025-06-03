export interface CourseRequestDTO {
  title: string;
  description: string;
  price: number;
  discount?: number;
  level: string;
  categoryCode: number;
}

export interface CourseUpdateStatusRequestDTO {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OPEN_FOR_ENROLLMENT' | 'CLOSED_FOR_ENROLLMENT';
}

export interface CourseUpdateStatusAndLevelRequestDTO {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OPEN_FOR_ENROLLMENT' | 'CLOSED_FOR_ENROLLMENT';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface CourseResponseDTO {
  id: number;
  title: string;
  description: string;
  price: number;
  discount?: number | null;
  thumbnailUrl?: string | null;
  category: string;
  level: string;
  finalPrice: number;
  status: string;
  instructorName: string;
  averageRating: number | null;
  totalReviews: number;
  totalStudents: number;
  totalLessons: number;
}

export interface CourseSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
} 