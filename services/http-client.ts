import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// List of endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  // Auth endpoints
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/register/init',
  '/api/auth/register/re-send-otp',
  '/api/auth/forgot-password/send-otp',
  '/api/auth/forgot-password/reset-password',
  '/api/auth/forgot-password/verify-otp',
  '/api/auth/verify-email',
  '/api/auth/verify-email/resend-otp',
  '/api/auth/verify-email/verify-otp',
  '/api/auth/verify-email/reset-password',
  '/api/auth/verify-email/verify-email',
  '/api/auth/google-login-url',
  '/api/auth/logout',

  // Course endpoints
  '/api/courses/search',
  '/api/courses/featured',
  '/api/courses/categories',
  '/api/courses/search/advanced-search',
  '/api/courses/search/stats',

  // Category endpoints
  '/api/categories',
  '/api/categories/chart',
  '/api/categories/details',

  // Review endpoints
  '/api/reviews',
]

export const httpClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for authentication
httpClient.interceptors.request.use(
  config => {
    // Check if the current endpoint is in the public endpoints list
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
      config.url?.includes(endpoint)
    )

    // Set Content-Type header based on the request data type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'] // Let axios set the correct boundary for FormData
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    // Only add token if it's not a public endpoint
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
httpClient.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response?.status === 401 &&
      !error.config.url?.includes('/api/auth/logout')
    ) {
      // Handle unauthorized access, but ignore during logout
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      // Use router.push instead of window.location for smoother navigation
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
