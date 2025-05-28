import {
  mockUsers,
  mockCourses,
  mockTransactions,
  mockEnrollments,
  mockCertificates,
  mockNotifications,
  mockAnalytics,
} from "./data"
import type { User, Course, Transaction, Enrollment, Certificate, Notification, Analytics } from "./types"

// Simulate API delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Authentication API
export const authAPI = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(800)

    const user = mockUsers.find((u) => u.email === email)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Simple password validation (in real app, this would be hashed)
    if (password.length < 3) {
      return { success: false, error: "Invalid password" }
    }

    return { success: true, user }
  },

  async register(userData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(1000)

    const existingUser = mockUsers.find((u) => u.email === userData.email)
    if (existingUser) {
      return { success: false, error: "Email already exists" }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email!,
      name: userData.name!,
      role: "learner",
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      permissions: ["view_courses", "enroll_courses"],
      stats: {
        coursesEnrolled: 0,
        coursesCompleted: 0,
        totalSpent: 0,
      },
    }

    mockUsers.push(newUser)
    return { success: true, user: newUser }
  },

  async verifyToken(token: string): Promise<{ success: boolean; user?: User }> {
    await delay(200)
    // In real implementation, verify JWT token
    return { success: true, user: mockUsers[0] }
  },

  async logout(): Promise<{ success: boolean }> {
    await delay(300)
    return { success: true }
  },
}

// Users API
export const usersAPI = {
  async getUsers(filters?: { role?: string; status?: string; search?: string }): Promise<User[]> {
    await delay(600)

    let filteredUsers = [...mockUsers]

    if (filters?.role && filters.role !== "all") {
      filteredUsers = filteredUsers.filter((u) => u.role === filters.role)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
      )
    }

    return filteredUsers
  },

  async getUserById(id: string): Promise<User | null> {
    await delay(400)
    return mockUsers.find((u) => u.id === id) || null
  },

  async updateUser(id: string, userData: Partial<User>): Promise<{ success: boolean; user?: User }> {
    await delay(700)

    const userIndex = mockUsers.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return { success: false }
    }

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData }
    return { success: true, user: mockUsers[userIndex] }
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    await delay(500)

    const userIndex = mockUsers.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return { success: false }
    }

    mockUsers.splice(userIndex, 1)
    return { success: true }
  },
}

// Courses API
export const coursesAPI = {
  async getCourses(filters?: {
    category?: string
    level?: string
    search?: string
    instructor?: string
    status?: string
  }): Promise<Course[]> {
    await delay(600)

    let filteredCourses = [...mockCourses]

    if (filters?.category && filters.category !== "all") {
      filteredCourses = filteredCourses.filter((c) => c.category === filters.category)
    }

    if (filters?.level && filters.level !== "all") {
      filteredCourses = filteredCourses.filter((c) => c.level === filters.level)
    }

    if (filters?.status && filters.status !== "all") {
      filteredCourses = filteredCourses.filter((c) => c.status === filters.status)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filteredCourses = filteredCourses.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.instructor.toLowerCase().includes(search),
      )
    }

    return filteredCourses
  },

  async getCourseById(id: string): Promise<Course | null> {
    await delay(400)
    return mockCourses.find((c) => c.id === id) || null
  },

  async createCourse(courseData: Partial<Course>): Promise<{ success: boolean; course?: Course }> {
    await delay(1000)

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: courseData.title!,
      description: courseData.description!,
      shortDescription: courseData.shortDescription!,
      thumbnail: courseData.thumbnail || "/placeholder.svg?height=200&width=300",
      instructor: courseData.instructor!,
      instructorId: courseData.instructorId!,
      instructorAvatar: courseData.instructorAvatar || "/placeholder.svg?height=40&width=40",
      category: courseData.category!,
      level: courseData.level!,
      price: courseData.price!,
      rating: 0,
      reviewCount: 0,
      enrollmentCount: 0,
      duration: courseData.duration!,
      lessonsCount: courseData.lessonsCount || 0,
      language: courseData.language || "English",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: courseData.tags || [],
      requirements: courseData.requirements || [],
      whatYouWillLearn: courseData.whatYouWillLearn || [],
      modules: [],
      reviews: [],
    }

    mockCourses.push(newCourse)
    return { success: true, course: newCourse }
  },

  async updateCourse(id: string, courseData: Partial<Course>): Promise<{ success: boolean; course?: Course }> {
    await delay(800)

    const courseIndex = mockCourses.findIndex((c) => c.id === id)
    if (courseIndex === -1) {
      return { success: false }
    }

    mockCourses[courseIndex] = {
      ...mockCourses[courseIndex],
      ...courseData,
      updatedAt: new Date().toISOString(),
    }
    return { success: true, course: mockCourses[courseIndex] }
  },

  async deleteCourse(id: string): Promise<{ success: boolean }> {
    await delay(600)

    const courseIndex = mockCourses.findIndex((c) => c.id === id)
    if (courseIndex === -1) {
      return { success: false }
    }

    mockCourses.splice(courseIndex, 1)
    return { success: true }
  },

  async enrollInCourse(userId: string, courseId: string): Promise<{ success: boolean; enrollment?: Enrollment }> {
    await delay(500)

    const existingEnrollment = mockEnrollments.find((e) => e.userId === userId && e.courseId === courseId)
    if (existingEnrollment) {
      return { success: false }
    }

    const newEnrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedLessons: [],
      lastAccessedAt: new Date().toISOString(),
    }

    mockEnrollments.push(newEnrollment)

    // Update course enrollment count
    const course = mockCourses.find((c) => c.id === courseId)
    if (course) {
      course.enrollmentCount += 1
    }

    return { success: true, enrollment: newEnrollment }
  },
}

// Transactions API
export const transactionsAPI = {
  async getTransactions(filters?: {
    status?: string
    type?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<Transaction[]> {
    await delay(600)

    let filteredTransactions = [...mockTransactions]

    if (filters?.status && filters.status !== "all") {
      filteredTransactions = filteredTransactions.filter((t) => t.status === filters.status)
    }

    if (filters?.type && filters.type !== "all") {
      filteredTransactions = filteredTransactions.filter((t) => t.type === filters.type)
    }

    if (filters?.userId) {
      filteredTransactions = filteredTransactions.filter((t) => t.userId === filters.userId)
    }

    return filteredTransactions
  },

  async getTransactionById(id: string): Promise<Transaction | null> {
    await delay(400)
    return mockTransactions.find((t) => t.id === id) || null
  },

  async createTransaction(
    transactionData: Partial<Transaction>,
  ): Promise<{ success: boolean; transaction?: Transaction }> {
    await delay(800)

    const newTransaction: Transaction = {
      id: `TXN-${Date.now()}`,
      userId: transactionData.userId!,
      userName: transactionData.userName!,
      userEmail: transactionData.userEmail!,
      type: transactionData.type!,
      amount: transactionData.amount!,
      currency: transactionData.currency || "USD",
      status: "pending",
      paymentMethod: transactionData.paymentMethod!,
      courseId: transactionData.courseId,
      courseName: transactionData.courseName,
      createdAt: new Date().toISOString(),
      paymentGateway: transactionData.paymentGateway || "stripe",
      transactionFee: transactionData.amount! * 0.029,
      netAmount: transactionData.amount! * 0.971,
      refundable: true,
    }

    mockTransactions.push(newTransaction)
    return { success: true, transaction: newTransaction }
  },

  async processRefund(
    transactionId: string,
    refundData: { amount: number; reason: string },
  ): Promise<{ success: boolean }> {
    await delay(1000)

    const originalTransaction = mockTransactions.find((t) => t.id === transactionId)
    if (!originalTransaction || !originalTransaction.refundable) {
      return { success: false }
    }

    const refundTransaction: Transaction = {
      id: `TXN-${Date.now()}`,
      userId: originalTransaction.userId,
      userName: originalTransaction.userName,
      userEmail: originalTransaction.userEmail,
      type: "refund",
      amount: -refundData.amount,
      currency: originalTransaction.currency,
      status: "completed",
      paymentMethod: originalTransaction.paymentMethod,
      courseId: originalTransaction.courseId,
      courseName: originalTransaction.courseName,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      paymentGateway: originalTransaction.paymentGateway,
      transactionFee: -(refundData.amount * 0.029),
      netAmount: -(refundData.amount * 0.971),
      refundable: false,
      originalTransactionId: transactionId,
      refundReason: refundData.reason,
    }

    mockTransactions.push(refundTransaction)
    originalTransaction.refundable = false

    return { success: true }
  },
}

// Enrollments API
export const enrollmentsAPI = {
  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    await delay(400)
    return mockEnrollments.filter((e) => e.userId === userId)
  },

  async updateProgress(enrollmentId: string, lessonId: string): Promise<{ success: boolean }> {
    await delay(300)

    const enrollment = mockEnrollments.find((e) => e.id === enrollmentId)
    if (!enrollment) {
      return { success: false }
    }

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId)
      enrollment.lastAccessedAt = new Date().toISOString()

      // Calculate progress based on completed lessons
      const course = mockCourses.find((c) => c.id === enrollment.courseId)
      if (course) {
        const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)
        enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100)

        // Check if course is completed
        if (enrollment.progress === 100) {
          enrollment.completedAt = new Date().toISOString()

          // Generate certificate
          const certificate: Certificate = {
            id: `cert-${Date.now()}`,
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            courseName: course.title,
            instructor: course.instructor,
            completedAt: enrollment.completedAt,
            issuedAt: new Date().toISOString(),
          }

          mockCertificates.push(certificate)
          enrollment.certificateId = certificate.id
        }
      }
    }

    return { success: true }
  },
}

// Notifications API
export const notificationsAPI = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    await delay(300)
    return mockNotifications.filter((n) => n.userId === userId)
  },

  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    await delay(200)

    const notification = mockNotifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      return { success: true }
    }

    return { success: false }
  },

  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    await delay(300)

    mockNotifications.filter((n) => n.userId === userId).forEach((n) => (n.isRead = true))

    return { success: true }
  },
}

// Analytics API
export const analyticsAPI = {
  async getOverview(): Promise<Analytics["overview"]> {
    await delay(800)
    return mockAnalytics.overview
  },

  async getUserGrowth(period = "7d"): Promise<Analytics["userGrowth"]> {
    await delay(600)
    return mockAnalytics.userGrowth
  },

  async getRevenueData(period = "7d"): Promise<Analytics["revenueData"]> {
    await delay(600)
    return mockAnalytics.revenueData
  },

  async getPopularCourses(): Promise<Analytics["popularCourses"]> {
    await delay(500)
    return mockAnalytics.popularCourses
  },

  async getCategoryStats(): Promise<Analytics["categoryStats"]> {
    await delay(500)
    return mockAnalytics.categoryStats
  },

  async getFullAnalytics(): Promise<Analytics> {
    await delay(1000)
    return mockAnalytics
  },
}

// Certificates API
export const certificatesAPI = {
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    await delay(400)
    return mockCertificates.filter((c) => c.userId === userId)
  },

  async getCertificateById(id: string): Promise<Certificate | null> {
    await delay(300)
    return mockCertificates.find((c) => c.id === id) || null
  },
}
