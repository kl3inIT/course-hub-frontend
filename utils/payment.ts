// Prefix for payment status keys in localStorage
const PAYMENT_STATUS_PREFIX = 'payment_status_'

export const paymentStorage = {
  // Set payment status for a transaction
  setStatus: (transactionCode: string, status: 'success' | 'expired' | 'pending') => {
    localStorage.setItem(`${PAYMENT_STATUS_PREFIX}${transactionCode}`, status)
  },

  // Get payment status for a transaction
  getStatus: (transactionCode: string) => {
    return localStorage.getItem(`${PAYMENT_STATUS_PREFIX}${transactionCode}`)
  },

  // Remove payment status for a transaction
  removeStatus: (transactionCode: string) => {
    localStorage.removeItem(`${PAYMENT_STATUS_PREFIX}${transactionCode}`)
  },

  // Clear all payment statuses from localStorage
  clearAllPaymentStatus: () => {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(PAYMENT_STATUS_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }
} 