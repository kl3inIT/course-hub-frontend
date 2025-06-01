import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export interface Review {
  id: number
  userId: number
  userName: string
  userAvatar: string
  courseId: number
  courseName: string
  star: number
  comment: string
  createdDate: string
  modifiedDate: string
}

export const reviewService = {
  getTopReviews: async (): Promise<Review[]> => {
    try {
      const response = await axios.get(`${API_URL}/reviews`, {
        params: {
          size: 3,
          sortBy: "star",
          direction: "DESC"
        }
      })
      return response.data.data.content
    } catch (error) {
      console.error("Error fetching top reviews:", error)
      return []
    }
  },
  getReviews: async (page = 0, size = 5, sortBy = "modifiedDate", direction = "DESC") => {
    try {
      const response = await axios.get(`${API_URL}/reviews`, {
        params: {
          page,
          size,
          sortBy,
          direction
        }
      })
      return response.data.data
    } catch (error) {
      console.error("Error fetching reviews:", error)
      return { content: [], totalPages: 0, totalElements: 0 }
    }
  }
}