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
