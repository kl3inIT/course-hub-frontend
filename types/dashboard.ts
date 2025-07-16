export interface DashboardManagerResponse {
  data: DashboardManagerData
  message: string
  detail: string
}

export interface TopCourse {
  name: string
  students: number
}

export interface DashboardManagerData {
  totalCategories: number
  categoryGrowth: number
  totalCourses: number
  courseGrowth: number
  totalStudents: number
  studentGrowth: number
  totalRevenue: number
  revenueGrowth: number
  totalLastMonthRevenue: number
  lastMonthRevenueGrowth: number
  totalThreeMonthsAgoRevenue: number
  threeMonthsAgoRevenueGrowth: number
  monthlyRevenue: number[]
  monthlyNewCourses: number[]
  monthlyStudentEnrollments: number[]
  topCourses: TopCourse[]
}
