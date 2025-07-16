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
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  DollarSign,
  Settings,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(10482)
  const [totalCourses, setTotalCourses] = useState(1429)
  const [platformRevenue, setPlatformRevenue] = useState(89400)
  const [systemHealth, setSystemHealth] = useState(98.5)

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setTotalUsers(prev => prev + Math.floor(Math.random() * 10))
      setTotalCourses(prev => prev + Math.floor(Math.random() * 3))
      setPlatformRevenue(prev => prev + Math.floor(Math.random() * 100))
      setSystemHealth(prev => Math.min(99.9, prev + Math.random() * 0.1))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'High server load detected',
      time: '5 minutes ago',
    },
    {
      id: 2,
      type: 'info',
      message: 'Scheduled maintenance in 2 hours',
      time: '1 hour ago',
    },
    {
      id: 3,
      type: 'success',
      message: 'Database backup completed',
      time: '2 hours ago',
    },
  ]

  const recentActivities = [
    {
      id: 1,
      action: 'New user registration',
      user: 'john.doe@example.com',
      time: '2 minutes ago',
    },
    {
      id: 2,
      action: 'Course published',
      user: 'jane.manager@example.com',
      time: '15 minutes ago',
    },
    {
      id: 3,
      action: 'Payment processed',
      user: 'student@example.com',
      time: '30 minutes ago',
    },
    {
      id: 4,
      action: 'User role updated',
      user: 'admin@example.com',
      time: '1 hour ago',
    },
  ]

  const recentTransactions = [
    {
      id: 1,
      transactionId: 'TXN123',
      amount: 50,
      status: 'success',
      time: '1 minute ago',
    },
    {
      id: 2,
      transactionId: 'TXN124',
      amount: 100,
      status: 'pending',
      time: '5 minutes ago',
    },
    {
      id: 3,
      transactionId: 'TXN125',
      amount: 25,
      status: 'failed',
      time: '10 minutes ago',
    },
    {
      id: 4,
      transactionId: 'TXN126',
      amount: 75,
      status: 'success',
      time: '15 minutes ago',
    },
    {
      id: 5,
      transactionId: 'TXN127',
      amount: 120,
      status: 'success',
      time: '20 minutes ago',
    },
    {
      id: 6,
      transactionId: 'TXN128',
      amount: 60,
      status: 'pending',
      time: '25 minutes ago',
    },
    {
      id: 7,
      transactionId: 'TXN129',
      amount: 90,
      status: 'success',
      time: '30 minutes ago',
    },
    {
      id: 8,
      transactionId: 'TXN130',
      amount: 40,
      status: 'failed',
      time: '35 minutes ago',
    },
    {
      id: 9,
      transactionId: 'TXN131',
      amount: 80,
      status: 'success',
      time: '40 minutes ago',
    },
    {
      id: 10,
      transactionId: 'TXN132',
      amount: 110,
      status: 'success',
      time: '45 minutes ago',
    },
  ]

  const activeUsers = 523
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
              +201 from last month
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
              +19% from last month
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
              +25% from last month
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
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' />
            System Alerts
          </CardTitle>
          <CardDescription>
            Recent system notifications and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {systemAlerts.map(alert => (
              <div
                key={alert.id}
                className='flex items-center justify-between p-3 border rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  {alert.type === 'warning' && (
                    <AlertTriangle className='h-4 w-4 text-yellow-500' />
                  )}
                  {alert.type === 'info' && (
                    <Activity className='h-4 w-4 text-blue-500' />
                  )}
                  {alert.type === 'success' && (
                    <CheckCircle className='h-4 w-4 text-green-500' />
                  )}
                  <div>
                    <p className='text-sm font-medium'>{alert.message}</p>
                    <p className='text-xs text-muted-foreground'>
                      {alert.time}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    alert.type === 'warning'
                      ? 'destructive'
                      : alert.type === 'success'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {alert.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentActivities.map(activity => (
                <div key={activity.id} className='flex items-center space-x-4'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{activity.action}</p>
                    <p className='text-xs text-muted-foreground'>
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                  >
                    {transaction.status}
                  </Badge>
                  <Button variant='outline' size='sm'>
                    View
                  </Button>
                  {transaction.status === 'success' && (
                    <Button variant='destructive' size='sm'>
                      Refund
                    </Button>
                  )}
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
              <div className='text-2xl font-bold'>{newRegistrationsToday}</div>
              <p className='text-sm text-muted-foreground'>
                New Registrations Today
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
