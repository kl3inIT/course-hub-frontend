import { DateRange } from 'react-day-picker'

export interface ExportOptions {
  category: { checked: boolean; rowCount: number }
  course: { checked: boolean; rowCount: number }
  student: { checked: boolean; rowCount: number }
  revenue: { checked: boolean; rowCount: number }
}

export type ExportFormat = 'excel' | 'csv' | 'pdf'

export interface AnalyticsExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface ExportData {
  category: any[]
  course: any[]
  student: any[]
  revenue: any[]
}

export interface ExportParams {
  startDate?: string
  endDate?: string
  range?: string
  page: number
  size: number
}

export interface DateRangeInfo {
  exportDateRange?: DateRange
  exportTimeRange: string
}
