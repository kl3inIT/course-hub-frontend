import { ApplicableCoupon, BackendCouponResponse, Coupon } from '@/types/discount'

export const transformCoupon = (
  couponData: BackendCouponResponse | ApplicableCoupon
): Coupon => {
  return {
    id: couponData.id.toString(),
    code: couponData.code || '',
    description: couponData.description || '',
    percentage: couponData.percentage || 0,
    startDate: couponData.startDate || '',
    endDate: 'expiryDate' in couponData ? couponData.expiryDate : couponData.endDate || '',
    isActive: couponData.isActive || 0,
    quantity: couponData.quantity || 0,
    usage: 'usage' in couponData ? couponData.usage || 0 : 0,
    availableQuantity: 'availableQuantity' in couponData ? couponData.availableQuantity || 0 : 0,
    totalCategory: 'totalCategory' in couponData ? couponData.totalCategory || 0 : 0,
    totalCourse: 'totalCourse' in couponData ? couponData.totalCourse || 0 : 0,
    categoryIds: 'categoryIds' in couponData ? couponData.categoryIds || [] : [],
    courseIds: 'courseIds' in couponData ? couponData.courseIds || [] : [],
  }
}
