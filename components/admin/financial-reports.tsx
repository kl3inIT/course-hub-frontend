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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarIcon,
  FileText,
  Target,
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

// Mock financial data
const revenueData = [
  {
    month: 'Jan',
    revenue: 12500,
    expenses: 3200,
    profit: 9300,
    transactions: 145,
  },
  {
    month: 'Feb',
    revenue: 15800,
    expenses: 4100,
    profit: 11700,
    transactions: 189,
  },
  {
    month: 'Mar',
    revenue: 18200,
    expenses: 4800,
    profit: 13400,
    transactions: 234,
  },
  {
    month: 'Apr',
    revenue: 22100,
    expenses: 5500,
    profit: 16600,
    transactions: 287,
  },
  {
    month: 'May',
    revenue: 25600,
    expenses: 6200,
    profit: 19400,
    transactions: 342,
  },
  {
    month: 'Jun',
    revenue: 28900,
    expenses: 7100,
    profit: 21800,
    transactions: 398,
  },
]

const courseRevenueData = [
  {
    name: 'React Fundamentals',
    revenue: 45600,
    enrollments: 456,
    avgPrice: 100,
  },
  {
    name: 'JavaScript Mastery',
    revenue: 38900,
    enrollments: 389,
    avgPrice: 100,
  },
  {
    name: 'Python for Beginners',
    revenue: 32400,
    enrollments: 432,
    avgPrice: 75,
  },
  { name: 'UI/UX Design', revenue: 28700, enrollments: 287, avgPrice: 100 },
  { name: 'Data Science', revenue: 24800, enrollments: 124, avgPrice: 200 },
]

const paymentMethodData = [
  { name: 'Credit Card', value: 65, color: '#8884d8' },
  { name: 'PayPal', value: 25, color: '#82ca9d' },
  { name: 'Bank Transfer', value: 10, color: '#ffc658' },
]

const regionData = [
  { region: 'North America', revenue: 89400, percentage: 45 },
  { region: 'Europe', revenue: 67200, percentage: 34 },
  { region: 'Asia Pacific', revenue: 32800, percentage: 16 },
  { region: 'Others', revenue: 9800, percentage: 5 },
]

export function FinancialReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('last-6-months')
  const [dateRange, setDateRange] = useState<
    { from: Date; to: Date } | undefined
  >()
  const { toast } = useToast()

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalExpenses = revenueData.reduce(
    (sum, item) => sum + item.expenses,
    0
  )
  const totalProfit = totalRevenue - totalExpenses
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)

  const generateReport = (type: string) => {
    toast({
      title: 'Report Generated',
      description: `${type} report has been generated and will be downloaded shortly.`,
    })
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Financial Reports</h1>
          <p className='text-muted-foreground mt-2'>
            Comprehensive financial analytics and reporting dashboard.
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Select period' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='last-7-days'>Last 7 days</SelectItem>
              <SelectItem value='last-30-days'>Last 30 days</SelectItem>
              <SelectItem value='last-3-months'>Last 3 months</SelectItem>
              <SelectItem value='last-6-months'>Last 6 months</SelectItem>
              <SelectItem value='last-year'>Last year</SelectItem>
              <SelectItem value='custom'>Custom range</SelectItem>
            </SelectContent>
          </Select>
          {selectedPeriod === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline'>
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  initialFocus
                  mode='range'
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${totalRevenue.toLocaleString()}
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='h-3 w-3 mr-1' />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Expenses
            </CardTitle>
            <TrendingDown className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${totalExpenses.toLocaleString()}
            </div>
            <div className='flex items-center text-xs text-red-600'>
              <TrendingUp className='h-3 w-3 mr-1' />
              +8.2% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Net Profit</CardTitle>
            <Target className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${totalProfit.toLocaleString()}
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='h-3 w-3 mr-1' />
              +15.3% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Profit Margin</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{profitMargin}%</div>
            <Progress
              value={Number.parseFloat(profitMargin)}
              className='mt-2'
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='revenue'>Revenue</TabsTrigger>
          <TabsTrigger value='courses'>Courses</TabsTrigger>
          <TabsTrigger value='geography'>Geography</TabsTrigger>
          <TabsTrigger value='exports'>Exports</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>
                  Monthly financial performance overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='revenue' fill='#8884d8' name='Revenue' />
                    <Bar dataKey='expenses' fill='#82ca9d' name='Expenses' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Distribution of payment methods used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profit Trend</CardTitle>
              <CardDescription>Monthly profit progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type='monotone'
                    dataKey='profit'
                    stroke='#8884d8'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='revenue' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Detailed revenue analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span>Course Sales</span>
                    <span className='font-medium'>$156,800 (89%)</span>
                  </div>
                  <Progress value={89} />
                  <div className='flex justify-between items-center'>
                    <span>Subscription Fees</span>
                    <span className='font-medium'>$15,200 (9%)</span>
                  </div>
                  <Progress value={9} />
                  <div className='flex justify-between items-center'>
                    <span>Other Revenue</span>
                    <span className='font-medium'>$3,500 (2%)</span>
                  </div>
                  <Progress value={2} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Growth</CardTitle>
                <CardDescription>Month-over-month growth rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {revenueData.slice(-3).map((month, index) => (
                    <div
                      key={month.month}
                      className='flex justify-between items-center'
                    >
                      <span>{month.month}</span>
                      <div className='flex items-center'>
                        <TrendingUp className='h-4 w-4 text-green-600 mr-1' />
                        <span className='text-green-600 font-medium'>
                          +
                          {(
                            (month.revenue /
                              (revenueData[index] || month).revenue -
                              1) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='courses' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Course Revenue Performance</CardTitle>
              <CardDescription>
                Revenue generated by each course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {courseRevenueData.map((course, index) => (
                  <div
                    key={course.name}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex items-center space-x-4'>
                      <Badge variant='outline'>#{index + 1}</Badge>
                      <div>
                        <h4 className='font-medium'>{course.name}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {course.enrollments} enrollments • Avg: $
                          {course.avgPrice}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold'>
                        ${course.revenue.toLocaleString()}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Total Revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='geography' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Region</CardTitle>
              <CardDescription>
                Geographic distribution of revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {regionData.map(region => (
                  <div
                    key={region.region}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div>
                      <h4 className='font-medium'>{region.region}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {region.percentage}% of total revenue
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-xl font-bold'>
                        ${region.revenue.toLocaleString()}
                      </div>
                      <Progress
                        value={region.percentage}
                        className='w-24 mt-1'
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='exports' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Generate and download financial reports
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Button
                  onClick={() => generateReport('Revenue Report')}
                  className='w-full'
                >
                  <Download className='mr-2 h-4 w-4' />
                  Revenue Report (PDF)
                </Button>
                <Button
                  onClick={() => generateReport('Expense Report')}
                  variant='outline'
                  className='w-full'
                >
                  <Download className='mr-2 h-4 w-4' />
                  Expense Report (Excel)
                </Button>
                <Button
                  onClick={() => generateReport('Tax Report')}
                  variant='outline'
                  className='w-full'
                >
                  <Download className='mr-2 h-4 w-4' />
                  Tax Report (CSV)
                </Button>
                <Button
                  onClick={() => generateReport('Profit & Loss')}
                  variant='outline'
                  className='w-full'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  P&L Statement (PDF)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Automated report generation settings
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h4 className='font-medium'>Monthly Revenue Report</h4>
                    <p className='text-sm text-muted-foreground'>
                      Sent on 1st of each month
                    </p>
                  </div>
                  <Badge variant='default'>Active</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <h4 className='font-medium'>Weekly Transaction Summary</h4>
                    <p className='text-sm text-muted-foreground'>
                      Sent every Monday
                    </p>
                  </div>
                  <Badge variant='default'>Active</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <h4 className='font-medium'>Quarterly Financial Report</h4>
                    <p className='text-sm text-muted-foreground'>
                      Sent quarterly
                    </p>
                  </div>
                  <Badge variant='secondary'>Paused</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
