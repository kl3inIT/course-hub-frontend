'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import {
  DollarSign,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Calendar,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { cn } from '@/lib/utils'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface Payment {
  id: string
  studentName: string
  courseName: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  date: string
  paymentMethod: string
}

type SortKey = keyof Payment
type SortConfig = {
  key: SortKey
  direction: 'asc' | 'desc'
} | null

// Sample payment data - replace with actual API data
const paymentData: Payment[] = [
  {
    id: 'PAY-001',
    studentName: 'John Doe',
    courseName: 'React Fundamentals',
    amount: 99.99,
    status: 'completed',
    date: '2024-03-15',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'PAY-002',
    studentName: 'Jane Smith',
    courseName: 'Advanced JavaScript',
    amount: 149.99,
    status: 'completed',
    date: '2024-03-14',
    paymentMethod: 'PayPal',
  },
  {
    id: 'PAY-003',
    studentName: 'Mike Johnson',
    courseName: 'Node.js Backend',
    amount: 199.99,
    status: 'pending',
    date: '2024-03-13',
    paymentMethod: 'Bank Transfer',
  },
  // Add more sample data as needed
]

// Helper function to format date
const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

// Helper function to check if a date is within a range
const isWithinRange = (date: string, range: DateRange | undefined) => {
  if (!range?.from || !range?.to) return true
  const paymentDate = new Date(date)
  return paymentDate >= range.from && paymentDate <= range.to
}

export function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Payment['status']>(
    'all'
  )
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Calculate total revenue
  const totalRevenue = paymentData
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0)

  // Filter payments based on search term, status, and date range
  const filteredPayments = paymentData.filter(payment => {
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter
    const matchesDateRange = isWithinRange(payment.date, dateRange)

    return matchesSearch && matchesStatus && matchesDateRange
  })

  // Calculate filtered total
  const filteredTotal = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  )

  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

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

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
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
    const dataToExport = sortedPayments

    if (exportFormat === 'csv') {
      // Create CSV content
      const headers = [
        'ID',
        'Student',
        'Course',
        'Amount',
        'Status',
        'Date',
        'Payment Method',
      ]
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(payment =>
          [
            payment.id,
            payment.studentName,
            payment.courseName,
            payment.amount,
            payment.status,
            payment.date,
            payment.paymentMethod,
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
      // This is a placeholder for PDF export functionality
      console.log('PDF export not implemented yet')
    }
    setShowExportDialog(false)
  }

  // Pagination calculations
  const totalItems = filteredPayments.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentItems = sortedPayments.slice(startIndex, endIndex)

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
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Download className='h-4 w-4' />
              Export Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Payment Report</DialogTitle>
              <DialogDescription>
                Choose your export format and options
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Export Format</label>
                <Select
                  value={exportFormat}
                  onValueChange={(value: 'csv' | 'pdf') =>
                    setExportFormat(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select format' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='csv'>CSV</SelectItem>
                    <SelectItem value='pdf'>PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='pt-4'>
                <Button onClick={handleExport} className='w-full'>
                  Export {filteredPayments.length} Records
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${totalRevenue.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground'>
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Filtered Total
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${filteredTotal.toFixed(2)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {filteredPayments.length} transactions
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
              {paymentData.filter(p => p.status === 'completed').length}
            </div>
            <p className='text-xs text-muted-foreground'>
              {(
                (paymentData.filter(p => p.status === 'completed').length /
                  paymentData.length) *
                100
              ).toFixed(1)}
              % success rate
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
              {paymentData.filter(p => p.status === 'pending').length}
            </div>
            <p className='text-xs text-muted-foreground'>Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-4 md:flex-row'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search by student, course, or payment ID...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
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
              <SelectItem value='completed'>Completed</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='failed'>Failed</SelectItem>
            </SelectContent>
          </Select>
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
          <div className='flex items-center gap-2'>
            <Select
              value={pageSize.toString()}
              onValueChange={value => {
                setPageSize(Number(value))
                setCurrentPage(1) // Reset to first page when changing page size
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
                  onClick={() => handleSort('studentName')}
                >
                  Student{' '}
                  {sortConfig?.key === 'studentName' && (
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell className='font-medium'>{payment.id}</TableCell>
                  <TableCell>{payment.studentName}</TableCell>
                  <TableCell>{payment.courseName}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(payment.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Payment Details</DialogTitle>
                          <DialogDescription>
                            Complete information about the payment
                          </DialogDescription>
                        </DialogHeader>
                        <div className='space-y-4'>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <h4 className='font-semibold'>Payment ID</h4>
                              <p className='text-sm text-muted-foreground'>
                                {payment.id}
                              </p>
                            </div>
                            <div>
                              <h4 className='font-semibold'>Status</h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}
                              >
                                {payment.status.charAt(0).toUpperCase() +
                                  payment.status.slice(1)}
                              </span>
                            </div>
                            <div>
                              <h4 className='font-semibold'>Student</h4>
                              <p className='text-sm text-muted-foreground'>
                                {payment.studentName}
                              </p>
                            </div>
                            <div>
                              <h4 className='font-semibold'>Course</h4>
                              <p className='text-sm text-muted-foreground'>
                                {payment.courseName}
                              </p>
                            </div>
                            <div>
                              <h4 className='font-semibold'>Amount</h4>
                              <p className='text-sm text-muted-foreground'>
                                ${payment.amount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <h4 className='font-semibold'>Payment Method</h4>
                              <p className='text-sm text-muted-foreground'>
                                {payment.paymentMethod}
                              </p>
                            </div>
                            <div>
                              <h4 className='font-semibold'>Date</h4>
                              <p className='text-sm text-muted-foreground'>
                                {new Date(payment.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className='mt-4 flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{' '}
              {totalItems} entries
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
