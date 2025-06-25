/**
 * Utility functions for analytics operations
 */

/**
 * Formats a Date object to API-compatible date string (YYYY-MM-DD)
 * @param date - The Date object to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDateForAPI = (date: Date): string => {
  if (!date) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Formats a date string from API to display format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

/**
 * Parses time range string to get start and end dates
 * @param timeRange - Time range string (e.g., '7d', '30d', '90d', '6m', '1y')
 * @returns Object with start and end dates
 */
export const parseTimeRange = (timeRange: string): { startDate: Date; endDate: Date } => {
  const endDate = new Date()
  const startDate = new Date()

  switch (timeRange) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '6m':
      startDate.setMonth(endDate.getMonth() - 6)
      break
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
    default:
      startDate.setDate(endDate.getDate() - 30) // Default to 30 days
  }

  return { startDate, endDate }
}

/**
 * Calculates percentage growth between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Growth percentage
 */
export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Formats number to Vietnamese currency format
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

/**
 * Formats number with thousand separators
 * @param number - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('vi-VN').format(number)
} 