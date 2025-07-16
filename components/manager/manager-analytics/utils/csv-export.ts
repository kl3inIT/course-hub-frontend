import { DateRange } from 'react-day-picker'
import { ExportData, ExportOptions } from '../types/export-types'
import {
  downloadFile,
  formatGrowthRate,
  getDateRangeText,
  sanitizeCSVText,
} from './export-utils'

export const exportToCSV = (
  exportData: ExportData,
  dateInfo: string,
  exportOptions: ExportOptions,
  exportDateRange?: DateRange,
  exportTimeRange?: string
): void => {
  let csvContent = ''

  const dateRangeText = getDateRangeText(exportDateRange, exportTimeRange)

  if (exportOptions.category.checked && exportData.category.length > 0) {
    csvContent += `CATEGORY PERFORMANCE ANALYSIS REPORT\n`
    csvContent += `Analytics report ${dateRangeText}\n\n`
    csvContent += `No.,Category Name,Description,Total Courses,Total Students,Total Revenue ($),Revenue Share (%)\n`

    exportData.category.forEach((cat: any, index: number) => {
      const row = [
        index + 1,
        sanitizeCSVText(cat.name || ''),
        sanitizeCSVText(cat.description || ''),
        cat.courseCount || 0,
        cat.totalStudents,
        cat.totalRevenue?.toLocaleString('en-US') + ' $',
        `${cat.revenueProportion.toFixed(2)}%`,
      ]
      csvContent += row.join(',') + '\n'
    })
    csvContent += '\n\n'
  }

  if (exportOptions.course.checked && exportData.course.length > 0) {
    csvContent += `COURSE PERFORMANCE ANALYSIS REPORT\n`
    csvContent += `Analytics report ${dateRangeText}\n\n`
    csvContent += `No.,Course Name,Total Students,Average Rating,Total Revenue ($),Revenue Share (%),Total Reviews,Course Level\n`

    exportData.course.forEach((course: any, index: number) => {
      const row = [
        index + 1,
        sanitizeCSVText(course.courseName || ''),
        course.students,
        course.rating?.toFixed(1) || '0.0',
        course.revenue?.toLocaleString('en-US') + ' $',
        `${course.revenuePercent?.toFixed(2)}%`,
        course.reviews,
        course.level || 'N/A',
      ]
      csvContent += row.join(',') + '\n'
    })
    csvContent += '\n\n'
  }

  if (exportOptions.student.checked && exportData.student.length > 0) {
    csvContent += `STUDENT ACTIVITY ANALYSIS REPORT\n`
    csvContent += `Analytics report ${dateRangeText}\n\n`
    csvContent += `No.,Course Name,New Students,Previously,Growth Rate (%),Total Reviews,Average Rating\n`

    exportData.student.forEach((data: any, index: number) => {
      const row = [
        index + 1,
        sanitizeCSVText(data.courseName || ''),
        data.newStudents,
        data.previousCompletion,
        formatGrowthRate(data.growth),
        data.reviews,
        data.avgRating,
      ]
      csvContent += row.join(',') + '\n'
    })
    csvContent += '\n\n'
  }

  if (exportOptions.revenue.checked && exportData.revenue.length > 0) {
    csvContent += `REVENUE TRENDS ANALYSIS REPORT\n`
    csvContent += `Analytics report ${dateRangeText}\n\n`
    csvContent += `No.,Course Name,Current Revenue ($),Previously ($),Growth Rate (%),Total Orders,New Students,Revenue Share (%)\n`

    exportData.revenue.forEach((data: any, index: number) => {
      const row = [
        index + 1,
        sanitizeCSVText(data.courseName || ''),
        data.revenue?.toLocaleString('en-US') + ' $',
        data.previousRevenue?.toLocaleString('en-US') + ' $',
        formatGrowthRate(data.growth),
        data.orders,
        data.newStudents,
        `${data.revenueShare}%`,
      ]
      csvContent += row.join(',') + '\n'
    })
  }

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const filename = `analytics-report-${dateInfo}-${new Date().toISOString().split('T')[0]}.csv`
  downloadFile(blob, filename, 'text/csv')
}
