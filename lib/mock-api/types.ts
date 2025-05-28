export interface User {
  id: string
  email: string
  name: string
  role: "learner" | "manager" | "admin"
  avatar?: string
  joinDate: string
  lastActive: string
  permissions: string[]
  profile?: {
    bio?: string
    location?: string
    website?: string
    phone?: string
    skills?: string[]
    experience?: string
    education?: string
  }
  stats?: {
    coursesEnrolled?: number
    coursesCompleted?: number
    totalSpent?: number
    totalRevenue?: number
    coursesCreated?: number
  }
}

export interface Course {
  id: string
  title: string
  description: string
  shortDescription: string
  thumbnail: string
  instructor: string
  instructorId: string
  instructorAvatar: string
  category: string
  level: "beginner" | "intermediate" | "advanced"
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  enrollmentCount: number
  duration: string
  lessonsCount: number
  language: string
  status: "published" | "draft" | "archived"
  createdAt: string
  updatedAt: string
  tags: string[]
  requirements: string[]
  whatYouWillLearn: string[]
  modules: Module[]
  reviews: Review[]
}

export interface Module {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string
  type: "video" | "text" | "quiz" | "assignment"
  duration: number
  order: number
  videoUrl?: string
  content?: string
  isCompleted?: boolean
  isFree?: boolean
}

export interface Review {
  id: string
  courseId: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
  hasResponse: boolean
  response?: {
    content: string
    createdAt: string
  }
}

export interface Transaction {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: "course_purchase" | "refund" | "subscription"
  amount: number
  currency: string
  status: "completed" | "pending" | "failed" | "refunded"
  paymentMethod: "credit_card" | "paypal" | "bank_transfer"
  courseId?: string
  courseName?: string
  createdAt: string
  completedAt?: string
  paymentGateway: string
  transactionFee: number
  netAmount: number
  refundable: boolean
  originalTransactionId?: string
  refundReason?: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
  progress: number
  completedLessons: string[]
  lastAccessedAt: string
  certificateId?: string
  completedAt?: string
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  courseName: string
  instructor: string
  completedAt: string
  issuedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: "course_update" | "new_course" | "achievement" | "system" | "payment"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export interface Analytics {
  overview: {
    totalUsers: number
    totalCourses: number
    totalRevenue: number
    totalEnrollments: number
    activeUsers: number
    newUsersThisMonth: number
    revenueThisMonth: number
    enrollmentsThisMonth: number
  }
  userGrowth: Array<{
    date: string
    users: number
    newUsers: number
  }>
  revenueData: Array<{
    date: string
    revenue: number
    transactions: number
  }>
  popularCourses: Array<{
    courseId: string
    title: string
    enrollments: number
    revenue: number
  }>
  categoryStats: Array<{
    category: string
    courses: number
    enrollments: number
    revenue: number
  }>
}
