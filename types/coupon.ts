export interface Category {
  id: string
  name: string
}

export interface Course {
  id: string
  title: string
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
}

export interface FilterSidebarProps {
  selectedCategories: string | null
  selectedCourses: string | null
  onCategoryToggle: (categoryId: string | null) => void
  onCourseToggle: (courseId: string | null) => void
  onDiscountChange: (value: string) => void
  onClearFilters: () => void
  onApplyFilter: () => void
  minDiscount: string
  allCategories: Category[]
  allCourses: Course[]
}

export interface ClaimedCoupon {
  userId: string
  couponId: string
  claimedAt: string
} 