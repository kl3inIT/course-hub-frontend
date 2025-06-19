import { BaseResponse } from './common'

export interface DiscountRequestDTO {
  code: string
  courseId: number
}

export interface DiscountResponseDTO extends BaseResponse {
  code: string
  percentage: number
  isValid: boolean
  minPurchase?: number
  maxDiscount?: number
  description?: string
  expiryDate?: string
}

export interface DiscountSearchParams {
  page?: number
  size?: number
  sort?: string
  search?: string
  isValid?: boolean
}

// Coupon Management Types
export interface Category {
  id: string
  name: string
  courseCount?: number
}

export interface Course {
  id: string
  title: string
  category?: string
  price?: number
}

export interface ClaimedCoupon {
  userId: string
  couponId: string
  claimedAt: string
}

export interface Coupon {
  id: string
  description: string
  percentage: number
  totalCategory: number
  totalCourse: number
  usage: number
  quantity: number
  availableQuantity: number
  categoryIds: number[]
  courseIds: number[]
  startDate: string
  endDate: string
  isActive: number
  code: string
  status: string
}

// Coupon API Request/Response Types
export interface CouponCreateRequestDTO {
  description?: string
  startDate: string
  endDate: string
  percentage: number
  isActive: number
  quantity: number
  categoryIds?: number[]
  courseIds?: number[]
}

export interface CouponUpdateRequestDTO {
  description?: string
  startDate: string
  endDate: string
  percentage: number
  isActive: number
  quantity: number
  categoryIds?: number[]
  courseIds?: number[]
}

export interface CouponSearchParams {
  page: number
  size: number
  isActive?: number
  categoryId?: number
  courseId?: number
  percentage?: number
  status?: string
}

// Backend Coupon Response (from API)
export interface BackendCouponResponse {
  id: number
  description: string
  percentage: number
  totalCategory: number
  totalCourse: number
  usage: number
  quantity: number
  availableQuantity: number
  categoryIds: number[]
  courseIds: number[]
  startDate: string
  endDate: string
  isActive: number
  code: string
  status: string
}

// Paginated Response from Backend - Cập nhật để khớp với response thực tế
export interface PaginatedCouponResponse {
  content: BackendCouponResponse[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface ApplicableCoupon {
  id: number
  code: string | null
  percentage: number
  description: string
  startDate: string | null
  expiryDate: string
  quantity: number
  isActive: number
  isGlobal: number | null
  isValid: boolean | null
}

export interface FilterSidebarProps {
  selectedCategories: string | null
  selectedCourses: string | null
  onCategoryToggle: (categoryId: string | null) => void
  onCourseToggle: (courseId: string | null) => void
  onDiscountChange: (value: string) => void
  onClearFilters: () => void
  minDiscount: string
  allCategories: Category[]
  allCourses: Course[]
  onApplyFilter: () => void
}

// Transform types
export interface BackendCoupon {
  id: number
  code: string
  description: string
  percentage: number
  expiryTime: string
  isActive: number
  isGlobal: number
  usage: string
  totalCategory?: number
  totalCourse?: number
  categoryIds?: number[]
  courseIds?: number[]
}

export interface PaginationResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface PaginationState {
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// Add new type for coupon status response
export interface CouponStatusResponse {
  AVAILABLE: string
  NOT_STARTED: string
  EXPIRED: string
  OUT_OF_STOCK: string
  USED_UP: string
}

// Add new type for coupon stats response
export interface CouponStatsResponse {
  totalDiscounts: string
  totalUsage: string
  activeDiscounts: string
}
