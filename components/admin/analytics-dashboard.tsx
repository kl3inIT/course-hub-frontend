'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Award,
  Target,
  Activity,
  Calendar,
} from 'lucide-react'

export function AnalyticsDashboard() {
  const userMetrics = {
    totalUsers: 10482,
    activeUsers: 8934,
    newUsers: 201,
    userGrowth: 12.5,
    retentionRate: 85.2,
    avgSessionTime: '24m 32s',
  }

  const courseMetrics = {
    totalCourses: 1429,
    activeCourses: 1205,
    completionRate: 73.4,
    avgRating: 4.6,
    totalEnrollments: 45678,
    enrollmentGrowth: 18.3,
  }

  const revenueMetrics = {
    totalRevenue: 89400,
    monthlyRevenue: 12500,
    revenueGrowth: 25.7,
    avgOrderValue: 89.99,
    conversionRate: 3.2,
    refundRate: 2.1,
  }

  const topCourses = [
    {
      id: 1,
      title: 'React Fundamentals',
      enrollments: 2340,
      revenue: 23400,
      rating: 4.8,
    },
    {
      id: 2,
      title: 'JavaScript Mastery',
      enrollments: 1890,
      revenue: 18900,
      rating: 4.7,
    },
    {
      id: 3,
      title: 'Python for Beginners',
      enrollments: 1650,
      revenue: 16500,
      rating: 4.6,
    },
    {
      id: 4,
      title: 'UI/UX Design',
      enrollments: 1420,
      revenue: 14200,
      rating: 4.5,
    },
    {
      id: 5,
      title: 'Data Science',
      enrollments: 1200,
      revenue: 24000,
      rating: 4.9,
    },
  ]

  const userActivity = [
    { period: 'Today', users: 2340, sessions: 3450, pageViews: 12500 },
    { period: 'Yesterday', users: 2180, sessions: 3200, pageViews: 11800 },
    { period: 'This Week', users: 15600, sessions: 23400, pageViews: 89000 },
    { period: 'Last Week', users: 14200, sessions: 21800, pageViews: 82000 },
    { period: 'This Month', users: 62400, sessions: 94500, pageViews: 356000 },
    { period: 'Last Month', users: 58900, sessions: 89200, pageViews: 334000 },
  ]

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Analytics Dashboard</h1>
        <p className='text-muted-foreground mt-2'>
          Comprehensive insights into platform performance and user behavior.
        </p>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='courses'>Courses</TabsTrigger>
          <TabsTrigger value='revenue'>Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          {/* Key Metrics Overview */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Users
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {userMetrics.totalUsers.toLocaleString()}
                </div>
                <div className='flex items-center text-xs text-green-600'>
                  <TrendingUp className='h-3 w-3 mr-1' />+
                  {userMetrics.userGrowth}% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Courses
                </CardTitle>
                <BookOpen className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {courseMetrics.totalCourses.toLocaleString()}
                </div>
                <div className='flex items-center text-xs text-green-600'>
                  <TrendingUp className='h-3 w-3 mr-1' />+
                  {courseMetrics.enrollmentGrowth}% enrollments
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Revenue
                </CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ${revenueMetrics.totalRevenue.toLocaleString()}
                </div>
                <div className='flex items-center text-xs text-green-600'>
                  <TrendingUp className='h-3 w-3 mr-1' />+
                  {revenueMetrics.revenueGrowth}% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Completion Rate
                </CardTitle>
                <Award className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {courseMetrics.completionRate}%
                </div>
                <div className='flex items-center text-xs text-green-600'>
                  <TrendingUp className='h-3 w-3 mr-1' />
                  +2.3% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>
                Courses with highest enrollments and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {topCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex items-center space-x-4'>
                      <Badge variant='outline'>#{index + 1}</Badge>
                      <div>
                        <h4 className='font-medium'>{course.title}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {course.enrollments.toLocaleString()} enrollments •
                          Rating: {course.rating}/5
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='font-medium'>
                        ${course.revenue.toLocaleString()}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Platform usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-3'>
                {userActivity.slice(0, 3).map(activity => (
                  <div
                    key={activity.period}
                    className='text-center p-4 border rounded-lg'
                  >
                    <div className='text-2xl font-bold'>
                      {activity.users.toLocaleString()}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {activity.period}
                    </div>
                    <div className='text-xs text-muted-foreground mt-1'>
                      {activity.sessions.toLocaleString()} sessions
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='users' className='space-y-4'>
          {/* User Analytics */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Users
                </CardTitle>
                <Activity className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {userMetrics.activeUsers.toLocaleString()}
                </div>
                <Progress
                  value={
                    (userMetrics.activeUsers / userMetrics.totalUsers) * 100
                  }
                  className='mt-2'
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  {(
                    (userMetrics.activeUsers / userMetrics.totalUsers) *
                    100
                  ).toFixed(1)}
                  % of total users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Retention Rate
                </CardTitle>
                <Target className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {userMetrics.retentionRate}%
                </div>
                <Progress value={userMetrics.retentionRate} className='mt-2' />
                <p className='text-xs text-muted-foreground mt-1'>
                  30-day retention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Avg Session Time
                </CardTitle>
                <Clock className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {userMetrics.avgSessionTime}
                </div>
                <div className='flex items-center text-xs text-green-600 mt-1'>
                  <TrendingUp className='h-3 w-3 mr-1' />
                  +5.2% from last week
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Activity Timeline</CardTitle>
              <CardDescription>
                Detailed user engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {userActivity.map(activity => (
                  <div
                    key={activity.period}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex items-center space-x-4'>
                      <Calendar className='h-5 w-5 text-muted-foreground' />
                      <div>
                        <h4 className='font-medium'>{activity.period}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {activity.users.toLocaleString()} unique users
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='font-medium'>
                        {activity.sessions.toLocaleString()}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Sessions
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='font-medium'>
                        {activity.pageViews.toLocaleString()}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Page Views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='courses' className='space-y-4'>
          {/* Course Analytics */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Courses
                </CardTitle>
                <BookOpen className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {courseMetrics.activeCourses.toLocaleString()}
                </div>
                <Progress
                  value={
                    (courseMetrics.activeCourses / courseMetrics.totalCourses) *
                    100
                  }
                  className='mt-2'
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Completion Rate
                </CardTitle>
                <Award className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {courseMetrics.completionRate}%
                </div>
                <Progress
                  value={courseMetrics.completionRate}
                  className='mt-2'
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Average Rating
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {courseMetrics.avgRating}/5
                </div>
                <div className='flex items-center text-xs text-green-600 mt-1'>
                  <TrendingUp className='h-3 w-3 mr-1' />
                  +0.2 from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Enrollments
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {courseMetrics.totalEnrollments.toLocaleString()}
                </div>
                <div className='flex items-center text-xs text-green-600 mt-1'>
                  <TrendingUp className='h-3 w-3 mr-1' />+
                  {courseMetrics.enrollmentGrowth}% this month
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>
                Detailed course analytics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {topCourses.map(course => (
                  <div
                    key={course.id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='w-12 h-12 bg-muted rounded-lg flex items-center justify-center'>
                        <BookOpen className='h-6 w-6' />
                      </div>
                      <div>
                        <h4 className='font-medium'>{course.title}</h4>
                        <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                          <span>
                            {course.enrollments.toLocaleString()} enrollments
                          </span>
                          <span>Rating: {course.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='font-medium'>
                        ${course.revenue.toLocaleString()}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='revenue' className='space-y-4'>
          {/* Revenue Analytics */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Monthly Revenue
                </CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ${revenueMetrics.monthlyRevenue.toLocaleString()}
                </div>
                <div className='flex items-center text-xs text-green-600 mt-1'>
                  <TrendingUp className='h-3 w-3 mr-1' />+
                  {revenueMetrics.revenueGrowth}% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Avg Order Value
                </CardTitle>
                <Target className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ${revenueMetrics.avgOrderValue}
                </div>
                <div className='flex items-center text-xs text-green-600 mt-1'>
                  <TrendingUp className='h-3 w-3 mr-1' />
                  +8.5% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Conversion Rate
                </CardTitle>
                <Eye className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {revenueMetrics.conversionRate}%
                </div>
                <Progress
                  value={revenueMetrics.conversionRate}
                  className='mt-2'
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Refund Rate
                </CardTitle>
                <TrendingDown className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {revenueMetrics.refundRate}%
                </div>
                <div className='flex items-center text-xs text-red-600 mt-1'>
                  <TrendingDown className='h-3 w-3 mr-1' />
                  -0.3% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Course</CardTitle>
              <CardDescription>Top revenue generating courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {topCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex items-center space-x-4'>
                      <Badge variant='outline'>#{index + 1}</Badge>
                      <div>
                        <h4 className='font-medium'>{course.title}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {course.enrollments.toLocaleString()} enrollments
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold'>
                        ${course.revenue.toLocaleString()}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        ${(course.revenue / course.enrollments).toFixed(2)} per
                        enrollment
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
