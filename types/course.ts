import { ModuleResponseDTO } from './module'

// Request DTOs
export interface CourseRequestDTO {
  title: string
  description: string
  price: number
  level: string
  categoryCode: number
}

export interface CourseCreationRequestDTO {
  title: string
  description: string
  price: number
  level: string
  categoryCode: number
}

export interface CourseUpdateRequestDTO {
  title?: string
  description?: string
  price?: number
  discount?: number
  level?: string
  status?: string
  categoryCode?: number
}

// Response DTOs
export interface CourseCreateUpdateResponseDTO {
  id: number
  title: string
  description: string
  price: number
  discount: number | null
  thumbnailUrl: string | null
  category: string
  level: string
  status: string
  managerId?: number
}

export interface CourseResponseDTO {
  id: number
  title: string
  description: string
  price: number
  discount: number | null
  thumbnailUrl: string | null
  category: string
  level: string
  finalPrice: number
  status: string
  instructorName: string
  averageRating: number | null
  totalReviews: number
  totalStudents: number
  totalLessons: number
  managerId: number
}

export interface CourseDetailsResponseDTO {
  id: number
  title: string
  description: string
  price: number
  discount: number | null
  thumbnailUrl: string | null
  category: string
  level: string
  finalPrice: number
  status: string
  instructorName: string
  averageRating: number | null
  totalReviews: number
  totalStudents: number
  totalLessons: number
  updatedAt: string
  totalModules: number
  totalDuration: number
  modules: ModuleResponseDTO[]
}

export interface CourseSearchParams {
  page?: number
  size?: number
  sort?: string
  search?: string
  category?: string
  level?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  searchTerm?: string
  categoryId?: number
  minRating?: number
  isFree?: boolean
  isDiscounted?: boolean
  status?: string
  sortBy?: string
  sortDirection?: string
}

export interface DashboardCourseResponseDTO {
  id: number
  title: string
  description: string
  thumbnailUrl: string | null
  category: string
  instructorName: string
  totalDuration: number
  totalLessons: number
  completed: boolean
  enrollDate: string
  completedDate: string | null
  progress: number
}

export interface CourseSearchStatsResponseDTO {
  totalCourses: number
  minPrice: number
  maxPrice: number
  avgRating: number
  levelStats: Record<string, number>
}

export interface ManagerCourseResponseDTO {
  id: number
  title: string
  description: string
  thumbnailUrl: string | null
  category: string
  lastUpdatedDate: string
  rating: number | null
  totalEnrollments: number
  status: string
  canEdit: boolean
}

export interface Course {
  id: number
  title: string
  description: string
  thumbnail: string
  enrollmentCount: number
}
