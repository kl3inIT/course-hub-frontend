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
import { useAuth } from '@/context/auth-context'
import { analyticsApi } from '@/services/analytics-api'
import { Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'react-hot-toast'

// Import types
import {
  AnalyticsExportDialogProps,
  ExportData,
  ExportFormat,
  ExportOptions,
  ExportParams,
} from './types/export-types'

// Import constants
import {
  DEFAULT_EXPORT_OPTIONS,
  EXPORT_SETTINGS,
} from './constants/export-constants'

// Import utilities
import { exportToExcel } from './utils/excel-export'
import { generateDateInfo } from './utils/export-utils'
import { exportToPDF } from './utils/pdf-export'

export function AnalyticsExportDialog({
  open,
  onOpenChange,
}: AnalyticsExportDialogProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>(
    DEFAULT_EXPORT_OPTIONS
  )
  const [exportDateRange, setExportDateRange] = useState<
    DateRange | undefined
  >()
  const [exportTimeRange, setExportTimeRange] = useState(
    EXPORT_SETTINGS.DEFAULT_TIME_RANGE
  )
  const [exportFormat, setExportFormat] = useState<ExportFormat>(
    EXPORT_SETTINGS.DEFAULT_FORMAT
  )
  const [isExporting, setIsExporting] = useState(false)
  const { user } = useAuth()

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

  const fetchExportData = async (): Promise<ExportData> => {
    // 1. Determine export parameters
    const exportParams: ExportParams = {
      page: 0,
      size: EXPORT_SETTINGS.MAX_EXPORT_SIZE,
    }

    if (exportDateRange?.from && exportDateRange?.to) {
      exportParams.startDate = exportDateRange.from.toISOString().split('T')[0]
      exportParams.endDate = exportDateRange.to.toISOString().split('T')[0]
    } else {
      exportParams.range = exportTimeRange
    }

    // 2. Fetch fresh data from API for export
    const exportPromises = []

    if (exportOptions.category.checked) {
      exportPromises.push(
        analyticsApi.getCategoryAnalyticsDetails(exportParams)
      )
    }
    if (exportOptions.course.checked) {
      exportPromises.push(analyticsApi.getCourseAnalyticsDetails(exportParams))
    }
    if (exportOptions.student.checked) {
      exportPromises.push(analyticsApi.getStudentAnalyticsDetails(exportParams))
    }
    if (exportOptions.revenue.checked) {
      exportPromises.push(analyticsApi.getRevenueAnalyticsDetails(exportParams))
    }

    const results = await Promise.all(exportPromises)

    // 3. Map results to export data
    let resultIndex = 0
    const freshExportData: ExportData = {
      category: exportOptions.category.checked
        ? exportOptions.category.rowCount === -1
          ? results[resultIndex++].data.content
          : results[resultIndex++].data.content.slice(
              0,
              exportOptions.category.rowCount
            )
        : [],
      course: exportOptions.course.checked
        ? exportOptions.course.rowCount === -1
          ? results[resultIndex++].data.content
          : results[resultIndex++].data.content.slice(
              0,
              exportOptions.course.rowCount
            )
        : [],
      student: exportOptions.student.checked
        ? exportOptions.student.rowCount === -1
          ? results[resultIndex++].data.content
          : results[resultIndex++].data.content.slice(
              0,
              exportOptions.student.rowCount
            )
        : [],
      revenue: exportOptions.revenue.checked
        ? exportOptions.revenue.rowCount === -1
          ? results[resultIndex++].data.content
          : results[resultIndex++].data.content.slice(
              0,
              exportOptions.revenue.rowCount
            )
        : [],
    }

    return freshExportData
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const freshExportData = await fetchExportData()
      const dateInfo = generateDateInfo(exportDateRange, exportTimeRange)

      // Export based on selected format
      switch (exportFormat) {
        case 'excel':
          await exportToExcel(
            freshExportData,
            dateInfo,
            exportOptions,
            exportDateRange,
            exportTimeRange
          )
          break
        case 'pdf':
          exportToPDF(
            freshExportData,
            dateInfo,
            exportOptions,
            exportDateRange,
            exportTimeRange,
            user?.name || ''
          )
          break
        default:
          throw new Error('Invalid export format')
      }

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
      onOpenChange={open => {
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
            Configure your export settings and download comprehensive analytics
            data
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
                        exportOptions[key as keyof typeof exportOptions].checked
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
                  {exportOptions[key as keyof typeof exportOptions].checked && (
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

          {/* Export Format Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 border-b pb-2'>
              <div className='w-4 h-4 bg-purple-500 rounded-sm'></div>
              <span className='font-semibold text-lg text-gray-800'>
                Export Format
              </span>
            </div>
            <div className='space-y-3'>
              <label className='block text-sm font-medium text-gray-700'>
                Select format:
              </label>
              <select
                value={exportFormat}
                onChange={e => setExportFormat(e.target.value as ExportFormat)}
                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              >
                <option value='excel'>
                  Excel (.xlsx) - Advanced formatting
                </option>
                <option value='pdf'>PDF (.pdf) - Print-ready layout</option>
              </select>
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
                  onChange={dateRange => {
                    setExportDateRange(dateRange)
                    if (dateRange) {
                      setExportTimeRange('custom')
                    }
                  }}
                  className={
                    exportTimeRange !== 'custom'
                      ? 'opacity-50 pointer-events-none'
                      : ''
                  }
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
              isExporting || !Object.values(exportOptions).some(o => o.checked)
            }
            className='px-6 bg-blue-600 hover:bg-blue-700'
          >
            {isExporting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Exporting...
              </>
            ) : (
              `Export as ${exportFormat.toUpperCase()}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
