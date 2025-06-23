'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { analyticsApi } from '@/services/analytics-api'
import ExcelJS from 'exceljs'
import { Download, Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'react-hot-toast'

interface ExportOptions {
  category: { checked: boolean; rowCount: number }
  course: { checked: boolean; rowCount: number }
  student: { checked: boolean; rowCount: number }
  revenue: { checked: boolean; rowCount: number }
}

interface AnalyticsExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnalyticsExportDialog({ 
  open, 
  onOpenChange 
}: AnalyticsExportDialogProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    category: { checked: true, rowCount: 10 },
    course: { checked: true, rowCount: 10 },
    student: { checked: true, rowCount: 10 },
    revenue: { checked: true, rowCount: 10 },
  })
  const [exportDateRange, setExportDateRange] = useState<DateRange | undefined>()
  const [exportTimeRange, setExportTimeRange] = useState('6m')
  const [isExporting, setIsExporting] = useState(false)

  const handleCloseExportDialog = useCallback(() => {
    // Restore scroll position
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }

    onOpenChange(false)
  }, [onOpenChange])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // 1. Determine export parameters
      const exportParams: any = {}

      if (exportDateRange?.from && exportDateRange?.to) {
        // Use custom date range if provided
        exportParams.startDate = exportDateRange.from.toISOString().split('T')[0]
        exportParams.endDate = exportDateRange.to.toISOString().split('T')[0]
      } else {
        // Use time range
        exportParams.range = exportTimeRange
      }

      // Set size to get all data for export
      exportParams.page = 0
      exportParams.size = 1000

      console.log('Export params:', exportParams) // Debug

      // 2. Fetch fresh data from API for export
      const exportPromises = []

      if (exportOptions.category.checked) {
        exportPromises.push(
          analyticsApi.getCategoryAnalyticsDetails(exportParams)
        )
      }
      if (exportOptions.course.checked) {
        exportPromises.push(
          analyticsApi.getCourseAnalyticsDetails(exportParams)
        )
      }
      if (exportOptions.student.checked) {
        exportPromises.push(
          analyticsApi.getStudentAnalyticsDetails(exportParams)
        )
      }
      if (exportOptions.revenue.checked) {
        exportPromises.push(
          analyticsApi.getRevenueAnalyticsDetails(exportParams)
        )
      }

      const results = await Promise.all(exportPromises)

      // 3. Map results to export data
      let resultIndex = 0
      const freshExportData = {
        category: (exportOptions.category.checked
          ? exportOptions.category.rowCount === -1
            ? results[resultIndex++].data.content
            : results[resultIndex++].data.content.slice(
              0,
              exportOptions.category.rowCount
            )
          : []) as any[],
        course: (exportOptions.course.checked
          ? exportOptions.course.rowCount === -1
            ? results[resultIndex++].data.content
            : results[resultIndex++].data.content.slice(
              0,
              exportOptions.course.rowCount
            )
          : []) as any[],
        student: (exportOptions.student.checked
          ? exportOptions.student.rowCount === -1
            ? results[resultIndex++].data.content
            : results[resultIndex++].data.content.slice(
              0,
              exportOptions.student.rowCount
            )
          : []) as any[],
        revenue: (exportOptions.revenue.checked
          ? exportOptions.revenue.rowCount === -1
            ? results[resultIndex++].data.content
            : results[resultIndex++].data.content.slice(
              0,
              exportOptions.revenue.rowCount
            )
          : []) as any[],
      }

      console.log('Fresh export data:', freshExportData) // Debug

      // 4. Create Excel file with proper formatting
      const workbook = new ExcelJS.Workbook()
      
      // Determine date range for headers
      const dateRangeText = exportDateRange?.from && exportDateRange?.to
        ? `from ${exportDateRange.from.toLocaleDateString('en-US')} to ${exportDateRange.to.toLocaleDateString('en-US')}`
        : exportTimeRange === '7d' ? 'for the last 7 days'
        : exportTimeRange === '30d' ? 'for the last 30 days'
        : exportTimeRange === '90d' ? 'for the last 90 days'
        : exportTimeRange === '6m' ? 'for the last 6 months'
        : exportTimeRange === '1y' ? 'for the last year'
        : 'for selected period'

      if (exportOptions.category.checked) {
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
        freshExportData.category.forEach((cat: any, index: number) => {
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
        
        // Add signature section at the bottom
        const lastDataRow = freshExportData.category.length + 4
        const signatureRow = lastDataRow + 3
        
        categorySheet.mergeCells(`A${signatureRow}:D${signatureRow}`)
        categorySheet.getCell(`A${signatureRow}`).value = 'Analytics Management Team'
        categorySheet.getCell(`A${signatureRow}`).font = { bold: true, size: 12 }
        categorySheet.getCell(`A${signatureRow}`).alignment = { horizontal: 'left', vertical: 'middle' }
        
        categorySheet.mergeCells(`E${signatureRow}:G${signatureRow}`)
        categorySheet.getCell(`E${signatureRow}`).value = `Generated on: ${new Date().toLocaleDateString('en-US')}`
        categorySheet.getCell(`E${signatureRow}`).font = { italic: true, size: 10 }
        categorySheet.getCell(`E${signatureRow}`).alignment = { horizontal: 'right', vertical: 'middle' }
      }

      if (exportOptions.course.checked) {
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
        freshExportData.course.forEach((course: any, index: number) => {
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
        
        // Add signature section at the bottom
        const lastDataRow = freshExportData.course.length + 4
        const signatureRow = lastDataRow + 3
        
        courseSheet.mergeCells(`A${signatureRow}:D${signatureRow}`)
        courseSheet.getCell(`A${signatureRow}`).value = 'Analytics Management Team'
        courseSheet.getCell(`A${signatureRow}`).font = { bold: true, size: 12 }
        courseSheet.getCell(`A${signatureRow}`).alignment = { horizontal: 'left', vertical: 'middle' }
        
        courseSheet.mergeCells(`E${signatureRow}:H${signatureRow}`)
        courseSheet.getCell(`E${signatureRow}`).value = `Generated on: ${new Date().toLocaleDateString('en-US')}`
        courseSheet.getCell(`E${signatureRow}`).font = { italic: true, size: 10 }
        courseSheet.getCell(`E${signatureRow}`).alignment = { horizontal: 'right', vertical: 'middle' }
      }

      if (exportOptions.student.checked) {
        const studentSheet = workbook.addWorksheet('Student Activity Analysis')
        
        // Add title rows
        studentSheet.mergeCells('A1:G1')
        studentSheet.getCell('A1').value = `STUDENT ACTIVITY ANALYSIS REPORT`
        studentSheet.getCell('A1').font = { bold: true, size: 16 }
        studentSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
        
        studentSheet.mergeCells('A2:G2')
        studentSheet.getCell('A2').value = `Analytics report ${dateRangeText}`
        studentSheet.getCell('A2').font = { bold: false, size: 12, italic: true }
        studentSheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
        
        // Add empty row
        studentSheet.getRow(3).height = 10
        
        // Set up columns starting from row 4
        studentSheet.getRow(4).values = [
          'No.',
          'Course Name',
          'New Students',
          'Previously',
          'Growth Rate (%)',
          'Total Reviews',
          'Average Rating'
        ]
        
        // Style header row
        const headerRow = studentSheet.getRow(4)
        headerRow.font = { bold: true }
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
        headerRow.height = 25
        
        // Apply background color only to cells with data (A4:G4)
        for (let col = 1; col <= 7; col++) {
          const cell = headerRow.getCell(col)
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6F3FF' } }
        }
        
        // Set column widths
        studentSheet.columns = [
          { width: 8 },   // No.
          { width: 45 },  // Course Name
          { width: 15 },  // New Students
          { width: 15 },  // Previously
          { width: 20 },  // Growth Rate
          { width: 15 },  // Total Reviews
          { width: 16 },  // Average Rating
        ]
        
        // Add data rows
        freshExportData.student.forEach((data: any, index: number) => {
          const rowIndex = index + 5
          studentSheet.getRow(rowIndex).values = [
            index + 1,
            data.courseName,
            data.newStudents,
            data.previousCompletion,
            `${data.growth > 0 ? '+' : ''}${data.growth}%`,
            data.reviews,
            data.avgRating,
          ]
          
          // Style data rows
          const dataRow = studentSheet.getRow(rowIndex)
          dataRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
          dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true } // Course Name
          
          // Color code growth rate - Fixed color format
          const growthCell = dataRow.getCell(5)
          if (data.growth > 0) {
            growthCell.font = { color: { argb: '008000' }, bold: true } // Green
          } else if (data.growth < 0) {
            growthCell.font = { color: { argb: 'FF0000' }, bold: true } // Red
          }
          
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
        
        // Add signature section at the bottom
        const lastDataRow = freshExportData.student.length + 4
        const signatureRow = lastDataRow + 3
        
        studentSheet.mergeCells(`A${signatureRow}:D${signatureRow}`)
        studentSheet.getCell(`A${signatureRow}`).value = 'Analytics Management Team'
        studentSheet.getCell(`A${signatureRow}`).font = { bold: true, size: 12 }
        studentSheet.getCell(`A${signatureRow}`).alignment = { horizontal: 'left', vertical: 'middle' }
        
        studentSheet.mergeCells(`E${signatureRow}:G${signatureRow}`)
        studentSheet.getCell(`E${signatureRow}`).value = `Generated on: ${new Date().toLocaleDateString('en-US')}`
        studentSheet.getCell(`E${signatureRow}`).font = { italic: true, size: 10 }
        studentSheet.getCell(`E${signatureRow}`).alignment = { horizontal: 'right', vertical: 'middle' }
      }

      if (exportOptions.revenue.checked) {
        const revenueSheet = workbook.addWorksheet('Revenue Trends Analysis')
        
        // Add title rows
        revenueSheet.mergeCells('A1:H1')
        revenueSheet.getCell('A1').value = `REVENUE TRENDS ANALYSIS REPORT`
        revenueSheet.getCell('A1').font = { bold: true, size: 16 }
        revenueSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
        
        revenueSheet.mergeCells('A2:H2')
        revenueSheet.getCell('A2').value = `Analytics report ${dateRangeText}`
        revenueSheet.getCell('A2').font = { bold: false, size: 12, italic: true }
        revenueSheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
        
        // Add empty row
        revenueSheet.getRow(3).height = 10
        
        // Set up columns starting from row 4
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
        
        // Style header row
        const headerRow = revenueSheet.getRow(4)
        headerRow.font = { bold: true }
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
        headerRow.height = 25
        
        // Apply background color only to cells with data (A4:H4)
        for (let col = 1; col <= 8; col++) {
          const cell = headerRow.getCell(col)
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6F3FF' } }
        }
        
        // Set column widths
        revenueSheet.columns = [
          { width: 8 },   // No.
          { width: 45 },  // Course Name
          { width: 25 },  // Current Revenue
          { width: 20 },  // Previously
          { width: 20 },  // Growth Rate
          { width: 15 },  // Total Orders
          { width: 15 },  // New Students
          { width: 20 },  // Revenue Share
        ]
        
        // Add data rows
        freshExportData.revenue.forEach((data: any, index: number) => {
          const rowIndex = index + 5
          revenueSheet.getRow(rowIndex).values = [
            index + 1,
            data.courseName,
            data.revenue,
            data.previousRevenue,
            `${data.growth > 0 ? '+' : ''}${data.growth}%`,
            data.orders,
            data.newStudents,
            `${data.revenueShare}%`,
          ]
          
          // Style data rows
          const dataRow = revenueSheet.getRow(rowIndex)
          dataRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
          dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true } // Course Name
          
          // Color code growth rate - Fixed color format
          const growthCell = dataRow.getCell(5)
          if (data.growth > 0) {
            growthCell.font = { color: { argb: '008000' }, bold: true } // Green
          } else if (data.growth < 0) {
            growthCell.font = { color: { argb: 'FF0000' }, bold: true } // Red
          }
          
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
        
        // Add signature section at the bottom
        const lastDataRow = freshExportData.revenue.length + 4
        const signatureRow = lastDataRow + 3
        
        revenueSheet.mergeCells(`A${signatureRow}:D${signatureRow}`)
        revenueSheet.getCell(`A${signatureRow}`).value = 'Analytics Management Team'
        revenueSheet.getCell(`A${signatureRow}`).font = { bold: true, size: 12 }
        revenueSheet.getCell(`A${signatureRow}`).alignment = { horizontal: 'left', vertical: 'middle' }
        
        revenueSheet.mergeCells(`E${signatureRow}:H${signatureRow}`)
        revenueSheet.getCell(`E${signatureRow}`).value = `Generated on: ${new Date().toLocaleDateString('en-US')}`
        revenueSheet.getCell(`E${signatureRow}`).font = { italic: true, size: 10 }
        revenueSheet.getCell(`E${signatureRow}`).alignment = { horizontal: 'right', vertical: 'middle' }
      }

      // 5. Generate filename with date info
      const dateInfo = exportDateRange?.from && exportDateRange?.to
        ? `${exportDateRange.from.toLocaleDateString('en-GB').replace(/\//g, '-')}_to_${exportDateRange.to.toLocaleDateString('en-GB').replace(/\//g, '-')}`
        : exportTimeRange

      // 6. Export file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${dateInfo}-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Export completed successfully!')
      handleCloseExportDialog()
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Error exporting report. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          handleCloseExportDialog()
        }
      }}
      modal
    >
      <DialogContent
        key='export-dialog'
        className='sm:max-w-[600px] p-6 max-h-[90vh] overflow-y-auto'
      >
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-gray-800'>
            Export Analytics Report
          </DialogTitle>
          <p className='text-sm text-gray-600 mt-2'>
            Configure your export settings and download comprehensive
            analytics data
          </p>
        </DialogHeader>

        <div className='grid gap-6 py-4'>
          {/* Data Selection Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 border-b pb-2'>
              <div className='w-4 h-4 bg-blue-500 rounded-sm'></div>
              <span className='font-semibold text-lg text-gray-800'>
                Select Data to Export
              </span>
            </div>
            <div className='grid grid-cols-1 gap-3'>
              {Object.keys(exportOptions).map(key => (
                <div
                  key={key}
                  className='flex flex-col gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-gray-50/50'
                >
                  <div className='flex items-center space-x-3'>
                    <Checkbox
                      id={key}
                      checked={Boolean(
                        exportOptions[key as keyof typeof exportOptions]
                          .checked
                      )}
                      onCheckedChange={value =>
                        setExportOptions(prev => ({
                          ...prev,
                          [key]: {
                            ...prev[key as keyof typeof prev],
                            checked: value === true,
                          },
                        }))
                      }
                      className='w-5 h-5'
                    />
                    <label
                      htmlFor={key}
                      className='text-base font-medium flex-1 cursor-pointer text-gray-700'
                    >
                      {key === 'category' ? '📊 Categories Analytics' : ''}
                      {key === 'course' ? '📚 Course Performance' : ''}
                      {key === 'student' ? '👥 Student Activity' : ''}
                      {key === 'revenue' ? '💰 Revenue Trends' : ''}
                    </label>
                  </div>
                  {exportOptions[key as keyof typeof exportOptions]
                    .checked && (
                    <div className='ml-8 mt-2'>
                      <label className='block text-sm font-medium text-gray-600 mb-2'>
                        Number of records:
                      </label>
                      <select
                        value={exportOptions[
                          key as keyof typeof exportOptions
                          ].rowCount.toString()}
                        onChange={e =>
                          setExportOptions(prev => ({
                            ...prev,
                            [key]: {
                              ...prev[key as keyof typeof prev],
                              rowCount: Number(e.target.value),
                            },
                          }))
                        }
                        className='w-[200px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                      >
                        <option value='5'>First 5 records</option>
                        <option value='10'>First 10 records</option>
                        <option value='20'>First 20 records</option>
                        <option value='50'>First 50 records</option>
                        <option value='-1'>All records</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time Range Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 border-b pb-2'>
              <div className='w-4 h-4 bg-green-500 rounded-sm'></div>
              <span className='font-semibold text-lg text-gray-800'>
                Time Range
              </span>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Time Range Selector */}
              <div className='space-y-3'>
                <label className='block text-sm font-medium text-gray-700'>
                  Quick Select:
                </label>
                <select
                  value={exportTimeRange}
                  onChange={e => {
                    setExportTimeRange(e.target.value)
                    if (e.target.value !== 'custom') {
                      setExportDateRange(undefined) // Clear custom date when using quick select
                    }
                  }}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                >
                  <option value='7d'>Last 7 days</option>
                  <option value='30d'>Last 30 days</option>
                  <option value='90d'>Last 90 days</option>
                  <option value='6m'>Last 6 months</option>
                  <option value='1y'>Last year</option>
                  <option value='custom'>Custom Range</option>
                </select>
              </div>

              {/* Custom Date Range */}
              <div className='space-y-3'>
                <label className='block text-sm font-medium text-gray-700'>
                  Custom Date Range:
                </label>
                <DateRangePicker
                  value={exportDateRange}
                  onChange={(dateRange) => {
                    setExportDateRange(dateRange)
                    if (dateRange) {
                      setExportTimeRange('custom')
                    }
                  }}
                  className={exportTimeRange !== 'custom' ? 'opacity-50 pointer-events-none' : ''}
                />
              </div>
            </div>

            {/* Time Range Preview */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <div className='flex items-center gap-2 text-blue-800'>
                <svg
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <span className='text-sm font-medium'>Export Period:</span>
              </div>
              <p className='text-sm text-blue-700 mt-1'>
                {exportDateRange?.from && exportDateRange?.to
                  ? `${exportDateRange.from.toLocaleDateString('en-GB')} - ${exportDateRange.to.toLocaleDateString('en-GB')}`
                  : exportTimeRange === '7d'
                    ? 'Last 7 days'
                    : exportTimeRange === '30d'
                      ? 'Last 30 days'
                      : exportTimeRange === '90d'
                        ? 'Last 90 days'
                        : exportTimeRange === '6m'
                          ? 'Last 6 months'
                          : exportTimeRange === '1y'
                            ? 'Last year'
                            : 'Please select a time range'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className='mt-6 gap-3'>
          <Button
            variant='outline'
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              handleCloseExportDialog()
            }}
            className='px-6'
          >
            Cancel
          </Button>
          <Button
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              handleExport()
            }}
            disabled={
              isExporting ||
              !Object.values(exportOptions).some(o => o.checked)
            }
            className='px-6 bg-blue-600 hover:bg-blue-700'
          >
            {isExporting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Exporting...
              </>
            ) : (
              <>
                <Download className='mr-2 h-4 w-4' />
                Export Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 