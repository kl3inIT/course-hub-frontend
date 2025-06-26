import ExcelJS from 'exceljs'
import { DateRange } from 'react-day-picker'
import { ExportData, ExportOptions } from '../types/export-types'
import { downloadFile, getDateRangeText } from './export-utils'

export const exportToExcel = async (
  exportData: ExportData,
  dateInfo: string,
  exportOptions: ExportOptions,
  exportDateRange?: DateRange,
  exportTimeRange?: string
): Promise<void> => {
  const workbook = new ExcelJS.Workbook()
  const dateRangeText = getDateRangeText(exportDateRange, exportTimeRange)

  if (exportOptions.category.checked) {
    await addCategorySheet(workbook, exportData.category, dateRangeText)
  }

  if (exportOptions.course.checked) {
    await addCourseSheet(workbook, exportData.course, dateRangeText)
  }

  if (exportOptions.student.checked) {
    await addStudentSheet(workbook, exportData.student, dateRangeText)
  }

  if (exportOptions.revenue.checked) {
    await addRevenueSheet(workbook, exportData.revenue, dateRangeText)
  }

  // Export file
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const filename = `analytics-report-${dateInfo}-${new Date().toISOString().split('T')[0]}.xlsx`
  downloadFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

const addCategorySheet = async (
  workbook: ExcelJS.Workbook,
  categoryData: any[],
  dateRangeText: string
): Promise<void> => {
  const categorySheet = workbook.addWorksheet('Category Analysis')
  
  // Add title rows
  categorySheet.mergeCells('A1:G1')
  categorySheet.getCell('A1').value = `CATEGORY PERFORMANCE ANALYSIS REPORT`
  categorySheet.getCell('A1').font = { bold: true, size: 16 }
  categorySheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
  
  categorySheet.mergeCells('A2:G2')
  categorySheet.getCell('A2').value = `Analytics report ${dateRangeText}`
  categorySheet.getCell('A2').font = { bold: false, size: 12, italic: true }
  categorySheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
  
  // Add empty row
  categorySheet.getRow(3).height = 10
  
  // Set up columns starting from row 4
  categorySheet.getRow(4).values = [
    'No.',
    'Category Name',
    'Description',
    'Total Courses',
    'Total Students',
    'Total Revenue (VND)',
    'Revenue Share (%)'
  ]
  
  // Style header row
  const headerRow = categorySheet.getRow(4)
  headerRow.font = { bold: true }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.height = 25
  
  // Apply background color only to cells with data (A4:G4)
  for (let col = 1; col <= 7; col++) {
    const cell = headerRow.getCell(col)
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6F3FF' } }
  }
  
  // Set column widths
  categorySheet.columns = [
    { width: 8 },   // No.
    { width: 35 },  // Category Name
    { width: 50 },  // Description
    { width: 18 },  // Total Courses
    { width: 18 },  // Total Students
    { width: 25 },  // Total Revenue
    { width: 20 },  // Revenue Share
  ]
  
  // Add data rows
  categoryData.forEach((cat: any, index: number) => {
    const rowIndex = index + 5
    categorySheet.getRow(rowIndex).values = [
      index + 1,
      cat.name,
      cat.description,
      cat.courseCount || 0,
      cat.totalStudents,
      cat.totalRevenue,
      `${cat.revenueProportion.toFixed(2)}%`,
    ]
    
    // Style data rows
    const dataRow = categorySheet.getRow(rowIndex)
    dataRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true } // Category Name
    dataRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true } // Description
    
    // Add borders to data cells only (specific number of columns)
    for (let col = 1; col <= 7; col++) {
      const cell = dataRow.getCell(col)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
  })
  
  // Add borders to header cells with data only
  for (let col = 1; col <= 7; col++) {
    const cell = headerRow.getCell(col)
    cell.border = {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  }
}

const addCourseSheet = async (
  workbook: ExcelJS.Workbook,
  courseData: any[],
  dateRangeText: string
): Promise<void> => {
  const courseSheet = workbook.addWorksheet('Course Analysis')
  
  // Add title rows
  courseSheet.mergeCells('A1:H1')
  courseSheet.getCell('A1').value = `COURSE PERFORMANCE ANALYSIS REPORT`
  courseSheet.getCell('A1').font = { bold: true, size: 16 }
  courseSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
  
  courseSheet.mergeCells('A2:H2')
  courseSheet.getCell('A2').value = `Analytics report ${dateRangeText}`
  courseSheet.getCell('A2').font = { bold: false, size: 12, italic: true }
  courseSheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
  
  // Add empty row
  courseSheet.getRow(3).height = 10
  
  // Set up columns starting from row 4
  courseSheet.getRow(4).values = [
    'No.',
    'Course Name',
    'Total Students',
    'Average Rating',
    'Total Revenue (VND)',
    'Revenue Share (%)',
    'Total Reviews',
    'Course Level'
  ]
  
  // Style header row
  const headerRow = courseSheet.getRow(4)
  headerRow.font = { bold: true }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.height = 25
  
  // Apply background color only to cells with data (A4:H4)
  for (let col = 1; col <= 8; col++) {
    const cell = headerRow.getCell(col)
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6F3FF' } }
  }
  
  // Set column widths
  courseSheet.columns = [
    { width: 8 },   // No.
    { width: 45 },  // Course Name
    { width: 15 },  // Total Students
    { width: 15 },  // Average Rating
    { width: 25 },  // Total Revenue
    { width: 20 },  // Revenue Share
    { width: 15 },  // Total Reviews
    { width: 15 },  // Course Level
  ]
  
  // Add data rows
  courseData.forEach((course: any, index: number) => {
    const rowIndex = index + 5
    courseSheet.getRow(rowIndex).values = [
      index + 1,
      course.courseName,
      course.students,
      course.rating?.toFixed(1) || '0.0',
      course.revenue,
      `${course.revenuePercent?.toFixed(2)}%`,
      course.reviews,
      course.level || 'N/A',
    ]
    
    // Style data rows
    const dataRow = courseSheet.getRow(rowIndex)
    dataRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true } // Course Name
    
    // Add borders to data cells only (specific number of columns)
    for (let col = 1; col <= 8; col++) {
      const cell = dataRow.getCell(col)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
  })
  
  // Add borders to header cells with data only
  for (let col = 1; col <= 8; col++) {
    const cell = headerRow.getCell(col)
    cell.border = {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  }
}

const addStudentSheet = async (
  workbook: ExcelJS.Workbook,
  studentData: any[],
  dateRangeText: string
): Promise<void> => {
  const studentSheet = workbook.addWorksheet('Student Activity Analysis')

  studentSheet.mergeCells('A1:G1')
  studentSheet.getCell('A1').value = `STUDENT ACTIVITY ANALYSIS REPORT`
  studentSheet.getCell('A1').font = { bold: true, size: 16 }
  studentSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }

  studentSheet.mergeCells('A2:G2')
  studentSheet.getCell('A2').value = `Analytics report ${dateRangeText}`
  studentSheet.getCell('A2').font = { italic: true, size: 12 }
  studentSheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }

  studentSheet.getRow(3).height = 10

  studentSheet.getRow(4).values = [
    'No.',
    'Course Name',
    'New Students',
    'Previously',
    'Growth Rate (%)',
    'Total Reviews',
    'Average Rating'
  ]
  const headerRow = studentSheet.getRow(4)
  headerRow.font = { bold: true }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.height = 25
  for (let col = 1; col <= 7; col++) {
    const cell = headerRow.getCell(col)
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6F3FF' } }
    cell.border = {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  }
  studentSheet.columns = [
    { width: 8 },
    { width: 35 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 }
  ]
  studentData.forEach((data: any, index: number) => {
    const rowIndex = index + 5
    studentSheet.getRow(rowIndex).values = [
      index + 1,
      data.courseName,
      data.newStudents,
      data.previousCompletion,
      data.growth,
      data.reviews,
      data.avgRating
    ]
    const dataRow = studentSheet.getRow(rowIndex)
    dataRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
    for (let col = 1; col <= 7; col++) {
      const cell = dataRow.getCell(col)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
  })
}

const addRevenueSheet = async (
  workbook: ExcelJS.Workbook,
  revenueData: any[],
  dateRangeText: string
): Promise<void> => {
  const revenueSheet = workbook.addWorksheet('Revenue Trends Analysis')

  revenueSheet.mergeCells('A1:H1')
  revenueSheet.getCell('A1').value = `REVENUE TRENDS ANALYSIS REPORT`
  revenueSheet.getCell('A1').font = { bold: true, size: 16 }
  revenueSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }

  revenueSheet.mergeCells('A2:H2')
  revenueSheet.getCell('A2').value = `Analytics report ${dateRangeText}`
  revenueSheet.getCell('A2').font = { italic: true, size: 12 }
  revenueSheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }

  revenueSheet.getRow(3).height = 10

  revenueSheet.getRow(4).values = [
    'No.',
    'Course Name',
    'Current Revenue (VND)',
    'Previously (VND)',
    'Growth Rate (%)',
    'Total Orders',
    'New Students',
    'Revenue Share (%)'
  ]
  const headerRow = revenueSheet.getRow(4)
  headerRow.font = { bold: true }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.height = 25
  for (let col = 1; col <= 8; col++) {
    const cell = headerRow.getCell(col)
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6F3FF' } }
    cell.border = {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  }
  revenueSheet.columns = [
    { width: 8 },
    { width: 35 },
    { width: 25 },
    { width: 25 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 }
  ]
  revenueData.forEach((data: any, index: number) => {
    const rowIndex = index + 5
    revenueSheet.getRow(rowIndex).values = [
      index + 1,
      data.courseName,
      data.revenue,
      data.previousRevenue,
      data.growth,
      data.orders,
      data.newStudents,
      data.revenueShare
    ]
    const dataRow = revenueSheet.getRow(rowIndex)
    dataRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
    for (let col = 1; col <= 8; col++) {
      const cell = dataRow.getCell(col)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
  })
} 