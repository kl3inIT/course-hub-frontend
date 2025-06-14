import { BackendCouponResponse, Coupon } from "@/types/discount"

export const transformCoupon = (backendCoupon: BackendCouponResponse): Coupon => {
  
  return {
    id: backendCoupon.id.toString(),
    code: backendCoupon.code,
    description: backendCoupon.description,
    percentage: backendCoupon.percentage,
    startDate: backendCoupon.startDate,
    endDate: backendCoupon.endDate,
    isActive: backendCoupon.isActive,
    quantity: backendCoupon.quantity,
    usage: backendCoupon.usage,
    availableQuantity: backendCoupon.availableQuantity,
    totalCategory: backendCoupon.totalCategory || 0,
    totalCourse: backendCoupon.totalCourse || 0,
    categoryIds: backendCoupon.categoryIds || [],
    courseIds: backendCoupon.courseIds || [],
  }
} 