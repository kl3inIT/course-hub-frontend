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
import { PaymentHistoryRequestDTO } from '@/types/payment'
import { format } from 'date-fns'
import {
  ArrowUpDown,
  DollarSign,
  Download,
  Filter
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

interface Payment {
  id: number
  transactionCode: string
  courseName: string
  userName: string | null
  amount: number
  status: string
  date: string
}

type SortKey = keyof Payment
type SortConfig = {
  key: SortKey
  direction: 'asc' | 'desc'
} | null

interface PaymentOverallStats {
  totalAmount: string
  successfulPayments: string
  pendingPayments: string
  failedPayments: string
}

export function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [payments, setPayments] = useState<Payment[]>([])
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
  const [nameSearch, setNameSearch] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [overallStats, setOverallStats] = useState<PaymentOverallStats>({
    totalAmount: '0.0',
    successfulPayments: '0.0',
    pendingPayments: '0.0',
    failedPayments: '0.0'
  })
  const [pageSizePending, setPageSizePending] = useState(pageSize)

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

      // Gọi cả 2 API cùng lúc
      const [paymentsResponse, overallResponse] = await Promise.all([
        paymentApi.getPaymentHistory(params),
        paymentApi.getPaymentOverall(params)
      ])

      if (paymentsResponse.data) {
        setPayments(paymentsResponse.data.content)
        setTotalElements(paymentsResponse.data.totalElements)
        setTotalPages(paymentsResponse.data.totalPages)
      }

      if (overallResponse.data) {
        setOverallStats(overallResponse.data)
      }
    } catch (error) {
      toast.error('Failed to fetch payments')
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [currentPage, pageSize, appliedFilters])

  // Calculate total revenue
  const totalRevenue = payments
    .filter(payment => payment.status === 'Completed')
    .reduce((sum, payment) => sum + payment.amount, 0)

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      (payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      payment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionCode.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Calculate filtered total
  const filteredTotal = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  )

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

  const handleExport = () => {
    // Get filtered and sorted data
    const dataToExport = filteredPayments

    if (exportFormat === 'csv') {
      // Create CSV content
      const headers = [
        'ID',
        'Transaction Code',
        'Student',
        'Course',
        'Amount',
        'Status',
        'Date',
      ]
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(payment =>
          [
            payment.id,
            payment.transactionCode,
            payment.userName || 'N/A',
            payment.courseName,
            payment.amount,
            payment.status,
            payment.date,
          ].join(',')
        ),
      ].join('\\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `payment_report_${format(new Date(), 'yyyy-MM-dd')}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // For PDF export, you would typically use a library like jsPDF
      console.log('PDF export not implemented yet')
    }
    setShowExportDialog(false)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5 // Show max 5 page numbers

    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate start and end of visible page numbers
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if at the start or end
      if (currentPage <= 2) {
        end = 4
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...')
      }

      // Add visible page numbers
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const handleApplyFilters = () => {
    setAppliedFilters({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd'T'00:00:00") : undefined,
      endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd'T'23:59:59") : undefined,
      nameSearch: nameSearch.trim() !== '' ? nameSearch : undefined,
    })
    setPageSize(pageSizePending)
    setCurrentPage(1) // Reset to first page when applying new filters
  }

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true)
      const params: PaymentHistoryRequestDTO = {
        page: currentPage - 1,
        size: pageSize,
        status: appliedFilters.status,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        nameSearch: appliedFilters.nameSearch,
      }
  
      const blob = await paymentApi.exportToExcel(params)
  
      // Tạo URL từ blob
      const url = window.URL.createObjectURL(blob)
  
      // Tạo link tải xuống
      const link = document.createElement('a')
      link.href = url
      link.download = 'payment_report.xlsx'
      document.body.appendChild(link)
  
      // Trigger download
      link.click()
  
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
  
      toast.success('Export successful', {
        description: 'Your Excel file has been downloaded.'
      })
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('Export failed', {
        description: 'Failed to export payment data. Please try again.'
      })
    } finally {
      setIsExporting(false)
    }
  }
  
  

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Payment Management</h1>
          <p className='text-muted-foreground'>
            Manage and track all course payments
          </p>
        </div>
        <Button 
          className='gap-2' 
          onClick={handleExportToExcel}
          disabled={isExporting}
        >
          <Download className='h-4 w-4' />
          {isExporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${parseFloat(overallStats.totalAmount).toFixed(2)}</div>
            <p className='text-xs text-muted-foreground'>
              Total completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Successful Payments
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {parseInt(overallStats.successfulPayments)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Completed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Payments
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {parseInt(overallStats.pendingPayments)}
            </div>
            <p className='text-xs text-muted-foreground'>Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Failed Payments
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {parseInt(overallStats.failedPayments)}
            </div>
            <p className='text-xs text-muted-foreground'>Failed transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='w-full flex gap-4'>
        {/* Search */}
        <div className='flex-1'>
          <Input
            placeholder='Search by name, course, or transaction code...'
            value={nameSearch}
            onChange={e => setNameSearch(e.target.value)}
            className='w-full'
          />
        </div>
        {/* Pick range */}
        <div className='flex-1'>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className='w-full'
          />
        </div>
        {/* All status */}
        <div className='flex-1'>
          <Select
            value={statusFilter}
            onValueChange={(value: typeof statusFilter) =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className='w-full'>
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
        </div>
        {/* Page size */}
        <div className='flex-1'>
          <Select
            value={pageSizePending.toString()}
            onValueChange={value => setPageSizePending(Number(value))}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Rows per page' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='5'>5 per page</SelectItem>
              <SelectItem value='10'>10 per page</SelectItem>
              <SelectItem value='20'>20 per page</SelectItem>
              <SelectItem value='50'>50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Apply Filter button */}
        <div className='flex-1 flex items-end'>
          <Button onClick={handleApplyFilters} className='w-full bg-blue-600 hover:bg-blue-700'>Apply Filter</Button>
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View and manage all payment transactions
            </CardDescription>
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
                  onClick={() => handleSort('userName')}
                >
                  Email{' '}
                  {sortConfig?.key === 'userName' && (
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
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className='font-medium'>{payment.id}</TableCell>
                    <TableCell>{payment.transactionCode}</TableCell>
                    <TableCell>{payment.userName || 'N/A'}</TableCell>
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

          {/* Pagination */}
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
                    disabled={currentPage === 1}
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
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(prev => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
