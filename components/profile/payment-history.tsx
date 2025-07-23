'use client'

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
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
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
import { paymentApi } from '@/services/payment-api'
import { PaymentHistoryRequestDTO, PaymentHistoryResponseDTO } from '@/types/payment'
import { format } from 'date-fns'
import { ArrowUpDown, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

type SortKey = keyof PaymentHistoryResponseDTO
type SortConfig = {
  key: SortKey
  direction: 'asc' | 'desc'
} | null

export function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | string>('Completed')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 6)
    return { from: start, to: end }
  })
  // Đánh dấu đã khởi tạo filter mặc định
  const [initialized, setInitialized] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [payments, setPayments] = useState<PaymentHistoryResponseDTO[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<{
    status: string | undefined;
    startDate: string | undefined;
    endDate: string | undefined;
    nameSearch: string | undefined;
  }>({
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    nameSearch: undefined
  })

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params: PaymentHistoryRequestDTO = {
        page: currentPage - 1,
        size: pageSize,
        status: appliedFilters.status,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        nameSearch: appliedFilters.nameSearch,
      }

      const response = await paymentApi.getMyPaymentHistory(params)

      if (response.data) {
        setPayments(response.data.content)
        setTotalElements(response.data.page?.totalElements || 0)
        setTotalPages(response.data.page?.totalPages || 0)
      }
    } catch (error) {
      toast.error('Failed to fetch payment history')
      console.error('Error fetching payment history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialized) return
    fetchPayments()
  }, [currentPage, pageSize, appliedFilters, initialized])

  // Fetch với filter mặc định khi mount
  useEffect(() => {
    setStatusFilter('Completed')
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 6)
    setDateRange({ from: start, to: end })
    setAppliedFilters({
      status: 'Completed',
      startDate: start.toISOString().split('T')[0] + 'T00:00:00',
      endDate: end.toISOString().split('T')[0] + 'T23:59:59',
      nameSearch: undefined
    })
    setCurrentPage(1)
    setInitialized(true)
    // fetchPayments sẽ chạy khi initialized=true và appliedFilters đã set
  }, [])

  const handleSort = (key: SortKey) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApplyFilters = () => {
    setAppliedFilters({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd'T'00:00:00") : undefined,
      endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd'T'23:59:59") : undefined,
      nameSearch: searchTerm.trim() !== '' ? searchTerm : undefined,
    })
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 2) {
        end = 4
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3
      }

      if (start > 2) {
        pages.push('...')
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages - 1) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Payment History</h1>
          <p className='text-muted-foreground'>
            View your payment transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col md:flex-row md:items-end gap-4'>
        <div className='flex-1'>
          <Input
            placeholder='Search by course name or transaction code...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full'
          />
        </div>
        <div className='flex gap-2'>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className='w-[300px]'
          />
          <Select
            value={statusFilter}
            onValueChange={(value: typeof statusFilter) =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className='w-[180px]'>
              <Filter className='mr-2 h-4 w-4' />
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='Completed'>Completed</SelectItem>
              <SelectItem value='Pending'>Pending</SelectItem>
              <SelectItem value='Failed'>Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleApplyFilters} className='md:w-auto w-full'>Apply Filter</Button>
        </div>
      </div>

      {/* Payments Table */}
    <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View your payment transactions
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Select
              value={pageSize.toString()}
              onValueChange={value => {
                setPageSize(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className='w-[120px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='5'>5 per page</SelectItem>
                <SelectItem value='10'>10 per page</SelectItem>
                <SelectItem value='20'>20 per page</SelectItem>
                <SelectItem value='50'>50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead
                  className='w-[100px] cursor-pointer'
                  onClick={() => handleSort('id')}
                >
                  ID{' '}
                  {sortConfig?.key === 'id' && (
                    <ArrowUpDown className='ml-2 h-4 w-4 inline' />
                  )}
                </TableHead>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('transactionCode')}
                >
                  Transaction Code{' '}
                  {sortConfig?.key === 'transactionCode' && (
                    <ArrowUpDown className='ml-2 h-4 w-4 inline' />
                  )}
                </TableHead>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('courseName')}
                >
                  Course{' '}
                  {sortConfig?.key === 'courseName' && (
                    <ArrowUpDown className='ml-2 h-4 w-4 inline' />
                  )}
                </TableHead>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('amount')}
                >
                  Amount{' '}
                  {sortConfig?.key === 'amount' && (
                    <ArrowUpDown className='ml-2 h-4 w-4 inline' />
                  )}
                </TableHead>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('status')}
                >
                  Status{' '}
                  {sortConfig?.key === 'status' && (
                    <ArrowUpDown className='ml-2 h-4 w-4 inline' />
                  )}
                </TableHead>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('date')}
                >
                  Date{' '}
                  {sortConfig?.key === 'date' && (
                    <ArrowUpDown className='ml-2 h-4 w-4 inline' />
                  )}
                </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className='font-medium'>{payment.id}</TableCell>
                    <TableCell>{payment.transactionCode}</TableCell>
                    <TableCell>{payment.courseName}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}
                      >
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>

          {/* Pagination - Chỉ hiển thị khi có dữ liệu */}
          {totalElements > 0 && (
            <div className='mt-4 flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalElements)} of{' '}
                {totalElements} entries
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(prev => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1 || loading || totalElements === 0}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === '...' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => setCurrentPage(page as number)}
                          isActive={currentPage === page}
                          disabled={loading}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))
                      }
                      disabled={currentPage === totalPages || loading || totalElements === 0}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
      </CardContent>
    </Card>
    </div>
  )
}