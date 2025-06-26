import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// List of endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  // ========== AUTH ENDPOINTS (Public) ==========
  '/api/auth/login',
  '/api/auth/register/init',
  '/api/auth/register/verify',
  '/api/auth/register/re-send-otp',
  '/api/auth/forgot-password/send-otp',
  '/api/auth/forgot-password/verify-otp',
  '/api/auth/forgot-password/reset-password',
  '/api/auth/google-login-url',
  '/api/auth/google/callback',
  '/api/auth/logout', // Can be called without token

  // ========== COURSE ENDPOINTS (Public - Browse/Search) ==========
  '/api/courses/search',
  '/api/courses/featured',
  '/api/courses/search/advanced-search',
  '/api/courses/search/stats',
  '/api/courses/levels/levels',
  '/api/courses/status/statuses',
  // Individual course details are public for browsing
  { url: '/api/courses/', method: 'GET' }, // Matches /api/courses/{id}

  // ========== CATEGORY ENDPOINTS (Public) ==========
  '/api/categories',

  // ========== REVIEW ENDPOINTS (Public - Read Only) ==========
  { url: '/api/reviews', method: 'GET' },
  { url: '/api/reviews/', method: 'GET' }, // Matches /api/reviews/{id}
]

// All other endpoints require authentication, including:
// - User profile management (/api/users/*)
// - Course enrollment (/api/enrollments/*)
// - Payment processing (/api/payments/*)
// - Progress tracking (/api/progress/*)
// - Notifications (/api/notifications/*)
// - Comments (/api/comments/*)
// - Admin functions (/api/admin/*)
// - Analytics (/api/analytics/*)
// - Discount/Coupon management (/api/discounts/*)
// - Course creation/management (POST/PUT/DELETE to /api/courses/*)
// - Review creation/management (POST/PUT/DELETE to /api/reviews/*)

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
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => {
      if (typeof endpoint === 'string') {
        return config.url?.includes(endpoint)
      } else {
        // More precise matching for URL patterns with methods
        const urlMatches =
          config.url?.includes(endpoint.url) ||
          (endpoint.url.endsWith('/') && config.url?.startsWith(endpoint.url))
        const methodMatches = config.method?.toUpperCase() === endpoint.method
        return urlMatches && methodMatches
      }
    })

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

// Utility methods for common HTTP operations
export const api = {
  // GET request
  get: <T = any>(url: string, config?: any) => httpClient.get<T>(url, config),

  // POST request
  post: <T = any>(url: string, data?: any, config?: any) =>
    httpClient.post<T>(url, data, config),

  // PUT request
  put: <T = any>(url: string, data?: any, config?: any) =>
    httpClient.put<T>(url, data, config),

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: any) =>
    httpClient.patch<T>(url, data, config),

  // DELETE request
  delete: <T = any>(url: string, config?: any) =>
    httpClient.delete<T>(url, config),

  // Upload file
  upload: <T = any>(
    url: string,
    file: File | FormData,
    onProgress?: (progress: number) => void
  ) => {
    const formData = file instanceof FormData ? file : new FormData()
    if (file instanceof File) {
      formData.append('file', file)
    }

    return httpClient.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(progress)
        }
      },
    })
  },
}

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
