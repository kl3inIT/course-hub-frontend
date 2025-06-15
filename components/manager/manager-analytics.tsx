'use client'

import { categoryApi } from '@/api/category-api'
import { courseApi } from '@/api/course-api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryChartDTO, CategoryDetailDTO } from '@/types/category'
import { CourseResponseDTO } from '@/types/course'
import { DatePicker } from 'antd'
import 'antd/dist/reset.css'
import { addDays } from 'date-fns'
import {
  BookOpen,
  DollarSign,
  Download,
  Loader2,
  Maximize,
  Minimize,
  RefreshCw,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import '../../styles/date-range-custom.css'
import { ChartConfig } from '../ui/chart'
const { RangePicker } = DatePicker

interface ChartContainerProps {
  children: ReactNode
  config: ChartConfig
  className?: string
}

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

// Custom label cho PieChart để tránh dính chữ
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  if (percent === 0) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill='#222'
      textAnchor='middle'
      dominantBaseline='central'
      fontSize={window.innerWidth < 600 ? 12 : 15}
      style={{ pointerEvents: 'none' }}
    >
      {(percent * 100).toFixed(1).replace('.', ',')}
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
  const [timeRange, setTimeRange] = useState('6m')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [open, setOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isCategoryFullscreen, setIsCategoryFullscreen] = useState(false)
  const [isCourseFullscreen, setIsCourseFullscreen] = useState(false)
  const [loadingCategory, setLoadingCategory] = useState(false)
  const [categoryChart, setCategoryChart] = useState<CategoryChartDTO[]>([])
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetailDTO[]>(
    []
  )
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [coursePage, setCoursePage] = useState(1)
  const [courseRowsPerPage, setCourseRowsPerPage] = useState(5)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [pieOuterRadius, setPieOuterRadius] = useState(120)
  const [show, setShow] = useState(false)
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    },
  ])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showCategoryCoursesDialog, setShowCategoryCoursesDialog] = useState(false)
  const [selectedCategoryForCourses, setSelectedCategoryForCourses] = useState<CategoryDetailDTO | null>(null)
  const [categoryCourses, setCategoryCourses] = useState<CourseResponseDTO[]>([])
  const [loadingCategoryCourses, setLoadingCategoryCourses] = useState(false)

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

  useEffect(() => {
    function updateRadius() {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.offsetWidth
        const height = chartContainerRef.current.offsetHeight
        // outerRadius là 40% chiều rộng hoặc 40% chiều cao, nhỏ hơn
        setPieOuterRadius(Math.max(60, Math.min(width, height) * 0.4))
      }
    }
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])

  const filteredCategoryChart = categoryChart.filter(
    item => item.percentage > 0
  )

  // Pagination logic for category detail table
  const totalRows = categoryDetails.length
  const totalPages = rowsPerPage === -1 ? 1 : Math.ceil(totalRows / rowsPerPage)
  const paginatedData =
    rowsPerPage === -1
      ? categoryDetails
      : categoryDetails.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  // Pagination logic for course detail table  
  const totalCourseRows = coursePerformanceData.length
  const totalCoursePages = courseRowsPerPage === -1 ? 1 : Math.ceil(totalCourseRows / courseRowsPerPage)
  const paginatedCourseData =
    courseRowsPerPage === -1
      ? coursePerformanceData
      : coursePerformanceData.slice((coursePage - 1) * courseRowsPerPage, coursePage * courseRowsPerPage)

  const handleCategoryRowClick = async (category: CategoryDetailDTO) => {
    setSelectedCategoryForCourses(category)
    setShowCategoryCoursesDialog(true)
    setLoadingCategoryCourses(true)
    try {
      const response = await courseApi.getCoursesByCategory(category.categoryId.toString())
      setCategoryCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses by category:', error)
      setCategoryCourses([])
    } finally {
      setLoadingCategoryCourses(false)
    }
  }

  const totalCategoryCoursesRevenue = categoryCourses.reduce((sum, course) => sum + (course.finalPrice || 0), 0)

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Analytics Dashboard</h1>
          <p className='text-muted-foreground'>
            Track your course performance and student engagement
          </p>
        </div>
        <div className='flex space-x-2 items-center'>
          {/* Date Range Picker */}
          <div className='relative'>
            <RangePicker
              style={{ borderRadius: 8, minWidth: 240 }}
              placeholder={['Pick a date range', '']}
              format="DD/MM/YYYY"
              allowClear
              separator={null}
              panelRender={panel => (
                <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  {panel}
                </div>
              )}
            />
          </div>
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
      <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-2 md:px-0'>
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

<TabsContent value="courses" className="space-y-4">
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
    {/* Course Table */}
    <Card className="w-full rounded-lg border p-2 md:p-6">
      <CardContent className="min-h-[500px] flex flex-col items-center">
        {loadingCategory ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className={
            isCourseFullscreen
              ? 'fixed inset-0 z-50 bg-white bg-opacity-95 flex flex-col items-center justify-center p-8 overflow-auto'
              : 'mt-8 relative w-full'
          }>
            <div className={
              isCourseFullscreen
                ? 'w-full max-w-7xl mx-auto'
                : 'w-full mx-auto'
            }>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Course Details</h2>
                <div className="flex gap-2">
                  <label className="flex items-center text-sm">
                    Show
                    <select
                      value={courseRowsPerPage}
                      onChange={e => {
                        setCourseRowsPerPage(Number(e.target.value))
                        setCoursePage(1)
                      }}
                      className="border rounded px-2 py-1 ml-2"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={-1}>All</option>
                    </select>
                    <span className="ml-2">
                      {isCourseFullscreen ? 'Zoom Out' : 'Zoom In'}
                    </span>
                  </label>
                  <button
                    className="p-2 rounded-full hover:bg-gray-200"
                    onClick={() => setIsCourseFullscreen(!isCourseFullscreen)}
                    title={isCourseFullscreen ? 'Zoom Out' : 'Zoom In'}
                  >
                    {isCourseFullscreen ? (
                      <Minimize className="h-6 w-6" />
                    ) : (
                      <Maximize className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="min-w-[800px] border bg-white table-fixed text-xs md:text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 border text-center font-semibold whitespace-nowrap" style={{ width: '6%', minWidth: '50px' }}>ID</th>
                      <th className="px-3 py-2 border text-center font-semibold whitespace-nowrap" style={{ width: '18%', minWidth: '150px' }}>Name</th>
                      <th className="px-3 py-2 border text-center font-semibold whitespace-nowrap" style={{ width: '10%', minWidth: '80px' }}>Students</th>
                      <th className="px-3 py-2 border text-center font-semibold whitespace-nowrap" style={{ width: '10%', minWidth: '80px' }}>Rating</th>
                      <th className="px-3 py-2 border text-center font-semibold whitespace-nowrap" style={{ width: '12%', minWidth: '100px' }}>Revenue</th>
                      <th className="px-3 py-2 border text-center font-semibold whitespace-nowrap" style={{ width: '12%', minWidth: '100px' }}>Revenue %</th>
                      <th className="px-3 py-2 border text-center font-semibold whitespace-nowrap" style={{ width: '10%', minWidth: '80px' }}>Reviews</th>
                      <th className="px-3 py-2 border text-center font-semibold whitespace-nowrap" style={{ width: '10%', minWidth: '80px' }}>Level</th>
                      <th className="px-3 py-2 border text-center font-semibold whitespace-nowrap" style={{ width: '12%', minWidth: '110px' }}>Completion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCourseData.map((course, idx) => (
                      <tr key={idx}>
                        <td className="border px-3 py-2 align-top text-center whitespace-nowrap">{courseRowsPerPage === -1 ? idx + 1 : (coursePage - 1) * courseRowsPerPage + idx + 1}</td>
                        <td className="border px-3 py-2 align-top whitespace-nowrap">{course.course}</td>
                        <td className="border px-3 py-2 text-center whitespace-nowrap">{course.enrollments}</td>
                        <td className="border px-3 py-2 text-center whitespace-nowrap">{course.rating}</td>
                        <td className="border px-3 py-2 text-center whitespace-nowrap">${course.revenue?.toLocaleString('en-US')}</td>
                        <td className="border px-3 py-2 text-center whitespace-nowrap">{((course.revenue / totalRevenue) * 100).toFixed(1)}%</td>
                        <td className="border px-3 py-2 text-center whitespace-nowrap">{Math.floor(course.enrollments * 0.3)}</td>
                        <td className="border px-3 py-2 text-center whitespace-nowrap">Beginner</td>
                        <td className="border px-3 py-2 text-center whitespace-nowrap">{Math.floor(Math.random() * 30 + 70)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 justify-center">
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                disabled={coursePage === 1}
                onClick={() => setCoursePage(coursePage - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalCoursePages }, (_, idx) => (
                <button
                  key={idx}
                  className={`px-2 py-1 border rounded ${coursePage === idx + 1 ? 'bg-gray-200 font-bold' : ''}`}
                  onClick={() => setCoursePage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                disabled={coursePage === totalCoursePages}
                onClick={() => setCoursePage(coursePage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Category Table */}
    <Card className="w-full rounded-lg border p-2 md:p-6">
      <CardContent className="min-h-[500px] flex flex-col items-center">
        {loadingCategory ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className={isCategoryFullscreen
              ? 'fixed inset-0 z-50 bg-white bg-opacity-95 flex flex-col items-center justify-center p-8 overflow-auto'
              : 'mt-8 relative w-full'}>
            <div className={isCategoryFullscreen
                ? 'w-full max-w-7xl mx-auto'
                : 'w-full mx-auto'}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Category Details</h2>
                <div className="flex gap-2">
                  <label className="flex items-center text-sm">
                    Show
                    <select
                      value={rowsPerPage}
                      onChange={e => {
                        setRowsPerPage(Number(e.target.value))
                        setPage(1)
                      }}
                      className="border rounded px-2 py-1 ml-2"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={-1}>All</option>
                    </select>
                    <span className="ml-2">
                      {isCategoryFullscreen ? 'Zoom Out' : 'Zoom In'}
                    </span>
                  </label>
                  <button
                    className="p-2 rounded-full hover:bg-gray-200"
                    onClick={() => setIsCategoryFullscreen(!isCategoryFullscreen)}
                    title={isCategoryFullscreen ? 'Zoom Out' : 'Zoom In'}
                  >
                    {isCategoryFullscreen ? (
                      <Minimize className="h-6 w-6" />
                    ) : (
                      <Maximize className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="min-w-[800px] border bg-white table-fixed text-xs md:text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-1 py-1 border text-center" style={{ width: '5%', minWidth: '40px' }}>ID</th>
                      <th className="px-1 py-1 border" style={{ width: '10%', minWidth: '80px' }}>Name</th>
                      <th className="px-1 py-1 border" style={{ width: '16%', minWidth: '90px' }}>Details</th>
                      <th className="px-1 py-1 border text-center" style={{ width: '9%', minWidth: '50px' }}>Average Rating</th>
                      <th className="px-1 py-1 border text-center" style={{ width: '9%', minWidth: '60px' }}>Revenue</th>
                      <th className="px-1 py-1 border text-center" style={{ width: '9%', minWidth: '50px' }}>% of Revenue</th>
                      <th className="px-1 py-1 border text-center" style={{ width: '10%', minWidth: '70px' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((cat, idx) => (
                      <tr
                        key={cat.categoryId}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleCategoryRowClick(cat)}
                      >
                        <td className="border px-1 py-1 align-top text-center" style={{ width: '5%', minWidth: '40px' }}>
                          {isCategoryFullscreen ? (
                            <div>{rowsPerPage === -1 ? idx + 1 : (page - 1) * rowsPerPage + idx + 1}</div>
                          ) : (
                            <div className="line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {rowsPerPage === -1 ? idx + 1 : (page - 1) * rowsPerPage + idx + 1}
                            </div>
                          )}
                        </td>
                        <td className="border px-1 py-1 align-top" style={{ width: '15%', minWidth: '80px' }}>
                          <div className="line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {(cat.categoryName || '').replace(/\n|\r|\r\n/g, ' ')}
                          </div>
                        </td>
                        <td className="border px-1 py-1 align-top" style={{ width: '15%', minWidth: '90px' }}>
                          <div className="line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {(cat.description || '').replace(/\n|\r|\r\n/g, ' ')}
                          </div>
                        </td>
                        <td className="border px-1 py-1 text-center" style={{ width: '8%', minWidth: '50px' }}>{cat.courseCount}</td>
                        <td className="border px-1 py-1 text-center" style={{ width: '8%', minWidth: '60px' }}>{cat.averageRating}</td>
                        <td className="border px-1 py-1 text-center" style={{ width: '7%', minWidth: '50px' }}>{cat.totalStudents}</td>
                        <td className="border px-1 py-1 text-center" style={{ width: '10%', minWidth: '70px' }}>${cat.totalRevenue?.toLocaleString('en-US')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 justify-center">
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
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
                className="px-2 py-1 border rounded disabled:opacity-50"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Users</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Users</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentActivityData.map((data, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.week}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.active}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.new}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index > 0 ? 
                            `${(((data.active - studentActivityData[index-1].active) / studentActivityData[index-1].active) * 100).toFixed(1)}%` 
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
      <Dialog open={showCategoryCoursesDialog} onOpenChange={setShowCategoryCoursesDialog}>
        <DialogContent className='sm:max-w-4xl p-6'>
          <DialogHeader>
            <DialogTitle>Courses in {selectedCategoryForCourses?.categoryName}</DialogTitle>
          </DialogHeader>
          {loadingCategoryCourses ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin mr-2' />
              Loading courses...
            </div>
          ) : categoryCourses.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              No courses found for this category.
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Chart Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Breakdown of revenue by course within {selectedCategoryForCourses?.categoryName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className='h-[250px]'>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryCourses.map(course => ({
                            name: course.title,
                            value: course.finalPrice || 0,
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          labelLine={false}
                          label={renderCustomizedLabel}
                        >
                          {categoryCourses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />}>

                        </ChartTooltip>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Courses Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Course List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='w-full overflow-x-auto'>
                    <table className='min-w-[1500px] border bg-white table-fixed text-xs md:text-sm'>
                      <thead>
                        <tr className='bg-gray-50'>
                          <th className='px-2 py-2 border text-center font-semibold whitespace-nowrap'>ID</th>
                          <th className='px-2 py-2 border text-left font-semibold whitespace-nowrap'>Course Name</th>
                          <th className='px-2 py-2 border text-center font-semibold whitespace-nowrap'>Enrollments</th>
                          <th className='px-2 py-2 border text-center font-semibold whitespace-nowrap'>Rating</th>
                          <th className='px-2 py-2 border text-center font-semibold whitespace-nowrap'>Revenue</th>
                          <th className='px-2 py-2 border text-center font-semibold whitespace-nowrap'>Completion %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryCourses.map((course, idx) => (
                          <tr key={course.id}>
                            <td className='border px-2 py-2 text-center align-top'>{idx + 1}</td>
                            <td className='border px-2 py-2 align-top'>{course.title}</td>
                            <td className='border px-2 py-2 text-center align-top'>{course.totalStudents}</td>
                            <td className='border px-2 py-2 text-center align-top'>{course.averageRating?.toFixed(1) || 'N/A'}</td>
                            <td className='border px-2 py-2 text-center align-top'>${course.finalPrice?.toLocaleString('en-US') || '0.00'}</td>
                            <td className='border px-2 py-2 text-center align-top'>{Math.floor(Math.random() * 30 + 70)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
