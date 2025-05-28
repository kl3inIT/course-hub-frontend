// API Client for making requests to the mock API
// This abstraction layer makes it easy to switch to real API later

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class APIClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  async verifyToken() {
    return this.request("/auth/verify")
  }

  // Users methods
  async getUsers(filters?: any) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/users${params ? `?${params}` : ""}`)
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`)
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    })
  }

  // Courses methods
  async getCourses(filters?: any) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/courses${params ? `?${params}` : ""}`)
  }

  async getCourseById(id: string) {
    return this.request(`/courses/${id}`)
  }

  async createCourse(courseData: any) {
    return this.request("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    })
  }

  async updateCourse(id: string, courseData: any) {
    return this.request(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    })
  }

  async deleteCourse(id: string) {
    return this.request(`/courses/${id}`, {
      method: "DELETE",
    })
  }

  async enrollInCourse(courseId: string, userId: string) {
    return this.request(`/courses/${courseId}/enroll`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    })
  }

  // Transactions methods
  async getTransactions(filters?: any) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/transactions${params ? `?${params}` : ""}`)
  }

  async createTransaction(transactionData: any) {
    return this.request("/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    })
  }

  async processRefund(transactionId: string, refundData: any) {
    return this.request(`/transactions/${transactionId}/refund`, {
      method: "POST",
      body: JSON.stringify(refundData),
    })
  }

  // Analytics methods
  async getAnalytics(type?: string, period?: string) {
    const params = new URLSearchParams({ type: type || "", period: period || "7d" }).toString()
    return this.request(`/analytics?${params}`)
  }

  // Enrollments methods
  async getUserEnrollments(userId: string) {
    return this.request(`/enrollments?userId=${userId}`)
  }

  async updateProgress(enrollmentId: string, lessonId: string) {
    return this.request(`/enrollments/${enrollmentId}/progress`, {
      method: "POST",
      body: JSON.stringify({ lessonId }),
    })
  }

  // Notifications methods
  async getUserNotifications(userId: string) {
    return this.request(`/notifications?userId=${userId}`)
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: "POST",
    })
  }

  // Certificates methods
  async getUserCertificates(userId: string) {
    return this.request(`/certificates?userId=${userId}`)
  }
}

// Export singleton instance
export const apiClient = new APIClient()

// Export class for custom instances
export { APIClient }
