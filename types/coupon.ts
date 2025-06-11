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
  code: string
  discount: number
  description: string
  validUntil: string
  isActive: boolean
  isClaimed?: boolean
  scope: {
    type: 'all' | 'categories' | 'specific_course'
    categories?: Category[]
    course?: Course
  }
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