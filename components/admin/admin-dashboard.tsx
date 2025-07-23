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
import { courseApi } from '@/services/course-api'
import { paymentApi } from '@/services/payment-api'
import { userApi } from '@/services/user-api'
import {
  Activity,
  BookOpen,
  DollarSign,
  Settings,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [totalCourses, setTotalCourses] = useState<number>(0)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [platformRevenue, setPlatformRevenue] = useState(0)
  const [systemHealth, setSystemHealth] = useState(98.5)
  const [activeUsers, setActiveUsers] = useState<number>(0)
  const [totalTransactions, setTotalTransactions] = useState<number>(0)

  useEffect(() => {
    userApi.getUserCount().then(setTotalUsers)
    userApi.getActiveUserCount().then(setActiveUsers)
    courseApi.getCourseCount().then(setTotalCourses)
    paymentApi.getAllPaymentHistory().then(data => {
      setRecentTransactions(
        data.slice(0, 10).map((payment: any, idx: number) => ({
          id: payment.id || idx,
          transactionId: payment.transactionCode,
          amount: payment.amount,
          status:
            payment.status?.toUpperCase() === 'SUCCESS'
              ? 'success'
              : payment.status?.toUpperCase() === 'FAILED'
                ? 'failed'
                : 'pending',
          time: payment.date || '',
        }))
      )
    })
    paymentApi.getTotalRevenue().then(setPlatformRevenue)
    paymentApi.getTotalPaymentCount().then(setTotalTransactions)
  }, [])

  const newRegistrationsToday = 35

  const serverResponseTime = 0.25 // seconds
  const databasePerformance = 99.8 // percentage
  const apiEndpointHealth = 100 // percentage
  const errorRate = 0.01 // percentage

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
        <p className='text-muted-foreground mt-2'>
          System overview and administrative controls.
        </p>
      </div>

      {/* Key Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalUsers}</div>
            <p className='text-xs text-muted-foreground'>
              {/* +201 from last month */}
            </p>
            <Progress value={85} className='mt-2' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Courses</CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalCourses}</div>
            <p className='text-xs text-muted-foreground'>
              {/* +19% from last month */}
            </p>
            <Progress value={72} className='mt-2' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Platform Revenue
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${platformRevenue}</div>
            <p className='text-xs text-muted-foreground'>
              {/* +25% from last month */}
            </p>
            <Progress value={90} className='mt-2' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>System Health</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{systemHealth.toFixed(1)}%</div>
            <p className='text-xs text-muted-foreground'>Uptime this month</p>
            <Progress value={systemHealth} className='mt-2' />
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {/* Quick Actions */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button className='w-full justify-start'>
              <UserPlus className='mr-2 h-4 w-4' />
              Create New User
            </Button>
            <Button variant='outline' className='w-full justify-start'>
              <BookOpen className='mr-2 h-4 w-4' />
              Review Pending Courses
            </Button>
            <Button variant='outline' className='w-full justify-start'>
              <Shield className='mr-2 h-4 w-4' />
              Security Audit
            </Button>
            <Button variant='outline' className='w-full justify-start'>
              <Settings className='mr-2 h-4 w-4' />
              System Configuration
            </Button>
          </CardContent>
        </Card>
        {/* Đã xóa Card Recent Activity */}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Last 10 transactions with quick actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentTransactions.map(transaction => (
              <div
                key={transaction.id}
                className='flex items-center justify-between p-3 border rounded-lg'
              >
                <div>
                  <p className='text-sm font-medium'>
                    Transaction ID: {transaction.transactionId}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Amount: ${transaction.amount} • {transaction.time}
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <Badge
                    variant={
                      transaction.status === 'success'
                        ? 'default'
                        : transaction.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                    }
                    className={
                      transaction.status === 'success'
                        ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                        : ''
                    }
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>
            Active users, new registrations, and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <div className='text-2xl font-bold'>{activeUsers}</div>
              <p className='text-sm text-muted-foreground'>Active Users</p>
            </div>
            <div>
              <div className='text-2xl font-bold'>{totalTransactions}</div>
              <p className='text-sm text-muted-foreground'>
                Total Transactions
              </p>
            </div>
          </div>
          {/* Add Login activity chart here */}
        </CardContent>
      </Card>

      {/* System Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>
            Server response time, database performance, and API health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {serverResponseTime}s
              </div>
              <p className='text-sm text-muted-foreground'>
                Server Response Time
              </p>
            </div>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                {databasePerformance}%
              </div>
              <p className='text-sm text-muted-foreground'>
                Database Performance
              </p>
            </div>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                {apiEndpointHealth}%
              </div>
              <p className='text-sm text-muted-foreground'>
                API Endpoint Health
              </p>
            </div>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-red-600'>
                {errorRate}%
              </div>
              <p className='text-sm text-muted-foreground'>Error Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Analytics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
          <CardDescription>
            Key performance indicators and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-4'>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>98.5%</div>
              <p className='text-sm text-muted-foreground'>System Uptime</p>
            </div>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>4.8/5</div>
              <p className='text-sm text-muted-foreground'>
                Average Course Rating
              </p>
            </div>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-purple-600'>73%</div>
              <p className='text-sm text-muted-foreground'>
                Course Completion Rate
              </p>
            </div>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-orange-600'>2.3k</div>
              <p className='text-sm text-muted-foreground'>Active Sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
