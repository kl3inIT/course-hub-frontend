import { DateRange } from 'react-day-picker'
import { TIME_RANGES } from '../constants/export-constants'

export const getDateRangeText = (
  exportDateRange?: DateRange,
  exportTimeRange?: string
): string => {
  if (exportDateRange?.from && exportDateRange?.to) {
    return `from ${exportDateRange.from.toLocaleDateString('en-US')} to ${exportDateRange.to.toLocaleDateString('en-US')}`
  }
  
  if (exportTimeRange && exportTimeRange in TIME_RANGES) {
    return TIME_RANGES[exportTimeRange as keyof typeof TIME_RANGES]
  }
  
  return 'for selected period'
}

export const generateDateInfo = (
  exportDateRange?: DateRange,
  exportTimeRange?: string
): string => {
  if (exportDateRange?.from && exportDateRange?.to) {
    return `${exportDateRange.from.toLocaleDateString('en-GB').replace(/\//g, '-')}_to_${exportDateRange.to.toLocaleDateString('en-GB').replace(/\//g, '-')}`
  }
  return exportTimeRange || '6m'
}

export const formatCurrencyVN = (amount: number): string => {
  return amount?.toLocaleString('en-US') + ' VND'
}

export const downloadFile = (
  blob: Blob,
  filename: string,
  mimeType: string
): void => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export const sanitizeCSVText = (text: string): string => {
  return `"${(text || '').replace(/"/g, '""')}"`
}

export const formatGrowthRate = (growth: number): string => {
  return `${growth > 0 ? '+' : ''}${growth}%`
} 