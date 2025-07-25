'use client'

import { Pagination } from '@/components/admin/user-management/user-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { reportApi } from '@/services/report-api'
import {
  AggregatedReportDTO,
  AggregatedReportPage,
  ReportSeverity,
  ReportStatus,
  ReportType,
} from '@/types/report'
import { format } from 'date-fns'
import { ArrowUpDown, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

// Safe date formatting function
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'MMM d, yyyy HH:mm')
  } catch (error) {
    return 'Invalid date'
  }
}

interface ReportTableProps {
  type: ReportType
  status: ReportStatus | 'ALL'
  filters: {
    severity: string | undefined
    search: string
  }
  dateRange: DateRange | undefined
}

const severityOptions: ReportSeverity[] = ['LOW', 'MEDIUM', 'HIGH']

function ReportTable({ type, status, filters, dateRange }: ReportTableProps) {
  const router = useRouter()
  const [reports, setReports] = useState<AggregatedReportDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page,
        size: pageSize,
        sortBy,
        sortDir,
        type,
        status: status === 'ALL' ? undefined : status,
        severity: filters.severity,
        search: filters.search || undefined,
      }
      if (dateRange?.from && dateRange?.to) {
        const start = new Date(dateRange.from)
        start.setHours(0, 0, 0, 0)
        const end = new Date(dateRange.to)
        end.setHours(23, 59, 59, 999)
        params.startDate = format(start, "yyyy-MM-dd'T'HH:mm:ss")
        params.endDate = format(end, "yyyy-MM-dd'T'HH:mm:ss")
      }
      // Gọi API với params là query string
      const response = await reportApi.getAggregatedReports(params)
      const data = response.data as AggregatedReportPage
      setReports(data.content)
      setTotalPages(data.page.totalPages)
      setTotalElements(data.page.totalElements)
      setPageSize(data.page.size)
      setPage(data.page.number)
    } catch (error) {
      setError('Failed to load reports. Please try again later.')
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, type, status, sortBy, sortDir, filters, dateRange])

  // Reset page to 0 when type or status changes
  useEffect(() => {
    setPage(0)
  }, [type, status])

  // Reset page to 0 when pageSize changes
  useEffect(() => {
    setPage(0)
  }, [pageSize])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
  }

  const hasData = reports.length > 0

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[200px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('resourceContent')}
                  className='flex items-center gap-1'
                >
                  Resource
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead className='w-[150px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('resourceOwner')}
                  className='flex items-center gap-1'
                >
                  Owner
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead className='w-[100px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('status')}
                  className='flex items-center gap-1'
                >
                  Status
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead className='w-[120px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('totalReports')}
                  className='flex items-center gap-1'
                >
                  Total Reports
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead className='w-[80px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('hidden')}
                  className='flex items-center gap-1'
                >
                  Hidden
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead className='w-[120px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('createdAt')}
                  className='flex items-center gap-1'
                >
                  Created At
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead className='w-[80px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center py-8 text-muted-foreground'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center py-8 text-destructive'
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : !hasData ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center py-8 text-muted-foreground'
                >
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map(report => (
                <TableRow key={report.resourceId}>
                  <TableCell className='max-w-[200px]'>
                    <div className='truncate' title={report.resourceContent}>
                      {report.resourceContent}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[150px]'>
                    <div className='flex items-center gap-2'>
                      <img
                        src={report.resourceOwnerAvatar}
                        alt={report.resourceOwner}
                        className='w-6 h-6 rounded-full border flex-shrink-0'
                      />
                      <div className='min-w-0'>
                        <div
                          className='font-medium truncate'
                          title={report.resourceOwner}
                        >
                          {report.resourceOwner}
                        </div>
                        <div className='text-xs text-muted-foreground truncate'>
                          {report.resourceOwnerStatus}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[100px]'>
                    <Badge
                      variant={
                        report.status === 'APPROVED'
                          ? 'outline'
                          : report.status === 'REJECTED'
                            ? 'destructive'
                            : 'outline'
                      }
                      className={cn(
                        'text-xs',
                        report.status === 'APPROVED'
                          ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                          : report.status === 'PENDING'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                            : 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100'
                      )}
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-[120px] text-center'>
                    {report.reports.length}
                  </TableCell>
                  <TableCell className='max-w-[80px]'>
                    {report.hidden ? (
                      <Badge className='bg-red-100 text-red-800 border-red-200 text-xs'>
                        Hidden
                      </Badge>
                    ) : (
                      <Badge className='bg-green-100 text-green-800 border-green-200 text-xs'>
                        Visible
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='max-w-[120px]'>
                    <div className='text-xs'>
                      {formatDate(report.createdAt.toString())}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[80px]'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        router.push(`/admin/reports/${report.resourceId}`)
                      }
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Chỉ render Pagination khi có nhiều hơn 1 trang */}
      {hasData && totalPages > 1 && (
        <Pagination
          pagination={{
            currentPage: page,
            totalPages,
            totalElements,
            pageSize,
          }}
          activeTab={'report'}
          onPageChange={setPage}
          onPageSizeChange={size => {
            setPageSize(size)
            setPage(0)
          }}
        />
      )}
    </div>
  )
}

type FilterValue = 'ALL' | ReportSeverity

export function ReportManagement() {
  const [filters, setFilters] = useState<{
    severity: FilterValue | undefined
    search: string
  }>({
    severity: undefined,
    search: '',
  })

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Set default date range to 7 days ago to today
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from')
    const to = params.get('to')
    if (from && to) {
      setDateRange({ from: new Date(from), to: new Date(to) })
    } else {
      const today = new Date()
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(today.getDate() - 6)
      setDateRange({ from: sevenDaysAgo, to: today })
    }
  }, [])

  const handleFilterChange = (key: 'severity' | 'search', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'ALL' ? undefined : value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      severity: undefined,
      search: '',
    })
    setDateRange(undefined)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Overview</CardTitle>
        <CardDescription>Overview of all reports in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='mb-6 flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-4'>
            <Select
              value={filters.severity || 'ALL'}
              onValueChange={value => handleFilterChange('severity', value)}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by Severity' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Severities</SelectItem>
                {severityOptions.map(severity => (
                  <SelectItem key={severity} value={severity}>
                    {severity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder='Search reports...'
              value={filters.search || ''}
              onChange={e => handleFilterChange('search', e.target.value)}
              className='w-[300px]'
            />

            {/* Date Range Filter */}
            <DateRangePicker value={dateRange} onChange={setDateRange} />

            {(filters.severity ||
              filters.search ||
              dateRange?.from ||
              dateRange?.to) && (
              <Button variant='outline' onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Tabs for Comment and Review Reports with Status sub-tabs */}
        <Tabs defaultValue='COMMENT' className='w-full'>
          <TabsList className='mb-4'>
            <TabsTrigger value='COMMENT'>Comment Reports</TabsTrigger>
            <TabsTrigger value='REVIEW'>Review Reports</TabsTrigger>
          </TabsList>

          <TabsContent value='COMMENT'>
            <Tabs defaultValue='ALL' className='w-full'>
              <TabsList className='mb-4'>
                <TabsTrigger value='ALL'>All</TabsTrigger>
                <TabsTrigger value='PENDING'>Pending</TabsTrigger>
                <TabsTrigger value='APPROVED'>Approved</TabsTrigger>
                <TabsTrigger value='REJECTED'>Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value='ALL'>
                <ReportTable
                  type='COMMENT'
                  status='ALL'
                  filters={filters}
                  dateRange={dateRange}
                />
              </TabsContent>
              <TabsContent value='PENDING'>
                <ReportTable
                  type='COMMENT'
                  status='PENDING'
                  filters={filters}
                  dateRange={dateRange}
                />
              </TabsContent>
              <TabsContent value='APPROVED'>
                <ReportTable
                  type='COMMENT'
                  status='APPROVED'
                  filters={filters}
                  dateRange={dateRange}
                />
              </TabsContent>
              <TabsContent value='REJECTED'>
                <ReportTable
                  type='COMMENT'
                  status='REJECTED'
                  filters={filters}
                  dateRange={dateRange}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value='REVIEW'>
            <Tabs defaultValue='ALL' className='w-full'>
              <TabsList className='mb-4'>
                <TabsTrigger value='ALL'>All</TabsTrigger>
                <TabsTrigger value='PENDING'>Pending</TabsTrigger>
                <TabsTrigger value='APPROVED'>Approved</TabsTrigger>
                <TabsTrigger value='REJECTED'>Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value='ALL'>
                <ReportTable
                  type='REVIEW'
                  status='ALL'
                  filters={filters}
                  dateRange={dateRange}
                />
              </TabsContent>
              <TabsContent value='PENDING'>
                <ReportTable
                  type='REVIEW'
                  status='PENDING'
                  filters={filters}
                  dateRange={dateRange}
                />
              </TabsContent>
              <TabsContent value='APPROVED'>
                <ReportTable
                  type='REVIEW'
                  status='APPROVED'
                  filters={filters}
                  dateRange={dateRange}
                />
              </TabsContent>
              <TabsContent value='REJECTED'>
                <ReportTable
                  type='REVIEW'
                  status='REJECTED'
                  filters={filters}
                  dateRange={dateRange}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
