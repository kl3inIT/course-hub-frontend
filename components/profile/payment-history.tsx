'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Download, Eye, RefreshCw, Search, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Transaction {
  id: string
  date: string
  amount: number
  description: string
  paymentMethod: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  transactionId: string
  courseId?: string
  courseName?: string
  gateway: string
  refundAmount?: number
  refundReason?: string
}

export function PaymentHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const { toast } = useToast()

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Mock data - replace with actual API call
  const mockTransactions: Transaction[] = [
    {
      id: 'txn_001',
      date: '2024-01-15',
      amount: 99.99,
      description: 'React Development Masterclass',
      paymentMethod: 'Credit Card',
      status: 'completed',
      transactionId: 'ch_3OqIC92eZvKYlo2C0b4wXYZ1',
      courseId: '1',
      courseName: 'React Development Masterclass',
      gateway: 'Stripe',
    },
    {
      id: 'txn_002',
      date: '2024-01-10',
      amount: 149.99,
      description: 'Advanced JavaScript Concepts',
      paymentMethod: 'PayPal',
      status: 'completed',
      transactionId: 'PAYID-MXAMPLE123456789',
      courseId: '2',
      courseName: 'Advanced JavaScript Concepts',
      gateway: 'PayPal',
    },
    {
      id: 'txn_003',
      date: '2024-01-05',
      amount: 79.99,
      description: 'Python for Beginners',
      paymentMethod: 'Credit Card',
      status: 'refunded',
      transactionId: 'ch_3OqIC92eZvKYlo2C0b4wXYZ2',
      courseId: '3',
      courseName: 'Python for Beginners',
      gateway: 'Stripe',
      refundAmount: 79.99,
      refundReason: 'Course not as expected',
    },
    {
      id: 'txn_004',
      date: '2024-01-01',
      amount: 199.99,
      description: 'Full Stack Development Bundle',
      paymentMethod: 'Bank Transfer',
      status: 'pending',
      transactionId: 'bt_1234567890',
      courseId: '4',
      courseName: 'Full Stack Development Bundle',
      gateway: 'Bank',
    },
    {
      id: 'txn_005',
      date: '2023-12-28',
      amount: 59.99,
      description: 'CSS Grid & Flexbox Mastery',
      paymentMethod: 'Credit Card',
      status: 'failed',
      transactionId: 'ch_3OqIC92eZvKYlo2C0b4wXYZ3',
      courseId: '5',
      courseName: 'CSS Grid & Flexbox Mastery',
      gateway: 'Stripe',
    },
  ]

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [
    transactions,
    searchTerm,
    statusFilter,
    paymentMethodFilter,
    dateFrom,
    dateTo,
  ])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setTransactions(mockTransactions)
    } catch (err) {
      setError('Failed to load payment history. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to load payment history',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        transaction =>
          transaction.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.transactionId
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        transaction => transaction.status === statusFilter
      )
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(
        transaction => transaction.paymentMethod === paymentMethodFilter
      )
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        transaction => new Date(transaction.date) >= new Date(dateFrom)
      )
    }
    if (dateTo) {
      filtered = filtered.filter(
        transaction => new Date(transaction.date) <= new Date(dateTo)
      )
    }

    setFilteredTransactions(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPaymentMethodFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline',
    } as const

    const colors = {
      completed: 'bg-green-100 text-green-800 hover:bg-green-100',
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      failed: 'bg-red-100 text-red-800 hover:bg-red-100',
      refunded: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const downloadReceipt = (transaction: Transaction) => {
    toast({
      title: 'Receipt Downloaded',
      description: `Receipt for ${transaction.description} has been downloaded.`,
    })
  }

  const exportTransactions = () => {
    toast({
      title: 'Export Started',
      description: 'Your transaction history is being prepared for download.',
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Loading your transaction history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <RefreshCw className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Unable to load payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <p className='text-muted-foreground mb-4'>{error}</p>
            <Button onClick={fetchTransactions} variant='outline'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View and manage your transaction history
            </CardDescription>
          </div>
          <Button onClick={exportTransactions} variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Filters */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='search'>Search</Label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                id='search'
                placeholder='Search transactions...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
                <SelectItem value='refunded'>Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Payment Method</Label>
            <Select
              value={paymentMethodFilter}
              onValueChange={setPaymentMethodFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder='All methods' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Methods</SelectItem>
                <SelectItem value='Credit Card'>Credit Card</SelectItem>
                <SelectItem value='PayPal'>PayPal</SelectItem>
                <SelectItem value='Bank Transfer'>Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Actions</Label>
            <div className='flex gap-2'>
              <Button onClick={clearFilters} variant='outline' size='sm'>
                <X className='h-4 w-4 mr-2' />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='dateFrom'>From Date</Label>
            <Input
              id='dateFrom'
              type='date'
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='dateTo'>To Date</Label>
            <Input
              id='dateTo'
              type='date'
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-muted-foreground'>
              No transactions found matching your criteria.
            </p>
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell className='font-medium'>
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className='font-medium'>{transaction.description}</p>
                        <p className='text-sm text-muted-foreground'>
                          ID: {transaction.transactionId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                setSelectedTransaction(transaction)
                              }
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='max-w-2xl'>
                            <DialogHeader>
                              <DialogTitle>Transaction Details</DialogTitle>
                              <DialogDescription>
                                Complete information for transaction{' '}
                                {selectedTransaction?.transactionId}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                  <div>
                                    <Label className='text-sm font-medium'>
                                      Transaction ID
                                    </Label>
                                    <p className='text-sm'>
                                      {selectedTransaction.transactionId}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className='text-sm font-medium'>
                                      Date
                                    </Label>
                                    <p className='text-sm'>
                                      {formatDate(selectedTransaction.date)}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className='text-sm font-medium'>
                                      Amount
                                    </Label>
                                    <p className='text-sm font-medium'>
                                      {formatCurrency(
                                        selectedTransaction.amount
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className='text-sm font-medium'>
                                      Status
                                    </Label>
                                    <div className='mt-1'>
                                      {getStatusBadge(
                                        selectedTransaction.status
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className='text-sm font-medium'>
                                      Payment Method
                                    </Label>
                                    <p className='text-sm'>
                                      {selectedTransaction.paymentMethod}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className='text-sm font-medium'>
                                      Gateway
                                    </Label>
                                    <p className='text-sm'>
                                      {selectedTransaction.gateway}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <Label className='text-sm font-medium'>
                                    Description
                                  </Label>
                                  <p className='text-sm'>
                                    {selectedTransaction.description}
                                  </p>
                                </div>
                                {selectedTransaction.status === 'refunded' && (
                                  <div className='bg-blue-50 p-4 rounded-lg'>
                                    <Label className='text-sm font-medium'>
                                      Refund Information
                                    </Label>
                                    <p className='text-sm'>
                                      Amount:{' '}
                                      {formatCurrency(
                                        selectedTransaction.refundAmount || 0
                                      )}
                                    </p>
                                    <p className='text-sm'>
                                      Reason: {selectedTransaction.refundReason}
                                    </p>
                                  </div>
                                )}
                                <div className='flex justify-end gap-2'>
                                  <Button
                                    variant='outline'
                                    onClick={() =>
                                      downloadReceipt(selectedTransaction)
                                    }
                                  >
                                    <Download className='h-4 w-4 mr-2' />
                                    Download Receipt
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => downloadReceipt(transaction)}
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t'>
          <p className='text-sm text-muted-foreground'>
            Showing {filteredTransactions.length} of {transactions.length}{' '}
            transactions
          </p>
          <div className='text-sm'>
            <span className='font-medium'>
              Total:{' '}
              {formatCurrency(
                filteredTransactions
                  .filter(t => t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
