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
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  DollarSign,
  Eye,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Mock data for enhanced dashboard
const realtimeMetrics = {
  totalUsers: 10482,
  activeUsers: 1247,
  totalRevenue: 89400,
  monthlyGrowth: 12.5,
  transactionSuccess: 98.5,
  systemUptime: 99.9,
}

const recentTransactions = [
  {
    id: 'TXN-001',
    user: 'John Doe',
    amount: 99.99,
    status: 'completed',
    course: 'React Fundamentals',
    time: '2 minutes ago',
  },
  {
    id: 'TXN-002',
    user: 'Jane Smith',
    amount: 149.99,
    status: 'pending',
    course: 'Advanced JavaScript',
    time: '5 minutes ago',
  },
  {
    id: 'TXN-003',
    user: 'Bob Wilson',
    amount: 79.99,
    status: 'completed',
    course: 'Python Basics',
    time: '8 minutes ago',
  },
  {
    id: 'TXN-004',
    user: 'Alice Johnson',
    amount: 199.99,
    status: 'failed',
    course: 'Full Stack Development',
    time: '12 minutes ago',
  },
]

const userActivityData = [
  { time: '00:00', active: 120, logins: 15 },
  { time: '04:00', active: 89, logins: 8 },
  { time: '08:00', active: 456, logins: 67 },
  { time: '12:00', active: 789, logins: 123 },
  { time: '16:00', active: 1247, logins: 189 },
  { time: '20:00', active: 934, logins: 145 },
]

const revenueData = [
  { month: 'Jan', revenue: 12500, target: 15000 },
  { month: 'Feb', revenue: 15800, target: 16000 },
  { month: 'Mar', revenue: 18200, target: 17000 },
  { month: 'Apr', revenue: 22100, target: 20000 },
  { month: 'May', revenue: 25600, target: 24000 },
  { month: 'Jun', revenue: 28900, target: 28000 },
]

const systemPerformance = [
  {
    metric: 'API Response Time',
    value: 245,
    unit: 'ms',
    status: 'good',
    trend: -5,
  },
  {
    metric: 'Database Queries',
    value: 1247,
    unit: '/min',
    status: 'good',
    trend: 12,
  },
  {
    metric: 'Error Rate',
    value: 0.02,
    unit: '%',
    status: 'excellent',
    trend: -15,
  },
  { metric: 'Memory Usage', value: 68, unit: '%', status: 'warning', trend: 8 },
]

const alertsData = [
  {
    id: 1,
    type: 'warning',
    message: 'High memory usage detected',
    time: '5 minutes ago',
    severity: 'medium',
  },
  {
    id: 2,
    type: 'info',
    message: 'Scheduled maintenance in 2 hours',
    time: '1 hour ago',
    severity: 'low',
  },
  {
    id: 3,
    type: 'success',
    message: 'Database backup completed',
    time: '2 hours ago',
    severity: 'low',
  },
  {
    id: 4,
    type: 'error',
    message: 'Payment gateway timeout',
    time: '3 hours ago',
    severity: 'high',
  },
]

export function OverviewDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const refreshDashboard = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
    toast({
      title: 'Dashboard Refreshed',
      description: 'All metrics have been updated with the latest data.',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50'
      case 'good':
        return 'text-blue-600 bg-blue-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'critical':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Admin Overview</h1>
          <p className='text-muted-foreground mt-2'>
            Real-time insights and system performance monitoring
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            onClick={refreshDashboard}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button>
            <Eye className='mr-2 h-4 w-4' />
            View Reports
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {realtimeMetrics.totalUsers.toLocaleString()}
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='h-3 w-3 mr-1' />+
              {realtimeMetrics.monthlyGrowth}% from last month
            </div>
            <Progress value={85} className='mt-2' />
          </CardContent>
        </Card>

        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {realtimeMetrics.activeUsers.toLocaleString()}
            </div>
            <div className='flex items-center text-xs text-blue-600'>
              <ArrowUpRight className='h-3 w-3 mr-1' />
              Live count
            </div>
            <Progress value={72} className='mt-2' />
          </CardContent>
        </Card>

        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${realtimeMetrics.totalRevenue.toLocaleString()}
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='h-3 w-3 mr-1' />
              +15.3% from last month
            </div>
            <Progress value={90} className='mt-2' />
          </CardContent>
        </Card>

        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>System Health</CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {realtimeMetrics.systemUptime}%
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <CheckCircle className='h-3 w-3 mr-1' />
              All systems operational
            </div>
            <Progress value={realtimeMetrics.systemUptime} className='mt-2' />
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Recent Transactions */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest payment activities on the platform
                </CardDescription>
              </div>
              <Button variant='outline' size='sm'>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <div>
                      <p className='font-medium'>{transaction.user}</p>
                      <p className='text-sm text-muted-foreground'>
                        {transaction.course}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>${transaction.amount}</p>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant={
                          transaction.status === 'completed'
                            ? 'default'
                            : transaction.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className='text-xs'
                      >
                        {transaction.status}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        {transaction.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              System Alerts
            </CardTitle>
            <CardDescription>Recent system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {alertsData.slice(0, 4).map(alert => (
                <div
                  key={alert.id}
                  className='flex items-start gap-3 p-2 border rounded-lg'
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === 'error'
                        ? 'bg-red-500'
                        : alert.type === 'warning'
                          ? 'bg-yellow-500'
                          : alert.type === 'success'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                    }`}
                  ></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{alert.message}</p>
                    <p className='text-xs text-muted-foreground'>
                      {alert.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      alert.severity === 'high'
                        ? 'destructive'
                        : alert.severity === 'medium'
                          ? 'secondary'
                          : 'outline'
                    }
                    className='text-xs'
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='analytics' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
          <TabsTrigger value='activity'>User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value='analytics' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Target</CardTitle>
                <CardDescription>
                  Monthly revenue performance against targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey='revenue'
                      fill='#8884d8'
                      name='Actual Revenue'
                    />
                    <Bar dataKey='target' fill='#82ca9d' name='Target' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Success Rate</CardTitle>
                <CardDescription>
                  Payment processing success metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='text-center'>
                    <div className='text-4xl font-bold text-green-600'>
                      {realtimeMetrics.transactionSuccess}%
                    </div>
                    <p className='text-muted-foreground'>Success Rate</p>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Successful</span>
                      <span className='text-green-600'>98.5%</span>
                    </div>
                    <Progress value={98.5} className='h-2' />
                    <div className='flex justify-between text-sm'>
                      <span>Failed</span>
                      <span className='text-red-600'>1.5%</span>
                    </div>
                    <Progress value={1.5} className='h-2' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='performance' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {systemPerformance.map(metric => (
              <Card key={metric.metric}>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    {metric.metric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {metric.value}
                    <span className='text-sm font-normal text-muted-foreground ml-1'>
                      {metric.unit}
                    </span>
                  </div>
                  <div
                    className={`flex items-center text-xs mt-1 ${getPerformanceColor(metric.status)}`}
                  >
                    {metric.trend > 0 ? (
                      <TrendingUp className='h-3 w-3 mr-1' />
                    ) : (
                      <TrendingDown className='h-3 w-3 mr-1' />
                    )}
                    {Math.abs(metric.trend)}% from last hour
                  </div>
                  <Badge
                    variant='outline'
                    className={`mt-2 ${getPerformanceColor(metric.status)}`}
                  >
                    {metric.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='activity' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>User Activity Timeline</CardTitle>
              <CardDescription>
                Active users and login activity throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={userActivityData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='time' />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='active'
                    stackId='1'
                    stroke='#8884d8'
                    fill='#8884d8'
                    name='Active Users'
                  />
                  <Area
                    type='monotone'
                    dataKey='logins'
                    stackId='2'
                    stroke='#82ca9d'
                    fill='#82ca9d'
                    name='New Logins'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
