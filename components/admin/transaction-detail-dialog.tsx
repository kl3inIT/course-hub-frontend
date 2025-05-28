"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  Download,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TransactionDetailDialogProps {
  transaction: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailDialog({ transaction, open, onOpenChange }: TransactionDetailDialogProps) {
  const { toast } = useToast()

  if (!transaction) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50"
      case "pending":
        return "text-yellow-600 bg-yellow-50"
      case "failed":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction Details
            <Badge variant="outline">{transaction.id}</Badge>
          </DialogTitle>
          <DialogDescription>Complete transaction information and related activities</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payment">Payment Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{transaction.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{transaction.userEmail}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.userEmail, "Email")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{transaction.userId}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.userId, "User ID")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Transaction Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className={`font-bold text-lg ${transaction.amount < 0 ? "text-red-600" : "text-green-600"}`}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Fee:</span>
                    <span className="font-medium">${Math.abs(transaction.transactionFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Amount:</span>
                    <span className="font-medium">${Math.abs(transaction.netAmount || 0).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <div
                      className={`flex items-center gap-2 px-2 py-1 rounded-md ${getStatusColor(transaction.status)}`}
                    >
                      {getStatusIcon(transaction.status)}
                      <span className="font-medium capitalize">{transaction.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {transaction.courseName && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course Name:</span>
                    <span className="font-medium">{transaction.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{transaction.courseId}</span>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium capitalize">{transaction.paymentMethod.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gateway:</span>
                    <span className="font-medium capitalize">{transaction.paymentGateway}</span>
                  </div>
                  {transaction.failureReason && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Failure Reason:</span>
                      <span className="font-medium text-red-600 capitalize">
                        {transaction.failureReason.replace("_", " ")}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timestamps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{new Date(transaction.createdAt).toLocaleString()}</span>
                  </div>
                  {transaction.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-medium">{new Date(transaction.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {transaction.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing Time:</span>
                      <span className="font-medium">
                        {Math.round(
                          (new Date(transaction.completedAt).getTime() - new Date(transaction.createdAt).getTime()) /
                            1000,
                        )}
                        s
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {transaction.originalTransactionId && (
              <Card>
                <CardHeader>
                  <CardTitle>Refund Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Transaction:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{transaction.originalTransactionId}</span>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {transaction.refundReason && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="font-medium">{transaction.refundReason}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Timeline</CardTitle>
                <CardDescription>Chronological history of transaction events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 border-l-2 border-blue-500 bg-blue-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Transaction Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {transaction.status === "completed" && transaction.completedAt && (
                    <div className="flex items-center gap-4 p-3 border-l-2 border-green-500 bg-green-50">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Payment Completed</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.completedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {transaction.status === "failed" && (
                    <div className="flex items-center gap-4 p-3 border-l-2 border-red-500 bg-red-50">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Payment Failed</p>
                        <p className="text-sm text-muted-foreground">
                          Reason: {transaction.failureReason?.replace("_", " ") || "Unknown error"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Available Actions</CardTitle>
                  <CardDescription>Actions you can perform on this transaction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {transaction.refundable && transaction.status === "completed" && transaction.amount > 0 && (
                    <Button className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Process Refund
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View in Payment Gateway
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>Export transaction data in various formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export as PDF
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export as CSV
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export as JSON
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
