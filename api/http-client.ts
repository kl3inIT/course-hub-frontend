import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://3.105.176.236:8080/api"

// List of endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/courses',
  '/courses/search',
  '/categories',
  '/reviews',
  '/courses/featured'
]

export const httpClient = axios.create({
  baseURL: BASE_URL,
})

// Add request interceptor for authentication
httpClient.interceptors.request.use(
  (config) => {
    // Check if the current endpoint is in the public endpoints list
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
      config.url?.includes(endpoint)
    )

    // Set Content-Type header based on the request data type
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"] // Let axios set the correct boundary for FormData
    } else {
      config.headers["Content-Type"] = "application/json"
    }

    // Only add token if it's not a public endpoint
    if (!isPublicEndpoint) {
      const token = localStorage.getItem("accessToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("accessToken")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
) 