export interface CategoryDetailDTO {
  id: number
  name: string
  description: string
  courseCount: number
  totalStudents: number
  totalRevenue: number
  revenueProportion: number
}

export interface CourseAnalyticsDetailResponseDTO {
  courseId: number
  courseName: string
  students: number
  rating: number
  revenue: number
  revenuePercent: number
  reviews: number
  level: string
}

export interface StudentAnalyticsDetailResponseDTO {
  id: number
  courseName: string
  newStudents: number
  previousCompletion: number
  growth: number
  reviews: number
  avgRating: number
}

export interface RevenueAnalyticsDetailResponseDTO {
  id: number
  courseName: string
  revenue: number
  previousRevenue: number
  growth: number
  orders: number
  newStudents: number
  revenueShare: number
}
