'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import dashboardApi, {
  getManagerDashboardStats,
  getNewCoursesChartByYear,
  getRevenueChartByYear,
  getRevenueInsightsByMonthYear,
  getStudentEnrollmentChartByYear,
  getTopCoursesByMonthYear,
} from '@/services/dashboard-api'
import {
  DashboardManagerData,
  DashboardManagerResponse,
} from '@/types/dashboard'
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  DollarSign,
  Minus,
  PlusCircle,
  RefreshCw,
  Settings,
  Tags,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ManagerDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardManagerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // State cho filter 4 thẻ đầu
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  )
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )
  const [filterLoading, setFilterLoading] = useState(false)
  const [filteredStats, setFilteredStats] =
    useState<DashboardManagerData | null>(null)

  // State cho từng năm và dữ liệu của từng biểu đồ
  const [revenueYear, setRevenueYear] = useState<number>(
    new Date().getFullYear()
  )
  const [revenueChart, setRevenueChart] = useState<number[] | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [revenueError, setRevenueError] = useState<string | null>(null)

  const [coursesYear, setCoursesYear] = useState<number>(
    new Date().getFullYear()
  )
  const [coursesChart, setCoursesChart] = useState<number[] | null>(null)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [coursesError, setCoursesError] = useState<string | null>(null)

  const [enrollYear, setEnrollYear] = useState<number>(new Date().getFullYear())
  const [enrollChart, setEnrollChart] = useState<number[] | null>(null)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  // State cho filter Course Performance
  const [coursePerfMonth, setCoursePerfMonth] = useState<number>(
    new Date().getMonth() + 1
  )
  const [coursePerfYear, setCoursePerfYear] = useState<number>(
    new Date().getFullYear()
  )
  const [coursePerfData, setCoursePerfData] = useState<any[] | null>(null)
  const [coursePerfLoading, setCoursePerfLoading] = useState(false)
  const [coursePerfError, setCoursePerfError] = useState<string | null>(null)

  // State cho filter Revenue Insights
  const [revenueInsightsMonth, setRevenueInsightsMonth] = useState<number>(
    new Date().getMonth() + 1
  )
  const [revenueInsightsYear, setRevenueInsightsYear] = useState<number>(
    new Date().getFullYear()
  )
  const [revenueInsightsData, setRevenueInsightsData] =
    useState<DashboardManagerData | null>(null)
  const [revenueInsightsLoading, setRevenueInsightsLoading] = useState(false)
  const [revenueInsightsError, setRevenueInsightsError] = useState<
    string | null
  >(null)

  // Lấy data mặc định ban đầu
  useEffect(() => {
    dashboardApi
      .getManagerDashboard()
      .then((res: DashboardManagerResponse) => setData(res.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  // Khi đổi năm từng biểu đồ
  useEffect(() => {
    if (!data) return
    setRevenueLoading(true)
    setRevenueError(null)
    getRevenueChartByYear(revenueYear)
      .then(res =>
        setRevenueChart(res && res.length ? res : data.monthlyRevenue)
      )
      .catch(() => {
        setRevenueError('Failed to load revenue data')
        setRevenueChart(data.monthlyRevenue)
      })
      .finally(() => setRevenueLoading(false))
  }, [revenueYear, data])

  useEffect(() => {
    if (!data) return
    setCoursesLoading(true)
    setCoursesError(null)
    getNewCoursesChartByYear(coursesYear)
      .then(res =>
        setCoursesChart(res && res.length ? res : data.monthlyNewCourses)
      )
      .catch(() => {
        setCoursesError('Failed to load new courses data')
        setCoursesChart(data.monthlyNewCourses)
      })
      .finally(() => setCoursesLoading(false))
  }, [coursesYear, data])

  useEffect(() => {
    if (!data) return
    setEnrollLoading(true)
    setEnrollError(null)
    getStudentEnrollmentChartByYear(enrollYear)
      .then(res =>
        setEnrollChart(res && res.length ? res : data.monthlyStudentEnrollments)
      )
      .catch(() => {
        setEnrollError('Failed to load enrollment data')
        setEnrollChart(data.monthlyStudentEnrollments)
      })
      .finally(() => setEnrollLoading(false))
  }, [enrollYear, data])

  // Khi đổi filter Course Performance
  useEffect(() => {
    if (!data) return
    setCoursePerfLoading(true)
    setCoursePerfError(null)
    getTopCoursesByMonthYear(coursePerfMonth, coursePerfYear)
      .then(res => {
        if (res && res.length) {
          setCoursePerfData(res)
        } else {
          // Nếu không có data, lấy top 3 course nhiều người enroll nhất, set students = 0
          const top3 = (data.topCourses || []).slice(0, 3).map(course => ({
            ...course,
            students: 0,
          }))
          setCoursePerfData(top3)
        }
      })
      .catch(() => {
        setCoursePerfError('Failed to load top courses data')
        const top3 = (data.topCourses || []).slice(0, 3).map(course => ({
          ...course,
          students: 0,
        }))
        setCoursePerfData(top3)
      })
      .finally(() => setCoursePerfLoading(false))
  }, [coursePerfMonth, coursePerfYear, data])

  // Khi đổi filter Revenue Insights
  useEffect(() => {
    if (!data) return
    setRevenueInsightsLoading(true)
    setRevenueInsightsError(null)
    getRevenueInsightsByMonthYear(revenueInsightsMonth, revenueInsightsYear)
      .then(res => {
        if ('data' in res) {
          setRevenueInsightsData(res.data)
        } else {
          setRevenueInsightsData(res as DashboardManagerData)
        }
      })
      .catch(() => {
        setRevenueInsightsError('Failed to load revenue insights data')
        setRevenueInsightsData(data)
      })
      .finally(() => setRevenueInsightsLoading(false))
  }, [revenueInsightsMonth, revenueInsightsYear, data])

  const handleFilter = () => {
    setFilterLoading(true)
    setError(null)
    getManagerDashboardStats(selectedMonth, selectedYear)
      .then((res: DashboardManagerResponse) => {
        if (res && res.data) {
          setFilteredStats(res.data)
        } else {
          setError('No data available for this month/year')
        }
      })
      .catch(() => setError('Failed to load data for this month/year'))
      .finally(() => setFilterLoading(false))
  }

  if (loading) return <div>Loading dashboard...</div>
  if (error) return <div>{error}</div>
  if (!data) return <div>No dashboard data</div>

  // Dữ liệu cho 4 thẻ đầu: nếu filter thì lấy filteredStats, không thì lấy data gốc
  const statsData = filteredStats || data

  // Analytics cards (from API)
  const analyticsCards = [
    {
      title: 'Total Categories',
      value: statsData.totalCategories,
      change: `${statsData.categoryGrowth > 0 ? '+' : ''}${statsData.categoryGrowth}% from last month`,
      icon: Settings,
      onClick: () => router.push('/manager/categories'),
      trend: statsData.categoryGrowth > 0 ? 'up' : 'down',
    },
    {
      title: 'Total Courses',
      value: statsData.totalCourses,
      change: `${statsData.courseGrowth > 0 ? '+' : ''}${statsData.courseGrowth}% from last month`,
      icon: BookOpen,
      onClick: () => router.push('/manager/courses'),
      trend: statsData.courseGrowth > 0 ? 'up' : 'down',
    },
    {
      title: 'Total Students',
      value: statsData.totalStudents,
      change: `${statsData.studentGrowth > 0 ? '+' : ''}${statsData.studentGrowth}% from last month`,
      icon: Users,
      onClick: undefined, // Đã tắt điều hướng
      trend: statsData.studentGrowth > 0 ? 'up' : 'down',
    },
    {
      title: 'Revenue',
      value: `$${statsData.totalRevenue.toLocaleString()}`,
      change: `${statsData.revenueGrowth > 0 ? '+' : ''}${statsData.revenueGrowth}% from last month`,
      icon: DollarSign,
      onClick: () => router.push('/manager/payments'),
      trend: statsData.revenueGrowth > 0 ? 'up' : 'down',
    },
  ]

  // Quick action buttons with navigation
  const quickActions = [
    {
      title: 'Create New Course',
      description: 'Start building your next course',
      icon: PlusCircle,
      onClick: () => router.push('/manager/create'),
      variant: 'default' as const,
    },
    {
      title: 'Manage Categories',
      description: 'Organize course categories',
      icon: Tags,
      onClick: () => router.push('/manager/categories'),
      variant: 'outline' as const,
    },
    {
      title: 'Manage Courses',
      description: 'Edit and organize your courses',
      icon: BookOpen,
      onClick: () => router.push('/manager/courses'),
      variant: 'outline' as const,
    },
    {
      title: 'View Coupons',
      description: 'View and manage coupons',
      icon: Tags,
      onClick: () => router.push('/manager/coupons'),
      variant: 'outline' as const,
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed insights',
      icon: BarChart3,
      onClick: () => router.push('/manager/analytics'),
      variant: 'outline' as const,
    },
  ]

  // Revenue insights (from API)
  const revenueInsights = [
    {
      period: 'This Month',
      amount: `$${data.totalRevenue.toLocaleString()}`,
      change: `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth}%`,
    },
    {
      period: 'Last Month',
      amount: `$${data.totalLastMonthRevenue.toLocaleString()}`,
      change: `${data.lastMonthRevenueGrowth > 0 ? '+' : ''}${data.lastMonthRevenueGrowth}%`,
    },
    {
      period: '3 Months Ago',
      amount: `$${data.totalThreeMonthsAgoRevenue.toLocaleString()}`,
      change: `${data.threeMonthsAgoRevenueGrowth > 0 ? '+' : ''}${data.threeMonthsAgoRevenueGrowth}%`,
    },
  ]

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Manager Dashboard</h1>
          <p className='text-muted-foreground mt-2'>
            Welcome back! Here's an overview of your course management
            activities.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={() => router.push('/manager/analytics')}
            className='gap-2'
          >
            <BarChart3 className='h-4 w-4' />
            View Full Analytics
            <ArrowUpRight className='h-4 w-4' />
          </Button>
          <Button
            onClick={() => {
              setLoading(true)
              setError(null)
              dashboardApi
                .getManagerDashboard()
                .then((res: DashboardManagerResponse) => setData(res.data))
                .catch(() => setError('Failed to load dashboard data'))
                .finally(() => setLoading(false))
            }}
            variant='outline'
            disabled={loading}
            className='gap-2'
            title='Refresh dashboard'
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards + Filter */}
      <div>
        {/* Filter tháng/năm chỉ cho 4 thẻ */}
        <div className='flex justify-end mb-2 gap-2'>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className='border rounded px-2 py-1'
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Month {i + 1}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className='border rounded px-2 py-1'
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            })}
          </select>
          <Button
            onClick={handleFilter}
            disabled={filterLoading}
            className='ml-2'
          >
            {filterLoading ? 'Loading...' : 'Filter'}
          </Button>
        </div>
        {error && (
          <div className='text-red-500 text-sm text-right mb-2'>{error}</div>
        )}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {analyticsCards.map((card, index) => (
            <Card
              key={index}
              className='cursor-pointer transition-all hover:shadow-md hover:scale-105'
              onClick={card.onClick}
            >
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {card.title}
                </CardTitle>
                <div className='flex items-center gap-2'>
                  <card.icon className='h-4 w-4 text-muted-foreground' />
                  <ArrowUpRight className='h-3 w-3 text-muted-foreground opacity-50' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{card.value}</div>
                <p className='text-xs text-muted-foreground flex items-center gap-1'>
                  {/* Hiển thị icon xu hướng tăng/giảm/không đổi */}
                  {parseFloat(card.change) > 0 && (
                    <TrendingUp className='h-3 w-3 text-green-500' />
                  )}
                  {parseFloat(card.change) < 0 && (
                    <TrendingDown className='h-3 w-3 text-red-500' />
                  )}
                  {parseFloat(card.change) === 0 && (
                    <Minus className='h-3 w-3 text-gray-500' />
                  )}
                  {card.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics Charts */}
      {/* Row 1: Quick Actions | Revenue Chart */}
      <div className='grid md:grid-cols-3 gap-6 mt-8 items-stretch'>
        {/* Quick Actions */}
        <Card className='w-full h-full flex flex-col justify-center shadow-sm border border-gray-200'>
          <CardHeader className='border-b border-gray-100 pb-3'>
            <CardTitle className='text-lg font-bold'>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-3'>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className='flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 transition group shadow-sm'
                  style={{ minHeight: 48 }}
                >
                  <span className='flex items-center justify-center rounded-full bg-gray-200 group-hover:bg-primary/10 transition w-10 h-10'>
                    <action.icon className='h-6 w-6 text-primary' />
                  </span>
                  <span className='flex flex-col text-left'>
                    <span className='font-semibold text-sm'>
                      {action.title}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {action.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Revenue Chart (expand) */}
        <Card className='w-full h-full md:col-span-2 shadow-sm border border-gray-200 flex flex-col'>
          <CardHeader className='border-b border-gray-100 pb-3 flex flex-row items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-lg font-bold'>
              <DollarSign className='h-5 w-5 text-primary' />
              Revenue Chart
            </CardTitle>
            <div>
              <select
                value={revenueYear}
                onChange={e => setRevenueYear(Number(e.target.value))}
                className='border rounded px-2 py-1 text-sm'
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>
          </CardHeader>
          <CardContent className='flex-1 flex items-center'>
            <div className='w-full h-64 md:h-72 flex items-center'>
              {revenueLoading ? (
                <div className='w-full text-center'>Loading...</div>
              ) : (
                <RevenueLineChart
                  data={revenueChart || data?.monthlyRevenue || []}
                />
              )}
            </div>
            {revenueError && (
              <div className='text-red-500 text-xs text-right mt-1'>
                {revenueError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Row 2: New Courses Chart | Student Enrollment Area Chart */}
      <div className='grid md:grid-cols-2 gap-6 mt-8 items-stretch'>
        {/* New Courses Chart */}
        <Card className='w-full h-full shadow-sm border border-gray-200 flex flex-col'>
          <CardHeader className='border-b border-gray-100 pb-3 flex flex-row items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-lg font-bold'>
              <BarChart3 className='h-5 w-5 text-primary' />
              New Courses Chart
            </CardTitle>
            <div>
              <select
                value={coursesYear}
                onChange={e => setCoursesYear(Number(e.target.value))}
                className='border rounded px-2 py-1 text-sm'
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>
          </CardHeader>
          <CardContent className='flex-1 flex items-center'>
            <div className='w-full h-64 md:h-72 flex items-center'>
              {coursesLoading ? (
                <div className='w-full text-center'>Loading...</div>
              ) : (
                <NewCoursesBarChart
                  data={coursesChart || data?.monthlyNewCourses || []}
                />
              )}
            </div>
            {coursesError && (
              <div className='text-red-500 text-xs text-right mt-1'>
                {coursesError}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Student Enrollment Area Chart */}
        <Card className='w-full h-full shadow-sm border border-gray-200 flex flex-col'>
          <CardHeader className='border-b border-gray-100 pb-3 flex flex-row items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-lg font-bold'>
              <Users className='h-5 w-5 text-primary' />
              Student Enrollment (Yearly Area Chart)
            </CardTitle>
            <div>
              <select
                value={enrollYear}
                onChange={e => setEnrollYear(Number(e.target.value))}
                className='border rounded px-2 py-1 text-sm'
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>
          </CardHeader>
          <CardContent className='flex-1 flex items-center'>
            <div className='w-full h-64 md:h-72 flex items-center'>
              {enrollLoading ? (
                <div className='w-full text-center'>Loading...</div>
              ) : (
                <StudentEnrollmentAreaChart
                  data={enrollChart || data?.monthlyStudentEnrollments || []}
                />
              )}
            </div>
            {enrollError && (
              <div className='text-red-500 text-xs text-right mt-1'>
                {enrollError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Course Performance */}
        <Card className='cursor-pointer transition-all hover:shadow-md'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <Target className='h-5 w-5' />
                Course Performance
              </span>
              <div className='flex items-center gap-2 ml-auto'>
                <select
                  value={coursePerfMonth}
                  onChange={e => setCoursePerfMonth(Number(e.target.value))}
                  className='border rounded px-2 py-1 text-sm'
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Month {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={coursePerfYear}
                  onChange={e => setCoursePerfYear(Number(e.target.value))}
                  className='border rounded px-2 py-1 text-sm'
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
            <CardDescription>Top performing courses this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {coursePerfLoading ? (
                <div className='text-center text-muted-foreground'>
                  Loading...
                </div>
              ) : coursePerfData && coursePerfData.length > 0 ? (
                coursePerfData.map((course, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between'
                  >
                    <div>
                      <p className='font-medium'>{course.name}</p>
                    </div>
                    <div className='flex items-center gap-1'>
                      <span className='text-sm text-muted-foreground'>
                        {course.students} students
                      </span>
                    </div>
                  </div>
                ))
              ) : null}
              {coursePerfError && (
                <div className='text-red-500 text-xs text-right mt-1'>
                  {coursePerfError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Revenue Insights */}
        <Card className='cursor-pointer transition-all hover:shadow-md'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' />
                Revenue Insights
              </span>
              <div className='flex items-center gap-2 ml-auto'>
                <select
                  value={revenueInsightsMonth}
                  onChange={e =>
                    setRevenueInsightsMonth(Number(e.target.value))
                  }
                  className='border rounded px-2 py-1 text-sm'
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Month {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={revenueInsightsYear}
                  onChange={e => setRevenueInsightsYear(Number(e.target.value))}
                  className='border rounded px-2 py-1 text-sm'
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
            <CardDescription>Monthly revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {revenueInsightsLoading ? (
                <div className='text-center text-muted-foreground'>
                  Loading...
                </div>
              ) : (
                <>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>This Month</p>
                      <p className='text-sm text-muted-foreground'>
                        {revenueInsightsData?.revenueGrowth ??
                          data?.revenueGrowth}
                        % growth
                      </p>
                    </div>
                    <span className='text-lg font-bold'>
                      $
                      {revenueInsightsData?.totalRevenue?.toLocaleString() ??
                        data?.totalRevenue?.toLocaleString() ??
                        0}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Last Month</p>
                      <p className='text-sm text-muted-foreground'>
                        {revenueInsightsData?.lastMonthRevenueGrowth ??
                          data?.lastMonthRevenueGrowth}
                        % growth
                      </p>
                    </div>
                    <span className='text-lg font-bold'>
                      $
                      {revenueInsightsData?.totalLastMonthRevenue?.toLocaleString() ??
                        data?.totalLastMonthRevenue?.toLocaleString() ??
                        0}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>2 Months Ago</p>
                      <p className='text-sm text-muted-foreground'>
                        {revenueInsightsData?.threeMonthsAgoRevenueGrowth ??
                          data?.threeMonthsAgoRevenueGrowth}
                        % growth
                      </p>
                    </div>
                    <span className='text-lg font-bold'>
                      $
                      {revenueInsightsData?.totalThreeMonthsAgoRevenue?.toLocaleString() ??
                        data?.totalThreeMonthsAgoRevenue?.toLocaleString() ??
                        0}
                    </span>
                  </div>
                </>
              )}
              {revenueInsightsError && (
                <div className='text-red-500 text-xs text-right mt-1'>
                  {revenueInsightsError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// RevenueLineChart: SVG line chart responsive
function RevenueLineChart({ data }: { data: number[] }) {
  if (!data || data.length === 0)
    return <div className='text-center w-full'>No data</div>
  const max = Math.max(...data)
  const min = Math.min(...data)
  const padding = 32
  const w = 600
  const h = 200
  const points = data.map((v, i) => {
    const x = padding + (i * (w - 2 * padding)) / (data.length - 1)
    const y = h - padding - ((v - min) / (max - min || 1)) * (h - 2 * padding)
    return [x, y]
  })
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width='100%'
      height='100%'
      preserveAspectRatio='none'
      className='w-full h-full'
    >
      {/* Đường biểu đồ */}
      <polyline
        fill='none'
        stroke='#222'
        strokeWidth='3'
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
      />
      {/* Chấm tròn từng mốc và giá trị tiền */}
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r='5' fill='#222' />
          {data[i] !== 0 && (
            <text
              x={x}
              y={y - 12}
              fontSize='10'
              fill='#222'
              textAnchor='middle'
              fontWeight='bold'
              style={{ pointerEvents: 'none' }}
            >
              {data[i].toLocaleString()}$
            </text>
          )}
        </g>
      ))}
      {/* Trục X (tháng) */}
      {data.map((_, i) => {
        const x = padding + (i * (w - 2 * padding)) / (data.length - 1)
        return (
          <text
            key={i}
            x={x}
            y={h - padding + 18}
            textAnchor='middle'
            fontSize='12'
            fill='#888'
          >
            {i + 1}
          </text>
        )
      })}
    </svg>
  )
}

// NewCoursesBarChart: SVG bar chart responsive
function NewCoursesBarChart({ data }: { data: number[] }) {
  if (!data || data.length === 0)
    return <div className='text-center w-full'>No data</div>
  const max = Math.max(...data)
  const padding = 32
  const w = 600
  const h = 200
  const barWidth = (w - 2 * padding) / data.length - 8
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width='100%'
      height='100%'
      preserveAspectRatio='none'
      className='w-full h-full'
    >
      {/* Cột */}
      {data.map((v, i) => {
        const x = padding + i * ((w - 2 * padding) / data.length)
        const y = h - padding - (v / (max || 1)) * (h - 2 * padding)
        const barH = (v / (max || 1)) * (h - 2 * padding)
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              fill='#222'
              rx='4'
            />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor='middle'
              fontSize='12'
              fill='#222'
            >
              {v}
            </text>
          </g>
        )
      })}
      {/* Trục X (tháng) */}
      {data.map((_, i) => {
        const x = padding + i * ((w - 2 * padding) / data.length) + barWidth / 2
        return (
          <text
            key={i}
            x={x}
            y={h - padding + 18}
            textAnchor='middle'
            fontSize='12'
            fill='#888'
          >
            {i + 1}
          </text>
        )
      })}
      {/* Trục Y (giá trị) */}
      <text
        x={padding - 10}
        y={padding}
        fontSize='12'
        fill='#888'
        textAnchor='end'
      >
        {max}
      </text>
      <text
        x={padding - 10}
        y={h - padding}
        fontSize='12'
        fill='#888'
        textAnchor='end'
      >
        0
      </text>
    </svg>
  )
}

// AreaChart: SVG area chart for student enrollments per month
function StudentEnrollmentAreaChart({ data }: { data: number[] }) {
  if (!data || data.length === 0)
    return <div className='text-center w-full'>No data</div>
  const max = Math.max(...data)
  const min = Math.min(...data)
  const padding = 32
  const w = 600
  const h = 200
  const points = data.map((v, i) => {
    const x = padding + (i * (w - 2 * padding)) / (data.length - 1)
    const y = h - padding - ((v - min) / (max - min || 1)) * (h - 2 * padding)
    return [x, y]
  })
  // Path for area
  const areaPath = [
    `M${points[0][0]},${h - padding}`,
    ...points.map(([x, y]) => `L${x},${y}`),
    `L${points[points.length - 1][0]},${h - padding}`,
    'Z',
  ].join(' ')
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width='100%'
      height='100%'
      preserveAspectRatio='none'
      className='w-full h-full'
    >
      {/* Area fill */}
      <path d={areaPath} fill='#000' fillOpacity='0.2' stroke='none' />
      {/* Line */}
      <polyline
        fill='none'
        stroke='#000'
        strokeWidth='3'
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
      />
      {/* Dots và số lượng sinh viên trên mỗi chấm */}
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r='5' fill='#000' />
          {data[i] !== 0 && (
            <text
              x={x}
              y={y - 12}
              fontSize='10'
              fill='#000'
              textAnchor='middle'
              fontWeight='bold'
              style={{ pointerEvents: 'none' }}
            >
              {data[i]}
            </text>
          )}
        </g>
      ))}
      {/* X axis (months) */}
      {data.map((_, i) => {
        const x = padding + (i * (w - 2 * padding)) / (data.length - 1)
        return (
          <text
            key={i}
            x={x}
            y={h - padding + 18}
            textAnchor='middle'
            fontSize='12'
            fill='#888'
          >
            {i + 1}
          </text>
        )
      })}
      {/* Y axis (values) */}
      <text
        x={padding - 10}
        y={padding}
        fontSize='12'
        fill='#888'
        textAnchor='end'
      >
        {max}
      </text>
      <text
        x={padding - 10}
        y={h - padding}
        fontSize='12'
        fill='#888'
        textAnchor='end'
      >
        {min}
      </text>
    </svg>
  )
}
