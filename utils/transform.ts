import { BackendCoupon, Coupon } from "@/types/discount"

export const transformCoupon = (backendCoupon: BackendCoupon): Coupon => {
  const [usedCount, usageLimit] = backendCoupon.usage.split('/').map(Number)
  
  return {
    id: backendCoupon.id.toString(),
    code: backendCoupon.code,
    description: backendCoupon.description,
    discountType: 'percentage',
    discountValue: backendCoupon.percentage,
    minimumAmount: 0,
    maximumDiscount: undefined,
    applicationType: backendCoupon.isGlobal === 1 ? 'all' : 'specific',
    applicableCategories: backendCoupon.categoryIds?.map(id => id.toString()) || [],
    applicableCourses: backendCoupon.courseIds?.map(id => id.toString()) || [],
    startDate: new Date().toISOString(),
    endDate: backendCoupon.expiryTime ? new Date(backendCoupon.expiryTime).toISOString().split('T')[0] : '',
    usageLimit,
    usedCount,
    isActive: backendCoupon.isActive === 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Preserve backend fields for display
    totalCategory: backendCoupon.totalCategory,
    totalCourse: backendCoupon.totalCourse,
    categoryIds: backendCoupon.categoryIds,
    courseIds: backendCoupon.courseIds,
  }
} 