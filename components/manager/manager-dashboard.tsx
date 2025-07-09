'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import dashboardApi from '@/services/dashboard-api'
import { DashboardManagerData, DashboardManagerResponse } from '@/types/dashboard'
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  DollarSign,
  Minus,
  PlusCircle,
  Settings,
  Tags,
  Target,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ManagerDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardManagerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dashboardApi.getManagerDashboard()
      .then((res: DashboardManagerResponse) => setData(res.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading dashboard...</div>
  if (error) return <div>{error}</div>
  if (!data) return <div>No dashboard data</div>

  // Analytics cards (from API)
  const analyticsCards = [
    {
      title: 'Total Categories',
      value: data.totalCategories,
      change: `${data.categoryGrowth > 0 ? '+' : ''}${data.categoryGrowth}% from last month`,
      icon: Settings,
      onClick: () => router.push('/manager/categories'),
      trend: data.categoryGrowth > 0 ? 'up' : 'down',
    },
    {
      title: 'Total Courses',
      value: data.totalCourses,
      change: `${data.courseGrowth > 0 ? '+' : ''}${data.courseGrowth}% from last month`,
      icon: BookOpen,
      onClick: () => router.push('/manager/courses'),
      trend: data.courseGrowth > 0 ? 'up' : 'down',
    },
    {
      title: 'Total Students',
      value: data.totalStudents,
      change: `${data.studentGrowth > 0 ? '+' : ''}${data.studentGrowth}% from last month`,
      icon: Users,
      onClick: () => router.push('/manager/students'),
      trend: data.studentGrowth > 0 ? 'up' : 'down',
    },
    {
      title: 'Revenue',
      value: `$${data.totalRevenue.toLocaleString()}`,
      change: `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth}% from last month`,
      icon: DollarSign,
      onClick: () => router.push('/manager/payments'),
      trend: data.revenueGrowth > 0 ? 'up' : 'down',
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
      title: 'View Students',
      description: 'Monitor student progress',
      icon: Users,
      onClick: () => router.push('/manager/students'),
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
    { period: 'This Month', amount: `$${data.totalRevenue.toLocaleString()}`, change: `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth}%` },
    { period: 'Last Month', amount: `$${data.totalLastMonthRevenue.toLocaleString()}`, change: `${data.lastMonthRevenueGrowth > 0 ? '+' : ''}${data.lastMonthRevenueGrowth}%` },
    { period: '3 Months Ago', amount: `$${data.totalThreeMonthsAgoRevenue.toLocaleString()}`, change: `${data.threeMonthsAgoRevenueGrowth > 0 ? '+' : ''}${data.threeMonthsAgoRevenueGrowth}%` },
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
        <Button
          onClick={() => router.push('/manager/analytics')}
          className='gap-2'
        >
          <BarChart3 className='h-4 w-4' />
          View Full Analytics
          <ArrowUpRight className='h-4 w-4' />
        </Button>
      </div>

      {/* Analytics Cards */}
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


      {/* Statistics Charts */}
      {/* Row 1: Quick Actions | Revenue Chart */}
      <div className="grid md:grid-cols-3 gap-6 mt-8 items-stretch">
        {/* Quick Actions */}
        <Card className="w-full h-full flex flex-col justify-center shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 transition group shadow-sm"
                  style={{ minHeight: 48 }}
                >
                  <span className="flex items-center justify-center rounded-full bg-gray-200 group-hover:bg-primary/10 transition w-10 h-10">
                    <action.icon className="h-6 w-6 text-primary" />
                  </span>
                  <span className="flex flex-col text-left">
                    <span className="font-semibold text-sm">{action.title}</span>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Revenue Chart (expand) */}
        <Card className="w-full h-full md:col-span-2 shadow-sm border border-gray-200 flex flex-col">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <DollarSign className="h-5 w-5 text-primary" />
              Revenue Chart
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center">
            <div className="w-full h-64 md:h-72 flex items-center">
              <RevenueLineChart data={data.monthlyRevenue || []} />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Row 2: New Courses Chart | Student Enrollment Area Chart */}
      <div className="grid md:grid-cols-2 gap-6 mt-8 items-stretch">
        {/* New Courses Chart */}
        <Card className="w-full h-full shadow-sm border border-gray-200 flex flex-col">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <BarChart3 className="h-5 w-5 text-primary" />
              New Courses Chart
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center">
            <div className="w-full h-64 md:h-72 flex items-center">
              <NewCoursesBarChart data={data.monthlyNewCourses || []} />
            </div>
          </CardContent>
        </Card>
        {/* Student Enrollment Area Chart */}
        <Card className="w-full h-full shadow-sm border border-gray-200 flex flex-col">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Users className="h-5 w-5 text-primary" />
              Student Enrollment (Yearly Area Chart)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center">
            <div className="w-full h-64 md:h-72 flex items-center">
              <StudentEnrollmentAreaChart data={data.monthlyStudentEnrollments || []} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Course Performance */}
        <Card
          className='cursor-pointer transition-all hover:shadow-md'
          onClick={() => router.push('/manager/analytics')}
        >
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <Target className='h-5 w-5' />
                Course Performance
              </span>
              <ArrowUpRight className='h-4 w-4 text-muted-foreground' />
            </CardTitle>
            <CardDescription>Top performing courses this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {(data.topCourses && data.topCourses.length > 0) ? (
                data.topCourses.map((course, index) => (
                  <div key={index} className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>{course.name}</p>
                    </div>
                    <div className='flex items-center gap-1'>
                      <span className='text-sm text-muted-foreground'>{course.students} students</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-muted-foreground text-sm'>No course data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Insights */}
        <Card
          className='cursor-pointer transition-all hover:shadow-md'
          onClick={() => router.push('/manager/analytics')}
        >
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' />
                Revenue Insights
              </span>
              <ArrowUpRight className='h-4 w-4 text-muted-foreground' />
            </CardTitle>
            <CardDescription>Monthly revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {revenueInsights.map((period, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium'>{period.period}</p>
                    <p className='text-sm text-muted-foreground'>
                      {period.change} growth
                    </p>
                  </div>
                  <span className='text-lg font-bold'>{period.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// RevenueLineChart: SVG line chart responsive
function RevenueLineChart({ data }: { data: number[] }) {
  if (!data || data.length === 0) return <div className="text-center w-full">No data</div>;
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
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none" className="w-full h-full">
      {/* Đường biểu đồ */}
      <polyline
        fill="none"
        stroke="#222"
        strokeWidth="3"
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
      />
      {/* Chấm tròn từng mốc và giá trị tiền */}
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="#222" />
          {data[i] !== 0 && (
            <text
              x={x}
              y={y - 12}
              fontSize="10"
              fill="#222"
              textAnchor="middle"
              fontWeight="bold"
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
            textAnchor="middle"
            fontSize="12"
            fill="#888"
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
  if (!data || data.length === 0) return <div className="text-center w-full">No data</div>;
  const max = Math.max(...data)
  const padding = 32
  const w = 600
  const h = 200
  const barWidth = (w - 2 * padding) / data.length - 8
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none" className="w-full h-full">
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
              fill="#222"
              rx="4"
            />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize="12"
              fill="#222"
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
            textAnchor="middle"
            fontSize="12"
            fill="#888"
          >
            {i + 1}
          </text>
        )
      })}
      {/* Trục Y (giá trị) */}
      <text x={padding - 10} y={padding} fontSize="12" fill="#888" textAnchor="end">{max}</text>
      <text x={padding - 10} y={h - padding} fontSize="12" fill="#888" textAnchor="end">0</text>
    </svg>
  )
}

// AreaChart: SVG area chart for student enrollments per month
function StudentEnrollmentAreaChart({ data }: { data: number[] }) {
  if (!data || data.length === 0) return <div className="text-center w-full">No data</div>;
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
    'Z'
  ].join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none" className="w-full h-full">
      {/* Area fill */}
      <path d={areaPath} fill="#000" fillOpacity="0.2" stroke="none" />
      {/* Line */}
      <polyline
        fill="none"
        stroke="#000"
        strokeWidth="3"
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
      />
      {/* Dots và số lượng sinh viên trên mỗi chấm */}
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="#000" />
          {data[i] !== 0 && (
            <text
              x={x}
              y={y - 12}
              fontSize="10"
              fill="#000"
              textAnchor="middle"
              fontWeight="bold"
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
            textAnchor="middle"
            fontSize="12"
            fill="#888"
          >
            {i + 1}
          </text>
        )
      })}
      {/* Y axis (values) */}
      <text x={padding - 10} y={padding} fontSize="12" fill="#888" textAnchor="end">{max}</text>
      <text x={padding - 10} y={h - padding} fontSize="12" fill="#888" textAnchor="end">{min}</text>
    </svg>
  )
}
