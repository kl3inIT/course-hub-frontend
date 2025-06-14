import { ModuleResponseDTO } from './module'

export interface CourseRequestDTO {
  title: string
  description: string
  price: number
  discount?: number
  level: string
  categoryCode: number
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
