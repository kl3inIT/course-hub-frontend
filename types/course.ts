import { ModuleResponseDTO } from './module'

// Request DTOs - Updated to match backend exactly
export interface CourseRequestDTO {
  title: string
  description: string
  price: number // BigDecimal -> number
  level: string
  categoryCode: number // Long -> number
}

export interface CourseCreationRequestDTO {
  title: string // @NotBlank, @Size(5-100)
  description: string // @NotBlank, @Size(20-2000)
  price: number // @NotNull, BigDecimal -> number
  level: string // @EnumValue(CourseLevel)
  categoryCode: number // @NotNull, Long -> number
}

export interface CourseUpdateRequestDTO {
  title?: string // @Size(5-100)
  description?: string // @Size(20-2000)
  price?: number // BigDecimal -> number
  discount?: number // @DecimalMin(0.0), BigDecimal -> number
  level?: string // @EnumValue(CourseLevel)
  status?: string // @EnumValue(CourseStatus)
  categoryCode?: number // Long -> number
}

// Response DTOs - Updated to match backend exactly
export interface CourseCreateUpdateResponseDTO {
  id: number // Long in Java becomes number in TypeScript
  title: string
  description: string
  price: number // BigDecimal becomes number
  discount: number | null // BigDecimal becomes number
  thumbnailUrl: string | null
  category: string
  level: string
  status: string
  managerId?: number // Long becomes number
}

export interface CourseResponseDTO {
  id: number // Long -> number
  title: string
  description: string
  price: number // BigDecimal -> number
  discount: number | null // BigDecimal -> number
  thumbnailUrl: string | null
  category: string
  level: string
  finalPrice: number // BigDecimal -> number
  status: string
  instructorName: string
  averageRating: number | null // Double -> number
  totalReviews: number // Long -> number
  totalStudents: number // Long -> number
  totalLessons: number // Long -> number
  managerId: number // Long -> number
}

export interface CourseDetailsResponseDTO {
  id: number // Long -> number
  title: string
  description: string
  price: number // BigDecimal -> number
  discount: number | null // BigDecimal -> number
  thumbnailUrl: string | null
  category: string
  level: string
  finalPrice: number // BigDecimal -> number
  status: string
  instructorName: string
  averageRating: number | null // Double -> number
  totalReviews: number // Long -> number
  totalStudents: number // Long -> number
  totalLessons: number // Long -> number
  updatedAt: string
  totalModules: number // Long -> number
  totalDuration: number // Long -> number
  modules: ModuleResponseDTO[]
}

// Updated to match backend CourseSearchRequestDTO exactly
export interface CourseSearchParams {
  // Basic pagination
  page?: number
  size?: number

  // Search fields - match backend exactly
  searchTerm?: string // Backend: String searchTerm
  categoryId?: number // Backend: Long categoryId -> number
  level?: string // Backend: String level
  minPrice?: number // Backend: Double minPrice -> number
  maxPrice?: number // Backend: Double maxPrice -> number
  isFree?: boolean // Backend: Boolean isFree
  isDiscounted?: boolean // Backend: Boolean isDiscounted
  status?: string // Backend: String status
  sortBy?: string // Backend: String sortBy
  sortDirection?: string // Backend: String sortDirection

  // Legacy fields for backward compatibility (deprecated)
  sort?: string
  search?: string
  category?: string
}

// Updated to match backend exactly
export interface DashboardCourseResponseDTO {
  id: number // Long -> number
  title: string
  description: string
  thumbnailUrl: string | null
  category: string
  instructorName: string
  totalDuration: number // Long -> number
  totalLessons: number // Long -> number
  completed: boolean // Boolean -> boolean
  enrollDate: string // Date -> string (ISO format)
  completedDate: string | null // Date -> string (ISO format)
  progress: number // Double -> number
}

// Updated to match backend exactly
export interface CourseSearchStatsResponseDTO {
  totalCourses: number // Long -> number
  minPrice: number // Long -> number
  maxPrice: number // Long -> number
  avgRating: number // Long -> number
  levelStats: Record<string, number> // Map<String, Long> -> Record<string, number>
}

export interface ManagerCourseResponseDTO {
  id: number // Long -> number
  title: string
  description: string
  thumbnailUrl: string | null
  category: string
  lastUpdatedDate: string // Date -> string (ISO format)
  rating: number | null // Double -> number
  totalEnrollments: number // Long -> number
  status: string
  canEdit: boolean // Boolean -> boolean
}

// Course Enrollment Management Types - Updated to match backend DTOs
export interface CourseEnrollment {
  id: number // Long -> number to match backend
  studentId: number // Long -> number to match backend
  studentName: string
  studentEmail: string
  studentAvatar: string
  enrollmentDate: string // Date -> string (ISO format)
  lastAccessed: string // Date -> string (ISO format)
  progress: number // Double -> number
  completedLessons: number // Integer -> number
  totalLessons: number // Integer -> number
  timeSpent: number // Integer -> number (in minutes)
  status: string // String in backend, more flexible than enum
  certificateIssued: boolean // Boolean -> boolean
  completionDate?: string // Date -> string (ISO format)
  rating?: number // Double -> number
}

export interface CourseEnrollmentStats {
  totalEnrollments: number // Integer -> number
  activeEnrollments: number // Integer -> number
  completedEnrollments: number // Integer -> number
  averageProgress: number // Double -> number
  averageTimeSpent: number // Double -> number (in minutes)
  completionRate: number // Double -> number (percentage)
  averageRating: number // Double -> number
}
