'use client'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ArrowUpRight,
    BarChart3,
    BookOpen,
    DollarSign,
    PlusCircle,
    Settings,
    Tags,
    Target,
    TrendingUp,
    Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ManagerDashboard() {
  const router = useRouter()

  // Analytics data with navigation handlers
  const analyticsCards = [
    {
      title: 'Total Categories',
      value: '15',
      change: '+1 from last month',
      icon: Settings,
      onClick: () => router.push('/manager/categories'),
      trend: 'up',
    },
    {
      title: 'Total Courses',
      value: '12',
      change: '+2 from last month',
      icon: BookOpen,
      onClick: () => router.push('/manager/courses'),
      trend: 'up',
    },
    {
      title: 'Total Students',
      value: '2,456',
      change: '+180 from last month',
      icon: Users,
      onClick: () => router.push('/manager/students'),
      trend: 'up',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+20.1% from last month',
      icon: DollarSign,
      onClick: () => router.push('/manager/analytics'),
      trend: 'up',
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
                <TrendingUp className='h-3 w-3 text-green-500' />
                {card.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics Charts */}
      <div className='grid gap-6 md:grid-cols-2 mt-8'>
        <Card className='w-full h-full'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5' />
              Revenue Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='w-full h-64 md:h-72 flex items-center'>
              <RevenueLineChart />
                </div>
          </CardContent>
        </Card>
        <Card className='w-full h-full'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              New Courses Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='w-full h-64 md:h-72 flex items-center'>
              <NewCoursesBarChart />
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
            <CardDescription>Top performing courses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[
                { name: 'React Fundamentals', students: 324, rating: 4.8 },
                { name: 'Advanced JavaScript', students: 256, rating: 4.7 },
                { name: 'CSS Mastery', students: 189, rating: 4.6 },
              ].map((course, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium'>{course.name}</p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span className='text-sm text-muted-foreground'>{course.students} students</span>
                  </div>
                </div>
              ))}
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
              {[
                { period: 'This Month', amount: '$15,420', change: '+12%' },
                { period: 'Last Month', amount: '$13,750', change: '+8%' },
                { period: '3 Months Ago', amount: '$12,680', change: '+15%' },
              ].map((period, index) => (
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
function RevenueLineChart() {
  // Dữ liệu mẫu: doanh thu từng tháng
  const data = [1200, 2100, 1800, 2500, 3000, 2800, 3500, 4000, 3700, 4200, 3900, 4500]
  const max = Math.max(...data)
  const min = Math.min(...data)
  const padding = 32
  const w = 600
  const h = 200
  const points = data.map((v, i) => {
    const x = padding + (i * (w - 2 * padding)) / (data.length - 1)
    const y = h - padding - ((v - min) / (max - min)) * (h - 2 * padding)
    return [x, y]
  })
  const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none" className="w-full h-full">
      {/* Đường biểu đồ */}
      <polyline
        fill="none"
        stroke="#222"
        strokeWidth="3"
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
      />
      {/* Chấm tròn từng mốc */}
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="#222" />
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
      {/* Trục Y (giá trị) */}
      <text x={padding - 10} y={padding} fontSize="12" fill="#888" textAnchor="end">{max}</text>
      <text x={padding - 10} y={h - padding} fontSize="12" fill="#888" textAnchor="end">{min}</text>
    </svg>
  )
}

// NewCoursesBarChart: SVG bar chart responsive
function NewCoursesBarChart() {
  // Dữ liệu mẫu: số khoá học mới từng tháng
  const data = [3, 5, 2, 6, 4, 7, 8, 5, 6, 9, 4, 7]
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
        const y = h - padding - (v / max) * (h - 2 * padding)
        const barH = (v / max) * (h - 2 * padding)
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
