'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
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
  ReportSeverity,
  ReportStatus,
  ReportType,
} from '@/types/report'
import { format } from 'date-fns'
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
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
}

const severityOptions: ReportSeverity[] = ['LOW', 'MEDIUM', 'HIGH']

function ReportTable({ type, status, filters }: ReportTableProps) {
  const router = useRouter()
  const [reports, setReports] = useState<AggregatedReportDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page,
        size: pageSize,
        sortBy,
        sortDir,
        type,
        status: status === 'ALL' ? undefined : status,
        severity: filters.severity,
        search: filters.search || undefined,
      }
      const response = await reportApi.getAggregatedReports(params)
      setReports(response.data.content)
      setTotalPages(response.data.totalPages)
      setTotalElements(response.data.totalElements)
    } catch (error) {
      setError('Failed to load reports. Please try again later.')
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, type, status, sortBy, sortDir, filters])

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

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-8'>
        <p className='text-sm text-destructive'>{error}</p>
        <Button onClick={() => loadReports()}>Try Again</Button>
      </div>
    )
  }

  if (!reports?.length) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 py-8'>
        <p className='text-sm text-muted-foreground'>No reports found</p>
      </div>
    )
  }

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
            {reports.map(report => (
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
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className='flex flex-col gap-4'>
          {/* Page size selector and info */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <span>
                Showing {page * pageSize + 1} to{' '}
                {Math.min((page + 1) * pageSize, totalElements)} of{' '}
                {totalElements} results
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Page size:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={value => setPageSize(parseInt(value))}
              >
                <SelectTrigger className='w-[80px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5</SelectItem>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pagination controls */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => page > 0 && setPage(p => p - 1)}
                  disabled={page === 0}
                  className='gap-1'
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous
                </Button>
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
                if (
                  i === 0 ||
                  i === totalPages - 1 ||
                  (i >= page - 1 && i <= page + 1)
                ) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setPage(i)}
                        isActive={page === i}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (i === page - 2 || i === page + 2) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              })}
              <PaginationItem>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => page < totalPages - 1 && setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                  className='gap-1'
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Management</CardTitle>
        <CardDescription>
          Manage and review reported content from the platform
        </CardDescription>
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

            {(filters.severity || filters.search) && (
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
                <ReportTable type='COMMENT' status='ALL' filters={filters} />
              </TabsContent>
              <TabsContent value='PENDING'>
                <ReportTable
                  type='COMMENT'
                  status='PENDING'
                  filters={filters}
                />
              </TabsContent>
              <TabsContent value='APPROVED'>
                <ReportTable
                  type='COMMENT'
                  status='APPROVED'
                  filters={filters}
                />
              </TabsContent>
              <TabsContent value='REJECTED'>
                <ReportTable
                  type='COMMENT'
                  status='REJECTED'
                  filters={filters}
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
                <ReportTable type='REVIEW' status='ALL' filters={filters} />
              </TabsContent>
              <TabsContent value='PENDING'>
                <ReportTable type='REVIEW' status='PENDING' filters={filters} />
              </TabsContent>
              <TabsContent value='APPROVED'>
                <ReportTable
                  type='REVIEW'
                  status='APPROVED'
                  filters={filters}
                />
              </TabsContent>
              <TabsContent value='REJECTED'>
                <ReportTable
                  type='REVIEW'
                  status='REJECTED'
                  filters={filters}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
