'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Star,
  Download,
  RefreshCw,
  X,
  Maximize,
  Minimize,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { categoryApi } from '@/api/category-api'
import { CategoryChartDTO, CategoryDetailDTO } from '@/types/category'

const revenueData = [
  { month: 'Jan', revenue: 12400, enrollments: 234 },
  { month: 'Feb', revenue: 15600, enrollments: 289 },
  { month: 'Mar', revenue: 18900, enrollments: 356 },
  { month: 'Apr', revenue: 16700, enrollments: 312 },
  { month: 'May', revenue: 21300, enrollments: 398 },
  { month: 'Jun', revenue: 25100, enrollments: 445 },
]

const coursePerformanceData = [
  {
    course: 'React Fundamentals',
    enrollments: 1234,
    revenue: 24680,
    rating: 4.8,
  },
  {
    course: 'Advanced JavaScript',
    enrollments: 892,
    revenue: 35640,
    rating: 4.9,
  },
  { course: 'Node.js Backend', enrollments: 567, revenue: 17010, rating: 4.7 },
  { course: 'CSS Mastery', enrollments: 445, revenue: 13350, rating: 4.6 },
]

const studentActivityData = [
  { week: 'Week 1', active: 1200, new: 89 },
  { week: 'Week 2', active: 1350, new: 123 },
  { week: 'Week 3', active: 1180, new: 95 },
  { week: 'Week 4', active: 1420, new: 167 },
]

const categoryData = [
  { name: 'Web Development', value: 45, color: '#8884d8' },
  { name: 'Programming', value: 30, color: '#82ca9d' },
  { name: 'Backend', value: 15, color: '#ffc658' },
  { name: 'Design', value: 10, color: '#ff7300' },
]

// Màu sắc mặc định cho PieChart
const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#a4de6c',
  '#d0ed57',
  '#8dd1e1',
  '#d88884',
]

// Custom label cho PieChart để tránh dính chữ
const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  index,
  categoryName,
  percentage,
}: any) => {
  if (percentage === 0) return null
  const radius = outerRadius + 24
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill={COLORS[index % COLORS.length]}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline='central'
      fontSize={14}
    >
      {`${categoryName} ${percentage.toFixed(1)}%`}
    </text>
  )
}

// Hàm format ngày giờ: chỉ hiện ngày/tháng/năm và xuống dòng là giờ:phút:giây
function formatDateTime(dateString: string) {
  if (!dateString) return ''
  const d = new Date(dateString)
  const date = d.toLocaleDateString('en-GB') // dd/mm/yyyy
  const time = d.toLocaleTimeString('en-GB') // HH:mm:ss
  return (
    <span>
      {date}
      <br />
      {time}
    </span>
  )
}

export function ManagerAnalytics() {
  const [timeRange, setTimeRange] = useState('6m')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [open, setOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isFullscreenDetail, setIsFullscreenDetail] = useState(false)
  const [loadingCategory, setLoadingCategory] = useState(false)
  const [categoryChart, setCategoryChart] = useState<CategoryChartDTO[]>([])
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetailDTO[]>(
    []
  )
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => setIsExporting(false), 2000)
  }

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalEnrollments = revenueData.reduce(
    (sum, item) => sum + item.enrollments,
    0
  )
  const avgRating =
    coursePerformanceData.reduce((sum, item) => sum + item.rating, 0) /
    coursePerformanceData.length

  // Dữ liệu mẫu cho categories (bạn thay bằng API nếu có)
  const categories = [
    {
      categoryId: 1,
      categoryName: 'Web Development',
      description: 'All about web dev',
      courseCount: 10,
      averageRating: 4.8,
      totalStudents: 500,
      totalRevenue: 10000,
      createdDate: '2023-01-01',
      modifiedDate: '2023-06-01',
    },
    {
      categoryId: 2,
      categoryName: 'Programming',
      description: 'Programming basics',
      courseCount: 7,
      averageRating: 4.6,
      totalStudents: 300,
      totalRevenue: 7000,
      createdDate: '2023-02-01',
      modifiedDate: '2023-06-02',
    },
    // ... thêm các category khác nếu muốn
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoadingCategory(true)
      try {
        const [chart, details] = await Promise.all([
          categoryApi.getCategoryChart(),
          categoryApi.getCategoryDetails(),
        ])
        console.log('categoryChart', chart) // Log dữ liệu chart
        setCategoryChart(chart)
        setCategoryDetails(details)
      } finally {
        setLoadingCategory(false)
      }
    }
    fetchData()
  }, [])

  const filteredCategoryChart = categoryChart.filter(
    item => item.percentage > 0
  )

  // Pagination logic for detail table
  const totalRows = categoryDetails.length
  const totalPages = rowsPerPage === -1 ? 1 : Math.ceil(totalRows / rowsPerPage)
  const paginatedData =
    rowsPerPage === -1
      ? categoryDetails
      : categoryDetails.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Analytics Dashboard</h1>
          <p className='text-muted-foreground'>
            Track your course performance and student engagement
          </p>
        </div>
        <div className='flex space-x-2'>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7d'>Last 7 days</SelectItem>
              <SelectItem value='30d'>Last 30 days</SelectItem>
              <SelectItem value='90d'>Last 90 days</SelectItem>
              <SelectItem value='6m'>Last 6 months</SelectItem>
              <SelectItem value='1y'>Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download
              className={`mr-2 h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`}
            />
            Export
          </Button>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
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
              ${totalRevenue.toLocaleString('en-US')}
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='mr-1 h-3 w-3' />
              +12.5% from last period
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
              {totalEnrollments.toLocaleString('en-US')}
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='mr-1 h-3 w-3' />
              +8.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Courses
            </CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {coursePerformanceData.length}
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='mr-1 h-3 w-3' />
              +1 new this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Rating
            </CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{avgRating.toFixed(1)}</div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='mr-1 h-3 w-3' />
              +0.2 from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue='courses' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='courses'>Course Performance</TabsTrigger>
          <TabsTrigger value='activity'>Student Activity</TabsTrigger>
          <TabsTrigger value='trends'>Revenue Trends</TabsTrigger>
        </TabsList>

        <TabsContent value='courses' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Course Enrollments</CardTitle>
                <CardDescription>Enrollment numbers by course</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    enrollments: {
                      label: 'Enrollments',
                      color: 'hsl(var(--chart-1))',
                    },
                  }}
                  className='h-[300px]'
                >
                  <BarChart data={coursePerformanceData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='course'
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor='end'
                      height={100}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey='enrollments'
                      fill='var(--color-enrollments)'
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Category analysis</CardTitle>
                    <CardDescription>Distribution by category</CardDescription>
                  </div>
                  <div className='space-x-2'>
                    <Button
                      size='sm'
                      variant={showDetails ? 'outline' : 'default'}
                      onClick={() => setShowDetails(false)}
                    >
                      Show Chart
                    </Button>
                    <Button
                      size='sm'
                      variant={showDetails ? 'default' : 'outline'}
                      onClick={() => setShowDetails(true)}
                    >
                      Show Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='min-h-[500px]'>
                {loadingCategory ? (
                  <div className='text-center py-8'>Loading...</div>
                ) : !showDetails ? (
                  <ChartContainer
                    config={{
                      value: {
                        label: 'Percentage',
                      },
                    }}
                    className='h-[400px]'
                  >
                    <PieChart width={400} height={400}>
                      <Pie
                        data={filteredCategoryChart}
                        dataKey='courseCount'
                        nameKey='categoryName'
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={120}
                        fill='#8884d8'
                      >
                        {filteredCategoryChart.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div
                    className={
                      isFullscreenDetail
                        ? 'fixed inset-0 z-50 bg-white bg-opacity-95 flex flex-col items-center justify-center p-8 overflow-auto'
                        : 'mt-8 relative'
                    }
                  >
                    <div
                      className={
                        isFullscreenDetail
                          ? 'w-full max-w-7xl mx-auto'
                          : 'w-full max-w-6xl mx-auto'
                      }
                    >
                      <div className='flex justify-between items-center mb-6'>
                        <h2 className='text-2xl font-bold'>Category Details</h2>
                        <div className='flex gap-2'>
                          <label className='flex items-center text-sm'>
                            Show
                            <select
                              value={rowsPerPage}
                              onChange={e => {
                                setRowsPerPage(Number(e.target.value))
                                setPage(1)
                              }}
                              className='border rounded px-2 py-1 ml-2'
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={-1}>All</option>
                            </select>
                            <span className='ml-2'>
                              {isFullscreenDetail ? 'Zoom Out' : 'Zoom In'}
                            </span>
                          </label>
                          <button
                            className='p-2 rounded-full hover:bg-gray-200'
                            onClick={() =>
                              setIsFullscreenDetail(!isFullscreenDetail)
                            }
                            title={isFullscreenDetail ? 'Zoom Out' : 'Zoom In'}
                          >
                            {isFullscreenDetail ? (
                              <Minimize className='h-6 w-6' />
                            ) : (
                              <Maximize className='h-6 w-6' />
                            )}
                          </button>
                        </div>
                      </div>
                      <div
                        className={
                          isFullscreenDetail
                            ? 'overflow-y-auto max-h-[70vh] w-full'
                            : 'overflow-x-auto w-full'
                        }
                      >
                        <table
                          className={`w-full border bg-white table-fixed ${isFullscreenDetail ? 'text-sm' : 'text-xs'}`}
                        >
                          <thead>
                            <tr className='bg-gray-50'>
                              <th
                                className='px-1 py-1 border text-center'
                                style={{ width: '5%', minWidth: '40px' }}
                              >
                                ID
                              </th>
                              <th
                                className='px-1 py-1 border'
                                style={{ width: '15%', minWidth: '80px' }}
                              >
                                Name
                              </th>
                              <th
                                className='px-1 py-1 border'
                                style={{ width: '15%', minWidth: '90px' }}
                              >
                                Description
                              </th>
                              <th
                                className='px-1 py-1 border text-center'
                                style={{ width: '8%', minWidth: '50px' }}
                              >
                                Courses
                              </th>
                              <th
                                className='px-1 py-1 border text-center'
                                style={{ width: '8%', minWidth: '60px' }}
                              >
                                Avg Rating
                              </th>
                              <th
                                className='px-1 py-1 border text-center'
                                style={{ width: '7%', minWidth: '50px' }}
                              >
                                Students
                              </th>
                              <th
                                className='px-1 py-1 border text-center'
                                style={{ width: '10%', minWidth: '70px' }}
                              >
                                Revenue
                              </th>
                              <th
                                className='px-1 py-1 border text-center'
                                style={{ width: '12%', minWidth: '80px' }}
                              >
                                Created
                              </th>
                              <th
                                className='px-1 py-1 border text-center'
                                style={{ width: '12%', minWidth: '80px' }}
                              >
                                Modified
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedData.map((cat, idx) => (
                              <tr key={cat.categoryId}>
                                <td
                                  className='border px-1 py-1 align-top text-center'
                                  style={{ width: '5%', minWidth: '40px' }}
                                >
                                  {isFullscreenDetail ? (
                                    <div>
                                      {rowsPerPage === -1
                                        ? idx + 1
                                        : (page - 1) * rowsPerPage + idx + 1}
                                    </div>
                                  ) : (
                                    <div
                                      className='line-clamp-2 h-12 overflow-hidden'
                                      style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {rowsPerPage === -1
                                        ? idx + 1
                                        : (page - 1) * rowsPerPage + idx + 1}
                                    </div>
                                  )}
                                </td>
                                <td
                                  className='border px-1 py-1 align-top'
                                  style={{ width: '15%', minWidth: '80px' }}
                                >
                                  {isFullscreenDetail ? (
                                    <div>
                                      {(cat.categoryName || '').replace(
                                        /\n|\r|\r\n/g,
                                        ' '
                                      )}
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        lineHeight: '1.2em',
                                        maxHeight: '2.4em',
                                      }}
                                    >
                                      {(cat.categoryName || '').replace(
                                        /\n|\r|\r\n/g,
                                        ' '
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td
                                  className='border px-1 py-1 align-top'
                                  style={{ width: '15%', minWidth: '90px' }}
                                >
                                  {isFullscreenDetail ? (
                                    <div>
                                      {(cat.description || '').replace(
                                        /\n|\r|\r\n/g,
                                        ' '
                                      )}
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        lineHeight: '1.2em',
                                        maxHeight: '2.4em',
                                      }}
                                    >
                                      {(cat.description || '').replace(
                                        /\n|\r|\r\n/g,
                                        ' '
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td
                                  className='border px-1 py-1 text-center'
                                  style={{ width: '8%', minWidth: '50px' }}
                                >
                                  {cat.courseCount}
                                </td>
                                <td
                                  className='border px-1 py-1 text-center'
                                  style={{ width: '8%', minWidth: '60px' }}
                                >
                                  {cat.averageRating}
                                </td>
                                <td
                                  className='border px-1 py-1 text-center'
                                  style={{ width: '7%', minWidth: '50px' }}
                                >
                                  {cat.totalStudents}
                                </td>
                                <td
                                  className='border px-1 py-1 text-center'
                                  style={{ width: '10%', minWidth: '70px' }}
                                >
                                  ${cat.totalRevenue?.toLocaleString('en-US')}
                                </td>
                                <td
                                  className={`border px-1 py-1 text-center ${isFullscreenDetail ? 'text-sm' : 'text-xs'}`}
                                  style={{ width: '12%', minWidth: '80px' }}
                                >
                                  {formatDateTime(cat.createdDate)}
                                </td>
                                <td
                                  className={`border px-1 py-1 text-center ${isFullscreenDetail ? 'text-sm' : 'text-xs'}`}
                                  style={{ width: '12%', minWidth: '80px' }}
                                >
                                  {formatDateTime(cat.modifiedDate)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Pagination controls */}
                      <div className='flex items-center gap-2 mt-4 justify-center'>
                        <button
                          className='px-2 py-1 border rounded disabled:opacity-50'
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, idx) => (
                          <button
                            key={idx}
                            className={`px-2 py-1 border rounded ${page === idx + 1 ? 'bg-gray-200 font-bold' : ''}`}
                            onClick={() => setPage(idx + 1)}
                          >
                            {idx + 1}
                          </button>
                        ))}
                        <button
                          className='px-2 py-1 border rounded disabled:opacity-50'
                          disabled={page === totalPages}
                          onClick={() => setPage(page + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='activity' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Student Activity</CardTitle>
              <CardDescription>
                Weekly active users and new registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  active: {
                    label: 'Active Users',
                    color: 'hsl(var(--chart-1))',
                  },
                  new: {
                    label: 'New Users',
                    color: 'hsl(var(--chart-2))',
                  },
                }}
                className='h-[400px]'
              >
                <LineChart data={studentActivityData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='week' />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type='monotone'
                    dataKey='active'
                    stroke='var(--color-active)'
                    strokeWidth={2}
                  />
                  <Line
                    type='monotone'
                    dataKey='new'
                    stroke='var(--color-new)'
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='trends' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                Monthly revenue and enrollment trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: 'Revenue ($)',
                    color: 'hsl(var(--chart-1))',
                  },
                  enrollments: {
                    label: 'Enrollments',
                    color: 'hsl(var(--chart-2))',
                  },
                }}
                className='h-[400px]'
              >
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis yAxisId='left' />
                  <YAxis yAxisId='right' orientation='right' />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId='left'
                    type='monotone'
                    dataKey='revenue'
                    stroke='var(--color-revenue)'
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='enrollments'
                    stroke='var(--color-enrollments)'
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
