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
  code: string
  description: string
  discountType: 'percentage'
  discountValue: number
  minimumAmount?: number
  maximumDiscount?: number
  applicationType: 'all' | 'specific'
  applicableCategories: string[]
  applicableCourses: string[]
  startDate: string
  endDate: string
  usageLimit: number
  usedCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Backend specific fields
  totalCategory?: number
  totalCourse?: number
  categoryIds?: number[]
  courseIds?: number[]
}

// Coupon API Request/Response Types
export interface CouponCreateRequestDTO {
  code: string
  description?: string
  expiryDate: string
  percentage: number
  isActive: number // 1 for active, 0 for inactive
  isGlobal: number // 1 for all items, 0 for specific items
  quantity: number
  categoryIds?: number[]
  courseIds?: number[]
}

export interface CouponUpdateRequestDTO {
  code: string
  description?: string
  expiryDate: string
  percentage: number
  isActive: number // 1 for active, 0 for inactive
  isGlobal: number // 1 for all items, 0 for specific items
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
}

// Backend Coupon Response (from API)
export interface BackendCouponResponse {
  id: number
  code: string
  description: string
  percentage: number
  totalCategory: number
  totalCourse: number
  categoryIds: number[]
  courseIds: number[]
  usage: string // format: "used/total" e.g. "0/12312"
  expiryTime: string
  isActive: number
  isGlobal: number
}

// Paginated Response from Backend
export interface PaginatedCouponResponse {
  content: BackendCouponResponse[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements: number
  first: boolean
  empty: boolean
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
