import { ModuleResponseDTO } from './module';

export interface CourseRequestDTO {
  title: string;
  description: string;
  price: number;
  discount?: number;
  level: string;
  categoryCode: number;
}

export interface CourseResponseDTO {
  id: number;
  title: string;
  description: string;
  price: number;
  discount: number | null;
  thumbnailUrl: string | null;
  category: string;
  level: string;
  finalPrice: number;
  status: string;
  instructorName: string;
  averageRating: number | null;
  totalReviews: number;
  totalStudents: number;
  totalLessons: number;
  managerId: number;
}

export interface CourseDetailsResponseDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  thumbnail: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  modules: ModuleResponseDTO[];
  createdAt: string;
  updatedAt: string;
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