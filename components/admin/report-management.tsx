'use client'

import { reportApi } from '@/api/report-api'
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
import {
  ReportResponse,
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

interface ReportTableProps {
  type: ReportType
  filters: {
    severity: string | undefined
    status: string | undefined
    search: string
  }
}

const severityOptions: ReportSeverity[] = ['LOW', 'MEDIUM', 'HIGH']
const statusOptions: ReportStatus[] = ['PENDING', 'APPROVED', 'REJECTED']

function ReportTable({ type, filters }: ReportTableProps) {
  const router = useRouter()
  const [reports, setReports] = useState<ReportResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [sortBy, setSortBy] = useState('createdDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await reportApi.getReports({
        page,
        size: 10,
        sortBy,
        sortDir,
        type,
        severity: filters.severity,
        status: filters.status,
        search: filters.search || undefined,
      })
      setReports(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error loading reports:', error)
      setError('Failed to load reports. Please try again later.')
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [page, type, sortBy, sortDir, filters])

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

  if (!reports.length) {
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
              <TableHead>Report ID</TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('reason')}
                  className='flex items-center gap-1'
                >
                  Reason
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('severity')}
                  className='flex items-center gap-1'
                >
                  Severity
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('status')}
                  className='flex items-center gap-1'
                >
                  Status
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('createdDate')}
                  className='flex items-center gap-1'
                >
                  Timestamp
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map(report => (
              <TableRow key={report.reportId}>
                <TableCell className='font-mono'>{report.reportId}</TableCell>
                <TableCell className='max-w-[300px] truncate'>
                  {report.reason}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      report.severity === 'HIGH' ? 'destructive' : 'default'
                    }
                  >
                    {report.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      report.status === 'APPROVED'
                        ? 'outline'
                        : report.status === 'REJECTED'
                          ? 'destructive'
                          : 'outline'
                    }
                    className={cn(
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
                <TableCell>
                  {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      router.push(`/admin/reports/${report.reportId}`)
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
      )}
    </div>
  )
}

type FilterValue = 'ALL' | ReportSeverity | ReportStatus

export function ReportManagement() {
  const [filters, setFilters] = useState<{
    severity: FilterValue | undefined
    status: FilterValue | undefined
    search: string
  }>({
    severity: undefined,
    status: undefined,
    search: '',
  })

  const handleFilterChange = (
    key: 'severity' | 'status' | 'search',
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'ALL' ? undefined : value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      severity: undefined,
      status: undefined,
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
          <div className='flex flex-wrap items-center gap-4'>
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

            <Select
              value={filters.status || 'ALL'}
              onValueChange={value => handleFilterChange('status', value)}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder='Search reports...'
              value={filters.search || ''}
              onChange={e => handleFilterChange('search', e.target.value)}
              className='max-w-xs'
            />

            {(filters.severity || filters.status || filters.search) && (
              <Button variant='outline' onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Tabs for Comment and Review Reports */}
        <Tabs defaultValue='COMMENT' className='w-full'>
          <TabsList className='mb-4'>
            <TabsTrigger value='COMMENT'>Comment Reports</TabsTrigger>
            <TabsTrigger value='REVIEW'>Review Reports</TabsTrigger>
          </TabsList>
          <TabsContent value='COMMENT'>
            <ReportTable
              type='COMMENT'
              filters={{
                ...filters,
                severity:
                  filters.severity === 'ALL' ? undefined : filters.severity,
                status: filters.status === 'ALL' ? undefined : filters.status,
              }}
            />
          </TabsContent>
          <TabsContent value='REVIEW'>
            <ReportTable
              type='REVIEW'
              filters={{
                ...filters,
                severity:
                  filters.severity === 'ALL' ? undefined : filters.severity,
                status: filters.status === 'ALL' ? undefined : filters.status,
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
