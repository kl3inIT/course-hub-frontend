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
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import ExcelJS from 'exceljs'
import {
  BookOpen,
  DollarSign,
  Download,
  Loader2,
  RefreshCw,
  Star,
  TrendingUp,
  Users
} from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { toast } from 'react-hot-toast'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import '../../styles/date-range-custom.css'
import { ChartConfig } from '../ui/chart'
const { RangePicker } = DatePicker

interface ChartContainerProps {
  children: ReactNode
  config: ChartConfig
  className?: string
}

const revenueData = [
  {
    id: 1,
    courseName: 'ReactJS Basic',
    revenue: 12000000,
    previousRevenue: 10500000,
    growth: 14.3,
    orders: 50,
    newStudents: 45,
    revenueShare: 32
  },
  {
    id: 2,
    courseName: 'Python Beginner',
    revenue: 8500000,
    previousRevenue: 8800000,
    growth: -3.4,
    orders: 36,
    newStudents: 28,
    revenueShare: 22
  },
  {
    id: 3,
    courseName: 'SQL & Database',
    revenue: 6250000,
    previousRevenue: 5000000,
    growth: 25,
    orders: 27,
    newStudents: 20,
    revenueShare: 17
  },
  {
    id: 4,
    courseName: 'UI/UX Design',
    revenue: 4000000,
    previousRevenue: 3600000,
    growth: 11.1,
    orders: 14,
    newStudents: 13,
    revenueShare: 10
  }
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
  { 
    course: 'Node.js Backend', 
    enrollments: 567, 
    revenue: 17010, 
    rating: 4.7 
  },
  { 
    course: 'CSS Mastery', 
    enrollments: 445, 
    revenue: 13350, 
    rating: 4.6 
  },
  {
    course: 'Python Programming',
    enrollments: 789,
    revenue: 23670,
    rating: 4.8,
  },
  {
    course: 'Database Design',
    enrollments: 456,
    revenue: 18240,
    rating: 4.7,
  },
  {
    course: 'UI/UX Design Fundamentals',
    enrollments: 678,
    revenue: 20340,
    rating: 4.9,
  },
  {
    course: 'Mobile App Development',
    enrollments: 543,
    revenue: 16290,
    rating: 4.6,
  },
  {
    course: 'Cloud Computing Basics',
    enrollments: 432,
    revenue: 12960,
    rating: 4.7,
  },
  {
    course: 'DevOps Essentials',
    enrollments: 345,
    revenue: 10350,
    rating: 4.8,
  }
]

const studentActivityData = [
  {
    id: 1,
    courseName: 'React Fundamentals',
    newStudents: 15,
    previousCompletion: 8 ,
    growth: 10,
    reviewRate: 85
  },
  {
    id: 2,
    courseName: 'Node.js Backend',
    newStudents: 12,
    previousCompletion: 65,
    growth: 5,
    reviewRate: 72
  },
  {
    id: 3,
    courseName: 'CSS Mastery',
    newStudents: 8,
    previousCompletion: 60,
    growth: 8,
    reviewRate: 90
  },
  {
    id: 4,
    courseName: 'Advanced JS',
    newStudents: 20,
    previousCompletion: 75,
    growth: 12,
    reviewRate: 80
  }
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
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    category: { checked: true, rowCount: 10 },
    course: { checked: true, rowCount: 10 },
    student: { checked: true, rowCount: 10 },
    revenue: { checked: true, rowCount: 10 }
  })
  const [exportDateRange, setExportDateRange] = useState<[Date, Date] | null>(null)
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
  const [studentPage, setStudentPage] = useState(1)
  const [studentRowsPerPage, setStudentRowsPerPage] = useState(5)
  const [revenuePage, setRevenuePage] = useState(1)
  const [revenueRowsPerPage, setRevenueRowsPerPage] = useState(5)
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
  const [selectedDateRange, setSelectedDateRange] = useState<[Date, Date] | null>(null)
  const [previousPeriodLabel, setPreviousPeriodLabel] = useState('Previous Month')

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Tạo dữ liệu xuất dựa trên các tùy chọn
      const exportData = {
        dateRange: exportDateRange,
        options: exportOptions,
        data: {
          category: exportOptions.category.checked ? 
                      (exportOptions.category.rowCount === -1 ? categoryDetails : categoryDetails.slice(0, exportOptions.category.rowCount)) 
                      : [],
          course: exportOptions.course.checked ? 
                    (exportOptions.course.rowCount === -1 ? coursePerformanceData : coursePerformanceData.slice(0, exportOptions.course.rowCount)) 
                    : [],
          student: exportOptions.student.checked ? 
                     (exportOptions.student.rowCount === -1 ? studentActivityData : studentActivityData.slice(0, exportOptions.student.rowCount)) 
                     : [],
          revenue: exportOptions.revenue.checked ? 
                     (exportOptions.revenue.rowCount === -1 ? revenueData : revenueData.slice(0, exportOptions.revenue.rowCount)) 
                     : []
        }
      }

      console.log('Export Options:', exportOptions) // Debug: Kiểm tra các tùy chọn được chọn
      console.log('Export Data prepared:', exportData.data) // Debug: Kiểm tra dữ liệu sau khi chuẩn bị

      // Tạo file Excel
      const workbook = new ExcelJS.Workbook()
      
      if (exportOptions.category.checked) {
        console.log('Adding Category Sheet...') // Debug
        const categorySheet = workbook.addWorksheet('Categories')
        categorySheet.columns = [
          { header: 'ID', key: 'categoryId', width: 10 },
          { header: 'Category Name', key: 'categoryName', width: 30 },
          { header: 'Description', key: 'description', width: 50 },
          { header: 'Average Rating', key: 'averageRating', width: 15 },
          { header: 'Revenue', key: 'totalRevenue', width: 15 },
          { header: 'Total Students', key: 'totalStudents', width: 15 }
        ]
        exportData.data.category.forEach(cat => {
          console.log('Adding category row:', cat) // Debug: Log từng hàng được thêm
          categorySheet.addRow({
            categoryId: cat.categoryId,
            categoryName: cat.categoryName,
            description: cat.description,
            averageRating: cat.averageRating,
            totalRevenue: cat.totalRevenue,
            totalStudents: cat.totalStudents
          })
        })
      }

      if (exportOptions.course.checked) {
        console.log('Adding Course Sheet...') // Debug
        const courseSheet = workbook.addWorksheet('Courses')
        courseSheet.columns = [
          { header: 'Course Name', key: 'course', width: 30 },
          { header: 'Students', key: 'enrollments', width: 15 },
          { header: 'Rating', key: 'rating', width: 15 },
          { header: 'Revenue', key: 'revenue', width: 15 },
          { header: 'Revenue %', key: 'revenueShare', width: 15 },
          { header: 'Reviews', key: 'reviews', width: 15 },
          { header: 'Level', key: 'level', width: 15 },
          { header: 'Completion %', key: 'completion', width: 15 }
        ]
        exportData.data.course.forEach(course => {
          console.log('Adding course row:', course) // Debug: Log từng hàng được thêm
          courseSheet.addRow({
            course: course.course,
            enrollments: course.enrollments,
            rating: course.rating,
            revenue: course.revenue,
            revenueShare: ((course.revenue / totalRevenue) * 100),
            reviews: Math.floor(course.enrollments * 0.3),
            level: 'Beginner',
            completion: Math.floor(Math.random() * 30 + 70),
          })
        })
      }

      if (exportOptions.student.checked) {
        console.log('Adding Student Activity Sheet...') // Debug
        const studentSheet = workbook.addWorksheet('Student Activity')
        studentSheet.columns = [
          { header: 'Course Name', key: 'courseName', width: 30 },
          { header: 'New Students', key: 'newStudents', width: 15 },
          { header: 'Previous Period', key: 'previousCompletion', width: 15 },
          { header: 'Growth %', key: 'growth', width: 15 },
          { header: 'Completed %', key: 'completedPercentage', width: 15 },
          { header: 'Review Rate %', key: 'reviewRate', width: 15 }
        ]
        exportData.data.student.forEach(data => {
          const growthRate = ((data.newStudents - data.previousCompletion) / data.previousCompletion) * 100
          console.log('Adding student activity row:', data) // Debug: Log từng hàng được thêm
          studentSheet.addRow({
            courseName: data.courseName,
            newStudents: data.newStudents,
            previousCompletion: data.previousCompletion,
            growth: growthRate,
            completedPercentage: data.growth,
            reviewRate: data.reviewRate,
          })
        })
      }

      if (exportOptions.revenue.checked) {
        console.log('Adding Revenue Sheet...') // Debug
        const revenueSheet = workbook.addWorksheet('Revenue')
        revenueSheet.columns = [
          { header: 'Course Name', key: 'courseName', width: 30 },
          { header: 'Revenue', key: 'revenue', width: 20 },
          { header: 'Previous Period', key: 'previousRevenue', width: 20 },
          { header: 'Growth %', key: 'growth', width: 15 },
          { header: 'Orders', key: 'orders', width: 15 },
          { header: 'New Students', key: 'newStudents', width: 15 },
          { header: 'Revenue Share %', key: 'revenueShare', width: 15 }
        ]
        exportData.data.revenue.forEach(data => {
          console.log('Adding revenue row:', data) // Debug: Log từng hàng được thêm
          revenueSheet.addRow({
            courseName: data.courseName,
            revenue: data.revenue,
            previousRevenue: data.previousRevenue,
            growth: data.growth,
            orders: data.orders,
            newStudents: data.newStudents,
            revenueShare: data.revenueShare,
          })
        })
      }

      // Xuất file
      console.log('Total worksheets in workbook before writing:', workbook.worksheets.length) // Debug: Kiểm tra số lượng sheet
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Xuất báo cáo thành công!')
      setShowExportDialog(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Lỗi khi xuất báo cáo')
    } finally {
      setIsExporting(false)
    }
  }

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalEnrollments = revenueData.reduce(
    (sum, item) => sum + item.orders,
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

  // Pagination logic for student activity table
  const totalStudentRows = studentActivityData.length
  const totalStudentPages = studentRowsPerPage === -1 ? 1 : Math.ceil(totalStudentRows / studentRowsPerPage)
  const paginatedStudentData =
    studentRowsPerPage === -1
      ? studentActivityData
      : studentActivityData.slice((studentPage - 1) * studentRowsPerPage, studentPage * studentRowsPerPage)

  // Pagination logic for revenue trends table
  const totalRevenueRows = revenueData.length
  const totalRevenuePages = revenueRowsPerPage === -1 ? 1 : Math.ceil(totalRevenueRows / revenueRowsPerPage)
  const paginatedRevenueData =
    revenueRowsPerPage === -1
      ? revenueData
      : revenueData.slice((revenuePage - 1) * revenueRowsPerPage, revenuePage * revenueRowsPerPage)

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

  const handleDateRangeChange = (dates: [Date, Date] | null) => {
    setSelectedDateRange(dates)
    if (dates) {
      const daysDiff = Math.ceil((dates[1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24))
      setPreviousPeriodLabel(`${daysDiff} Days Ago`)
    } else {
      setPreviousPeriodLabel('Previous Month')
    }
  }

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
          <div className='relative'>
            <RangePicker
              style={{ borderRadius: 8, minWidth: 240 }}
              placeholder={['Pick a date range', '']}
              format="DD/MM/YYYY"
              allowClear
              separator={null}
              onChange={(dates) => handleDateRangeChange(dates as [Date, Date] | null)}
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
            onClick={() => setShowExportDialog(true)}
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
      <Tabs defaultValue='category' className='space-y-4'>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-gray-500">Category Analysis:</div>
            <TabsList>
              <TabsTrigger value='category'>Category Overview</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-gray-500">Course Analysis:</div>
            <TabsList>
              <TabsTrigger value='course'>Course Details</TabsTrigger>
              <TabsTrigger value='student'>Student Activity</TabsTrigger>
              <TabsTrigger value='revenue'>Revenue Trends</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="min-h-[800px]">
          {/* Category Tab */}
          <TabsContent value="category" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Category Overview</CardTitle>
                    <CardDescription>
                      Analysis of course categories and their performance metrics
                    </CardDescription>
                  </div>
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
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Details</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Average Rating</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% of Revenue</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((cat, idx) => (
                          <tr
                            key={cat.categoryId}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleCategoryRowClick(cat)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {rowsPerPage === -1 ? idx + 1 : (page - 1) * rowsPerPage + idx + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-gray-900">
                              {(cat.categoryName || '').replace(/\n|\r|\r\n/g, ' ')}
                            </td>
                            <td className="px-6 py-4 text-sm text-left text-gray-900">
                              <div className="line-clamp-2">
                                {(cat.description || '').replace(/\n|\r|\r\n/g, ' ')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{cat.averageRating}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">${cat.totalRevenue?.toLocaleString('en-US')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {((cat.totalRevenue / totalRevenue) * 100).toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{cat.totalStudents}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {paginatedData.length > 0 && (
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Tab */}
          <TabsContent value="course" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Course Details</CardTitle>
                    <CardDescription>
                      Detailed analysis of individual course performance
                    </CardDescription>
                  </div>
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
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue %</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {coursePerformanceData.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        paginatedCourseData.map((course, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{courseRowsPerPage === -1 ? idx + 1 : (coursePage - 1) * courseRowsPerPage + idx + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{course.course}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{course.enrollments}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{course.rating}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">${course.revenue?.toLocaleString('en-US')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{((course.revenue / totalRevenue) * 100).toFixed(1)}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{Math.floor(course.enrollments * 0.3)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">Beginner</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{Math.floor(Math.random() * 30 + 70)}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {coursePerformanceData.length > 0 && (
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Tab */}
          <TabsContent value="student" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Student Activity</CardTitle>
                    <CardDescription>
                      Course-specific student engagement and completion metrics
                    </CardDescription>
                  </div>
                  <label className="flex items-center text-sm">
                    Show
                    <select
                      value={studentRowsPerPage}
                      onChange={e => {
                        setStudentRowsPerPage(Number(e.target.value))
                        setStudentPage(1)
                      }}
                      className="border rounded px-2 py-1 ml-2"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={-1}>All</option>
                    </select>
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">New Students</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{previousPeriodLabel}</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Growth (%)</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Completed (%)</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Review Rate (%)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedStudentData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        paginatedStudentData.map((data) => {
                          const growthRate = ((data.newStudents - data.previousCompletion) / data.previousCompletion) * 100;
                          return (
                            <tr key={data.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{data.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{data.courseName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{data.newStudents}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{data.previousCompletion}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${
                                growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${
                                data.growth >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {data.growth >= 0 ? '+' : ''}{data.growth}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{data.reviewRate}%</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {paginatedStudentData.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 justify-center">
                    <button
                      className="px-2 py-1 border rounded disabled:opacity-50"
                      disabled={studentPage === 1}
                      onClick={() => setStudentPage(studentPage - 1)}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalStudentPages }, (_, idx) => (
                      <button
                        key={idx}
                        className={`px-2 py-1 border rounded ${studentPage === idx + 1 ? 'bg-gray-200 font-bold' : ''}`}
                        onClick={() => setStudentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      className="px-2 py-1 border rounded disabled:opacity-50"
                      disabled={studentPage === totalStudentPages}
                      onClick={() => setStudentPage(studentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>
                      Course-specific revenue performance and growth analysis
                    </CardDescription>
                  </div>
                  <label className="flex items-center text-sm">
                    Show
                    <select
                      value={revenueRowsPerPage}
                      onChange={e => {
                        setRevenueRowsPerPage(Number(e.target.value))
                        setRevenuePage(1)
                      }}
                      className="border rounded px-2 py-1 ml-2"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={-1}>All</option>
                    </select>
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{previousPeriodLabel}</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Growth (%)</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">New Students</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Share (%)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedRevenueData.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        paginatedRevenueData.map((data) => (
                          <tr key={data.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{data.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{data.courseName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {data.revenue.toLocaleString('vi-VN')} ₫
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {data.previousRevenue.toLocaleString('vi-VN')} ₫
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${
                              data.growth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {data.growth >= 0 ? '+' : ''}{data.growth}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {data.orders}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {data.newStudents}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {data.revenueShare}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {paginatedRevenueData.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 justify-center">
                    <button
                      className="px-2 py-1 border rounded disabled:opacity-50"
                      disabled={revenuePage === 1}
                      onClick={() => setRevenuePage(revenuePage - 1)}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalRevenuePages }, (_, idx) => (
                      <button
                        key={idx}
                        className={`px-2 py-1 border rounded ${revenuePage === idx + 1 ? 'bg-gray-200 font-bold' : ''}`}
                        onClick={() => setRevenuePage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      className="px-2 py-1 border rounded disabled:opacity-50"
                      disabled={revenuePage === totalRevenuePages}
                      onClick={() => setRevenuePage(revenuePage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
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

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent key="export-dialog" className="sm:max-w-[500px] p-6">
          <DialogHeader>
            <DialogTitle>Xuất báo cáo phân tích</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <div className="font-semibold text-lg border-b pb-2 mb-4">Chọn dữ liệu xuất:</div>
              <div className="grid grid-cols-1 gap-y-4">
                {Object.keys(exportOptions).map((key) => (
                  <div key={key} className="flex flex-col gap-2 p-3 border rounded-md shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={key} 
                        checked={Boolean(exportOptions[key as keyof typeof exportOptions].checked)}
                        onCheckedChange={(value) => 
                          setExportOptions(prev => ({
                            ...prev,
                            [key]: { ...prev[key as keyof typeof prev], checked: value === true }
                          }))
                        }
                      />
                      <label htmlFor={key} className="capitalize text-base font-medium flex-1 cursor-pointer">
                        {key === 'category' ? 'Categories' : ''}
                        {key === 'course' ? 'Courses' : ''}
                        {key === 'student' ? 'Student Activity' : ''}
                        {key === 'revenue' ? 'Revenue Trends' : ''}
                      </label>
                    </div>
                    {exportOptions[key as keyof typeof exportOptions].checked && (
                      <div className="pl-7 mt-2">
                        <div className="font-medium text-sm mb-1">Số lượng dữ liệu:</div>
                        <Select
                          value={exportOptions[key as keyof typeof exportOptions].rowCount.toString()}
                          onValueChange={(value) => 
                            setExportOptions(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], rowCount: Number(value) }
                            }))
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 hàng</SelectItem>
                            <SelectItem value="10">10 hàng</SelectItem>
                            <SelectItem value="20">20 hàng</SelectItem>
                            <SelectItem value="-1">Tất cả</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-semibold text-lg border-b pb-2 mb-4">Khoảng thời gian:</div>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
                format="DD/MM/YYYY"
                onChange={(dates) => setExportDateRange(dates as [Date, Date] | null)}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting || !Object.values(exportOptions).some(o => o.checked)}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                'Xuất báo cáo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
