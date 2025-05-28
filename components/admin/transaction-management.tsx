"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Banknote,
  Receipt,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Mock transaction data
const mockTransactions = [
  {
    id: "TXN-001",
    userId: "user-123",
    userName: "John Doe",
    userEmail: "john@example.com",
    type: "course_purchase",
    amount: 99.99,
    currency: "USD",
    status: "completed",
    paymentMethod: "credit_card",
    courseId: "course-456",
    courseName: "React Fundamentals",
    createdAt: "2024-01-20T10:30:00Z",
    completedAt: "2024-01-20T10:30:15Z",
    paymentGateway: "stripe",
    transactionFee: 3.2,
    netAmount: 96.79,
    refundable: true,
  },
  {
    id: "TXN-002",
    userId: "user-456",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    type: "course_purchase",
    amount: 149.99,
    currency: "USD",
    status: "pending",
    paymentMethod: "paypal",
    courseId: "course-789",
    courseName: "Advanced JavaScript",
    createdAt: "2024-01-20T11:15:00Z",
    paymentGateway: "paypal",
    transactionFee: 4.5,
    netAmount: 145.49,
    refundable: false,
  },
  {
    id: "TXN-003",
    userId: "user-789",
    userName: "Bob Wilson",
    userEmail: "bob@example.com",
    type: "refund",
    amount: -79.99,
    currency: "USD",
    status: "completed",
    paymentMethod: "credit_card",
    courseId: "course-123",
    courseName: "Python Basics",
    createdAt: "2024-01-19T14:20:00Z",
    completedAt: "2024-01-19T14:25:00Z",
    paymentGateway: "stripe",
    transactionFee: -2.4,
    netAmount: -77.59,
    refundable: false,
    originalTransactionId: "TXN-000",
  },
  {
    id: "TXN-004",
    userId: "user-321",
    userName: "Alice Johnson",
    userEmail: "alice@example.com",
    type: "course_purchase",
    amount: 199.99,
    currency: "USD",
    status: "failed",
    paymentMethod: "credit_card",
    courseId: "course-999",
    courseName: "Full Stack Development",
    createdAt: "2024-01-20T09:45:00Z",
    paymentGateway: "stripe",
    failureReason: "insufficient_funds",
    refundable: false,
  },
]

const transactionStatuses = {
  completed: { label: "Completed", variant: "default" as const, icon: CheckCircle },
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
  failed: { label: "Failed", variant: "destructive" as const, icon: XCircle },
  refunded: { label: "Refunded", variant: "outline" as const, icon: RefreshCw },
}

const paymentMethods = {
  credit_card: { label: "Credit Card", icon: CreditCard },
  paypal: { label: "PayPal", icon: Banknote },
  bank_transfer: { label: "Bank Transfer", icon: Receipt },
}

export function TransactionManagement() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [refundReason, setRefundReason] = useState("")
  const [refundAmount, setRefundAmount] = useState("")
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus
    const matchesType = selectedType === "all" || transaction.type === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  const getTransactionStats = () => {
    const total = transactions.length
    const completed = transactions.filter((t) => t.status === "completed").length
    const pending = transactions.filter((t) => t.status === "pending").length
    const failed = transactions.filter((t) => t.status === "failed").length
    const totalRevenue = transactions
      .filter((t) => t.status === "completed" && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    const totalRefunds = transactions
      .filter((t) => t.status === "completed" && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const successRate = total > 0 ? (completed / total) * 100 : 0
    const averageTransactionValue = completed > 0 ? totalRevenue / completed : 0

    return { total, completed, pending, failed, totalRevenue, totalRefunds, successRate, averageTransactionValue }
  }

  const stats = getTransactionStats()

  const handleRefund = () => {
    if (!selectedTransaction || !refundAmount) return

    const refundTransaction = {
      id: `TXN-${Date.now()}`,
      userId: selectedTransaction.userId,
      userName: selectedTransaction.userName,
      userEmail: selectedTransaction.userEmail,
      type: "refund",
      amount: -Number.parseFloat(refundAmount),
      currency: selectedTransaction.currency,
      status: "completed",
      paymentMethod: selectedTransaction.paymentMethod,
      courseId: selectedTransaction.courseId,
      courseName: selectedTransaction.courseName,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      paymentGateway: selectedTransaction.paymentGateway,
      transactionFee: -(Number.parseFloat(refundAmount) * 0.03),
      netAmount: -(Number.parseFloat(refundAmount) * 0.97),
      refundable: false,
      originalTransactionId: selectedTransaction.id,
      refundReason,
    }

    setTransactions([refundTransaction, ...transactions])
    setIsRefundDialogOpen(false)
    setSelectedTransaction(null)
    setRefundReason("")
    setRefundAmount("")

    toast({
      title: "Refund Processed",
      description: `Refund of $${refundAmount} has been processed successfully.`,
    })
  }

  const exportTransactions = () => {
    const csvContent = [
      ["Transaction ID", "User", "Type", "Amount", "Status", "Date", "Course"].join(","),
      ...filteredTransactions.map((t) =>
        [
          t.id,
          t.userName,
          t.type,
          t.amount,
          t.status,
          new Date(t.createdAt).toLocaleDateString(),
          t.courseName || "N/A",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Transaction data has been exported successfully.",
    })
  }

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction)
    setIsTransactionDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction Management</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage all financial transactions on the platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRefunds.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageTransactionValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="disputes">Disputes & Chargebacks</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View and manage all platform transactions</CardDescription>
                </div>
                <Button onClick={exportTransactions}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-[200px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                  </PopoverContent>
                </Popover>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="course_purchase">Purchase</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const statusConfig = transactionStatuses[transaction.status as keyof typeof transactionStatuses]
                    const paymentConfig = paymentMethods[transaction.paymentMethod as keyof typeof paymentMethods]
                    const StatusIcon = statusConfig?.icon
                    const PaymentIcon = paymentConfig?.icon

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.userName}</div>
                            <div className="text-sm text-muted-foreground">{transaction.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.type.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${transaction.amount < 0 ? "text-red-600" : "text-green-600"}`}>
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Net: ${Math.abs(transaction.netAmount || 0).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig?.variant} className="flex items-center gap-1 w-fit">
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            {statusConfig?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {PaymentIcon && <PaymentIcon className="h-4 w-4" />}
                            {paymentConfig?.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewTransaction(transaction)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {transaction.refundable &&
                                transaction.status === "completed" &&
                                transaction.amount > 0 && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedTransaction(transaction)
                                      setRefundAmount(transaction.amount.toString())
                                      setIsRefundDialogOpen(true)
                                    }}
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Process Refund
                                  </DropdownMenuItem>
                                )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download Receipt
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Disputes & Chargebacks</CardTitle>
              <CardDescription>Manage payment disputes and chargeback cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Disputes</h3>
                <p className="text-muted-foreground">All transactions are currently dispute-free.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Reconciliation</CardTitle>
              <CardDescription>Reconcile payments with payment gateway reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Stripe Reconciliation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">✓ Matched</div>
                    <p className="text-xs text-muted-foreground">Last sync: 2 hours ago</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">PayPal Reconciliation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">✓ Matched</div>
                    <p className="text-xs text-muted-foreground">Last sync: 1 hour ago</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Bank Reconciliation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">⚠ Pending</div>
                    <p className="text-xs text-muted-foreground">Last sync: 1 day ago</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>Create custom reports for transaction analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Report</SelectItem>
                      <SelectItem value="reconciliation">Reconciliation Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[200px] justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="mt-4">
                <Button>Generate Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>Process a refund for transaction {selectedTransaction?.id}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="refund-amount" className="text-right">
                Amount
              </Label>
              <Input
                id="refund-amount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="col-span-3"
                max={selectedTransaction?.amount}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="refund-reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="col-span-3"
                placeholder="Enter reason for refund..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={!refundAmount || !refundReason}>
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>View detailed information about this transaction</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Transaction ID</Label>
                  <Input value={selectedTransaction.id} readOnly />
                </div>
                <div>
                  <Label>User</Label>
                  <Input value={selectedTransaction.userName} readOnly />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={selectedTransaction.userEmail} readOnly />
                </div>
                <div>
                  <Label>Type</Label>
                  <Input value={selectedTransaction.type} readOnly />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input value={selectedTransaction.amount} readOnly />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input value={selectedTransaction.status} readOnly />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Input value={selectedTransaction.paymentMethod} readOnly />
                </div>
                <div>
                  <Label>Payment Gateway</Label>
                  <Input value={selectedTransaction.paymentGateway} readOnly />
                </div>
                <div>
                  <Label>Transaction Fee</Label>
                  <Input value={selectedTransaction.transactionFee} readOnly />
                </div>
                <div>
                  <Label>Net Amount</Label>
                  <Input value={selectedTransaction.netAmount} readOnly />
                </div>
                <div>
                  <Label>Created At</Label>
                  <Input value={selectedTransaction.createdAt} readOnly />
                </div>
                <div>
                  <Label>Course Name</Label>
                  <Input value={selectedTransaction.courseName || "N/A"} readOnly />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
