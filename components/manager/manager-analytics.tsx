'use client'

import { analyticsApi } from '@/services/analytics-api'
import { courseApi } from '@/services/course-api'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CategoryDetailDTO,
  CourseAnalyticsDetailResponseDTO,
  RevenueAnalyticsDetailResponseDTO,
  StudentAnalyticsDetailResponseDTO,
} from '@/types/analytics'
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
  Users,
} from 'lucide-react'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
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
    revenue: { checked: true, rowCount: 10 },
  })
  const [exportDateRange, setExportDateRange] = useState<[Date, Date] | null>(
    null
  )
  const [exportTimeRange, setExportTimeRange] = useState('6m')
  const [isExporting, setIsExporting] = useState(false)
  const [open, setOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Category Analytics State
  const [loadingCategory, setLoadingCategory] = useState(false)
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetailDTO[]>(
    []
  )
  const [totalCategoryElements, setTotalCategoryElements] = useState(0)
  const [totalCategoryPages, setTotalCategoryPages] = useState(1)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [sortCategoryBy, setSortCategoryBy] = useState('id')
  const [sortCategoryDirection, setSortCategoryDirection] = useState('asc')

  // Course Analytics State
  const [loadingCourse, setLoadingCourse] = useState(false)
  const [courseDetails, setCourseDetails] = useState<
    CourseAnalyticsDetailResponseDTO[]
  >([])
  const [totalCourseElements, setTotalCourseElements] = useState(0)
  const [coursePage, setCoursePage] = useState(0)
  const [courseRowsPerPage, setCourseRowsPerPage] = useState(5)

  // Student Analytics State
  const [loadingStudent, setLoadingStudent] = useState(false)
  const [studentDetails, setStudentDetails] = useState<
    StudentAnalyticsDetailResponseDTO[]
  >([])
  const [totalStudentElements, setTotalStudentElements] = useState(0)
  const [studentPage, setStudentPage] = useState(0)
  const [studentRowsPerPage, setStudentRowsPerPage] = useState(5)

  // Revenue Analytics State
  const [loadingRevenue, setLoadingRevenue] = useState(false)
  const [revenueDetails, setRevenueDetails] = useState<
    RevenueAnalyticsDetailResponseDTO[]
  >([])
  const [totalRevenueElements, setTotalRevenueElements] = useState(0)
  const [revenuePage, setRevenuePage] = useState(0)
  const [revenueRowsPerPage, setRevenueRowsPerPage] = useState(5)

  // Other pagination states
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [pieOuterRadius, setPieOuterRadius] = useState(120)
  const hasMountedRef = useRef(false)
  const [show, setShow] = useState(false)
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    },
  ])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showCategoryCoursesDialog, setShowCategoryCoursesDialog] =
    useState(false)
  const [selectedCategoryForCourses, setSelectedCategoryForCourses] =
    useState<CategoryDetailDTO | null>(null)
  const [categoryCourses, setCategoryCourses] = useState<CourseResponseDTO[]>(
    []
  )
  const [loadingCategoryCourses, setLoadingCategoryCourses] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState<
    [Date | null, Date | null]
  >([null, null])
  const [previousPeriodLabel, setPreviousPeriodLabel] =
    useState('Previous Month')

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleExportClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()

    // Temporarily disable pointer events to prevent multiple clicks
    const button = e.currentTarget as HTMLButtonElement
    button.style.pointerEvents = 'none'

    // Lock scroll position
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    setShowExportDialog(true)

    // Re-enable pointer events after a short delay
    setTimeout(() => {
      button.style.pointerEvents = ''
    }, 100)

    return false
  }, [])

  const handleCloseExportDialog = useCallback(() => {
    // Restore scroll position
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }

    setShowExportDialog(false)
  }, [])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // 1. Determine export parameters
      const exportParams: any = {}

      if (exportDateRange && exportDateRange[0] && exportDateRange[1]) {
        // Use custom date range if provided
        exportParams.startDate =
          exportDateRange[0].getFullYear() +
          '-' +
          String(exportDateRange[0].getMonth() + 1).padStart(2, '0') +
          '-' +
          String(exportDateRange[0].getDate()).padStart(2, '0')
        exportParams.endDate =
          exportDateRange[1].getFullYear() +
          '-' +
          String(exportDateRange[1].getMonth() + 1).padStart(2, '0') +
          '-' +
          String(exportDateRange[1].getDate()).padStart(2, '0')
      } else {
        // Use time range
        exportParams.range = exportTimeRange
      }

      // Set size to get all data for export
      exportParams.page = 0
      exportParams.size = 1000

      console.log('Export params:', exportParams) // Debug

      // 2. Fetch fresh data from API for export
      const exportPromises = []

      if (exportOptions.category.checked) {
        exportPromises.push(
          analyticsApi.getCategoryAnalyticsDetails(exportParams)
        )
      }
      if (exportOptions.course.checked) {
        exportPromises.push(
          analyticsApi.getCourseAnalyticsDetails(exportParams)
        )
      }
      if (exportOptions.student.checked) {
        exportPromises.push(
          analyticsApi.getStudentAnalyticsDetails(exportParams)
        )
      }
      if (exportOptions.revenue.checked) {
        exportPromises.push(
          analyticsApi.getRevenueAnalyticsDetails(exportParams)
        )
      }

      const results = await Promise.all(exportPromises)

      // 3. Map results to export data
      let resultIndex = 0
      const freshExportData = {
        category: (exportOptions.category.checked
          ? exportOptions.category.rowCount === -1
            ? results[resultIndex++].data.content
            : results[resultIndex++].data.content.slice(
              0,
              exportOptions.category.rowCount
            )
          : []) as any[],
        course: (exportOptions.course.checked
          ? exportOptions.course.rowCount === -1
            ? results[resultIndex++].data.content
            : results[resultIndex++].data.content.slice(
              0,
              exportOptions.course.rowCount
            )
          : []) as any[],
        student: (exportOptions.student.checked
          ? exportOptions.student.rowCount === -1
            ? results[resultIndex++].data.content
            : results[resultIndex++].data.content.slice(
              0,
              exportOptions.student.rowCount
            )
          : []) as any[],
        revenue: (exportOptions.revenue.checked
          ? exportOptions.revenue.rowCount === -1
            ? results[resultIndex++].data.content
            : results[resultIndex++].data.content.slice(
              0,
              exportOptions.revenue.rowCount
            )
          : []) as any[],
      }

      console.log('Fresh export data:', freshExportData) // Debug

      // 4. Create Excel file
      const workbook = new ExcelJS.Workbook()

      if (exportOptions.category.checked) {
        const categorySheet = workbook.addWorksheet('Categories')
        categorySheet.columns = [
          { header: 'Category ID', key: 'id', width: 12 },
          { header: 'Category Name', key: 'name', width: 35 },
          { header: 'Description', key: 'description', width: 50 },
          { header: 'Total Courses', key: 'courseCount', width: 15 },
          { header: 'Total Students', key: 'totalStudents', width: 15 },
          { header: 'Total Revenue (VND)', key: 'totalRevenue', width: 25 },
          { header: 'Revenue Share (%)', key: 'revenueProportion', width: 18 },
        ]
        freshExportData.category.forEach((cat: any) => {
          categorySheet.addRow({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            courseCount: cat.courseCount || 0,
            totalStudents: cat.totalStudents,
            totalRevenue: cat.totalRevenue,
            revenueProportion: cat.revenueProportion,
          })
        })
      }

      if (exportOptions.course.checked) {
        const courseSheet = workbook.addWorksheet('Courses')
        courseSheet.columns = [
          { header: 'Course ID', key: 'courseId', width: 15 },
          { header: 'Course Name', key: 'courseName', width: 45 },
          { header: 'Total Students', key: 'students', width: 15 },
          { header: 'Average Rating', key: 'rating', width: 15 },
          { header: 'Total Revenue (VND)', key: 'revenue', width: 25 },
          { header: 'Revenue Share (%)', key: 'revenuePercent', width: 18 },
          { header: 'Total Reviews', key: 'reviews', width: 15 },
          { header: 'Course Level', key: 'level', width: 15 },
        ]
        freshExportData.course.forEach((course: any) => {
          courseSheet.addRow({
            courseId: course.courseId,
            courseName: course.courseName,
            students: course.students,
            rating: course.rating,
            revenue: course.revenue,
            revenuePercent: course.revenuePercent,
            reviews: course.reviews,
            level: course.level,
          })
        })
      }

      if (exportOptions.student.checked) {
        const studentSheet = workbook.addWorksheet('Student Activity')
        studentSheet.columns = [
          { header: 'Course ID', key: 'id', width: 15 },
          { header: 'Course Name', key: 'courseName', width: 45 },
          { header: 'New Students', key: 'newStudents', width: 15 },
          { header: 'Previously', key: 'previousCompletion', width: 15 },
          { header: 'Growth Rate (%)', key: 'growth', width: 16 },
          { header: 'Total Reviews', key: 'reviews', width: 15 },
          { header: 'Average Rating', key: 'avgRating', width: 16 },
        ]
        freshExportData.student.forEach((data: any) => {
          studentSheet.addRow({
            id: data.id,
            courseName: data.courseName,
            newStudents: data.newStudents,
            previousCompletion: data.previousCompletion,
            growth: data.growth,
            reviews: data.reviews,
            avgRating: data.avgRating,
          })
        })
      }

      if (exportOptions.revenue.checked) {
        const revenueSheet = workbook.addWorksheet('Revenue Trends')
        revenueSheet.columns = [
          { header: 'Course ID', key: 'id', width: 15 },
          { header: 'Course Name', key: 'courseName', width: 45 },
          { header: 'Current Revenue (VND)', key: 'revenue', width: 25 },
          { header: 'Previously (VND)', key: 'previousRevenue', width: 20 },
          { header: 'Growth Rate (%)', key: 'growth', width: 16 },
          { header: 'Total Orders', key: 'orders', width: 15 },
          { header: 'New Students', key: 'newStudents', width: 15 },
          { header: 'Revenue Share (%)', key: 'revenueShare', width: 18 },
        ]
        freshExportData.revenue.forEach((data: any) => {
          revenueSheet.addRow({
            id: data.id,
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

      // 5. Generate filename with date info
      const dateInfo =
        exportDateRange && exportDateRange[0] && exportDateRange[1]
          ? `${exportDateRange[0].toLocaleDateString('en-GB')}_to_${exportDateRange[1].toLocaleDateString('en-GB')}`
          : exportTimeRange

      // 6. Export file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${dateInfo}-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Export completed successfully!')
      handleCloseExportDialog()
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Error exporting report. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const totalRevenue = courseDetails.reduce(
    (sum, item) => sum + item.revenue,
    0
  )
  const totalEnrollments = courseDetails.reduce(
    (sum, item) => sum + item.students,
    0
  )
  const avgRating =
    courseDetails.length > 0
      ? courseDetails.reduce((sum, item) => sum + item.rating, 0) /
      courseDetails.length
      : 0

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

  const handleCategoryFilter = async () => {
    const params: any = {}
    if (
      timeRange === 'custom' &&
      selectedDateRange[0] &&
      selectedDateRange[1]
    ) {
      // Sử dụng local date format để tránh timezone issues
      params.startDate =
        selectedDateRange[0].getFullYear() +
        '-' +
        String(selectedDateRange[0].getMonth() + 1).padStart(2, '0') +
        '-' +
        String(selectedDateRange[0].getDate()).padStart(2, '0')
      params.endDate =
        selectedDateRange[1].getFullYear() +
        '-' +
        String(selectedDateRange[1].getMonth() + 1).padStart(2, '0') +
        '-' +
        String(selectedDateRange[1].getDate()).padStart(2, '0')
    } else {
      params.range = timeRange
    }
    params.page = page
    params.size = rowsPerPage === -1 ? 1000 : rowsPerPage

    const res = await analyticsApi.getCategoryAnalyticsDetails(params)
    setCategoryDetails(res.data.content)
    setTotalCategoryElements(res.data.totalElements)
    setTotalCategoryPages(res.data.totalPages)
  }

  const handleCourseFilter = async () => {
    setLoadingCourse(true)
    try {
      const params: any = {}
      if (
        timeRange === 'custom' &&
        selectedDateRange[0] &&
        selectedDateRange[1]
      ) {
        // Sử dụng local date format để tránh timezone issues
        params.startDate =
          selectedDateRange[0].getFullYear() +
          '-' +
          String(selectedDateRange[0].getMonth() + 1).padStart(2, '0') +
          '-' +
          String(selectedDateRange[0].getDate()).padStart(2, '0')
        params.endDate =
          selectedDateRange[1].getFullYear() +
          '-' +
          String(selectedDateRange[1].getMonth() + 1).padStart(2, '0') +
          '-' +
          String(selectedDateRange[1].getDate()).padStart(2, '0')
      } else {
        params.range = timeRange
      }
      // Load tất cả dữ liệu một lần để tránh reload khi chuyển trang
      params.page = 0
      params.size = 500 // Load all data

      console.log('Course filter params:', params) // Debug log

      const res = await analyticsApi.getCourseAnalyticsDetails(params)
      setCourseDetails(res.data.content)
      setTotalCourseElements(res.data.totalElements)
      // Reset về trang đầu khi filter
      setCoursePage(0)
    } catch (error) {
      console.error('Error fetching course analytics:', error)
      toast.error('Lỗi khi tải dữ liệu course analytics')
    } finally {
      setLoadingCourse(false)
    }
  }

  const handleStudentFilter = async () => {
    setLoadingStudent(true)
    try {
      const params: any = {}
      if (
        timeRange === 'custom' &&
        selectedDateRange[0] &&
        selectedDateRange[1]
      ) {
        // Sử dụng local date format để tránh timezone issues
        params.startDate =
          selectedDateRange[0].getFullYear() +
          '-' +
          String(selectedDateRange[0].getMonth() + 1).padStart(2, '0') +
          '-' +
          String(selectedDateRange[0].getDate()).padStart(2, '0')
        params.endDate =
          selectedDateRange[1].getFullYear() +
          '-' +
          String(selectedDateRange[1].getMonth() + 1).padStart(2, '0') +
          '-' +
          String(selectedDateRange[1].getDate()).padStart(2, '0')
      } else {
        params.range = timeRange
      }
      // Load tất cả dữ liệu một lần để tránh reload khi chuyển trang
      params.page = 0
      params.size = 500 // Load all data

      console.log('Student filter params:', params) // Debug log

      const res = await analyticsApi.getStudentAnalyticsDetails(params)
      setStudentDetails(res.data.content)
      setTotalStudentElements(res.data.totalElements)
      // Reset về trang đầu khi filter
      setStudentPage(0)
    } catch (error) {
      console.error('Error fetching student analytics:', error)
      toast.error('Lỗi khi tải dữ liệu student analytics')
    } finally {
      setLoadingStudent(false)
    }
  }

  const handleRevenueFilter = async () => {
    setLoadingRevenue(true)
    try {
      const params: any = {}
      if (
        timeRange === 'custom' &&
        selectedDateRange[0] &&
        selectedDateRange[1]
      ) {
        // Sử dụng local date format để tránh timezone issues
        params.startDate =
          selectedDateRange[0].getFullYear() +
          '-' +
          String(selectedDateRange[0].getMonth() + 1).padStart(2, '0') +
          '-' +
          String(selectedDateRange[0].getDate()).padStart(2, '0')
        params.endDate =
          selectedDateRange[1].getFullYear() +
          '-' +
          String(selectedDateRange[1].getMonth() + 1).padStart(2, '0') +
          '-' +
          String(selectedDateRange[1].getDate()).padStart(2, '0')
      } else {
        params.range = timeRange
      }
      // Load tất cả dữ liệu một lần để tránh reload khi chuyển trang
      params.page = 0
      params.size = 500 // Load all data

      console.log('Revenue filter params:', params) // Debug log

      const res = await analyticsApi.getRevenueAnalyticsDetails(params)
      setRevenueDetails(res.data.content)
      setTotalRevenueElements(res.data.totalElements)
      // Reset về trang đầu khi filter
      setRevenuePage(0)
    } catch (error) {
      console.error('Error fetching revenue analytics:', error)
      toast.error('Lỗi khi tải dữ liệu revenue analytics')
    } finally {
      setLoadingRevenue(false)
    }
  }

  const handleFilter = async () => {
    await Promise.all([
      handleCategoryFilter(),
      handleCourseFilter(),
      handleStudentFilter(),
      handleRevenueFilter(),
    ])
  }

  useEffect(() => {
    handleCategoryFilter()
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  // Load both category and course data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          handleCategoryFilter(),
          handleCourseFilter(),
          handleStudentFilter(),
          handleRevenueFilter(),
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }

    loadInitialData()
  }, [timeRange])

  // Reload both category and course data when timeRange changes (after initial mount)
  useEffect(() => {
    if (hasMountedRef.current && timeRange) {
      handleFilter()
    }
    // eslint-disable-next-line
  }, [timeRange]);

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

  useEffect(() => {
    // Khôi phục khả năng cuộn bình thường cho trang
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'

    return () => {
      // Cleanup khi component unmount
    }
  }, [])

  // Pagination logic for category detail table
  const paginatedData = categoryDetails
  const totalRows = totalCategoryElements
  const totalPages = totalCategoryPages

  // Pagination logic for course detail table - Client-side
  const totalCourseRows = courseDetails.length
  const totalCoursePages =
    courseRowsPerPage === -1
      ? 1
      : Math.ceil(totalCourseRows / courseRowsPerPage)
  const paginatedCourseData =
    courseRowsPerPage === -1
      ? courseDetails
      : courseDetails.slice(
        coursePage * courseRowsPerPage,
        (coursePage + 1) * courseRowsPerPage
      )

  // Pagination logic for student activity table
  const totalStudentRows = studentDetails.length
  const totalStudentPages =
    studentRowsPerPage === -1
      ? 1
      : Math.ceil(totalStudentRows / studentRowsPerPage)
  const paginatedStudentData =
    studentRowsPerPage === -1
      ? studentDetails
      : studentDetails.slice(
        studentPage * studentRowsPerPage,
        (studentPage + 1) * studentRowsPerPage
      )

  // Pagination logic for revenue trends table
  const totalRevenueRows = revenueDetails.length
  const totalRevenuePages =
    revenueRowsPerPage === -1
      ? 1
      : Math.ceil(totalRevenueRows / revenueRowsPerPage)
  const paginatedRevenueData =
    revenueRowsPerPage === -1
      ? revenueDetails
      : revenueDetails.slice(
        revenuePage * revenueRowsPerPage,
        (revenuePage + 1) * revenueRowsPerPage
      )

  const handleCategoryRowClick = async (category: CategoryDetailDTO) => {
    setSelectedCategoryForCourses(category)
    setShowCategoryCoursesDialog(true)
    setLoadingCategoryCourses(true)
    try {
      const response = await courseApi.getCoursesByCategory(
        category.id.toString()
      )
      setCategoryCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses by category:', error)
      setCategoryCourses([])
    } finally {
      setLoadingCategoryCourses(false)
    }
  }

  const totalCategoryCoursesRevenue = categoryCourses.reduce(
    (sum, course) => sum + (course.finalPrice || 0),
    0
  )

  const handleDateRangeChange = (dates: [Date, Date] | null) => {
    setSelectedDateRange([dates ? dates[0] : null, dates ? dates[1] : null])
    if (dates) {
      const daysDiff = Math.ceil(
        (dates[1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24)
      )
      setPreviousPeriodLabel(`${daysDiff} Days Ago`)
    } else {
      setPreviousPeriodLabel('Previous Month')
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Analytics Dashboard</h1>
          <p className='text-muted-foreground'>
            Track your course performance and student engagement
          </p>
        </div>

        {/* Controls Section */}
        <div className='flex flex-wrap items-center gap-3 p-4 rounded-lg'>
          {/* Time Range Selector */}
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>
              Time Range:
            </label>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className='h-10 min-w-[140px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
            >
              <option value='7d'>Last 7 days</option>
              <option value='30d'>Last 30 days</option>
              <option value='90d'>Last 90 days</option>
              <option value='6m'>Last 6 months</option>
              <option value='1y'>Last year</option>
            </select>
          </div>

          {/* Date Range Picker */}
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>
              Custom Range:
            </label>
            <RangePicker
              format='YYYY-MM-DD'
              placeholder={['Start date', 'End date']}
              className='h-10'
              onChange={dates => {
                setSelectedDateRange([
                  (dates && dates[0] ? dates[0].toDate() : null) as Date | null,
                  (dates && dates[1] ? dates[1].toDate() : null) as Date | null,
                ])
                setTimeRange('custom')
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-2 ml-2'>
            <button
              onClick={handleFilter}
              disabled={
                timeRange !== 'custom' ||
                !selectedDateRange[0] ||
                !selectedDateRange[1]
              }
              className='h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md text-sm transition-colors inline-flex items-center gap-2'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                />
              </svg>
              Filter
            </button>

            <button
              type='button'
              className='h-10 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md text-sm transition-colors inline-flex items-center gap-2'
              onClick={handleExportClick}
              disabled={isExporting}
            >
              <Download
                className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`}
              />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='h-10 px-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md text-sm transition-colors inline-flex items-center gap-2'
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
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
              {totalRevenue.toLocaleString('vi-VN')} ₫
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
            <div className='text-2xl font-bold'>{courseDetails.length}</div>
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
        <div className='flex flex-col space-y-2'>
          <div className='flex items-center space-x-2'>
            <div className='text-sm font-medium text-gray-500'>
              Category Analysis:
            </div>
            <TabsList>
              <TabsTrigger value='category'>Category Overview</TabsTrigger>
            </TabsList>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='text-sm font-medium text-gray-500'>
              Course Analysis:
            </div>
            <TabsList>
              <TabsTrigger value='course'>Course Details</TabsTrigger>
              <TabsTrigger value='student'>Student Activity</TabsTrigger>
              <TabsTrigger value='revenue'>Revenue Trends</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className='min-h-[800px]'>
          {/* Category Tab */}
          <TabsContent value='category' className='space-y-4'>
            <Card>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle>Category Overview</CardTitle>
                    <CardDescription>
                      Analysis of course categories and their performance
                      metrics
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    <label className='text-sm'>Show</label>
                    <select
                      value={rowsPerPage}
                      onChange={e => {
                        setRowsPerPage(Number(e.target.value))
                        setPage(0) // reset về trang đầu
                      }}
                      className='border rounded px-2 py-1 ml-2'
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={-1}>All</option>
                    </select>
                    <span className='text-sm'></span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto border border-gray-200 rounded-md'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ID
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Category Name
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64'>
                        Details
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Courses
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Students
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Revenue (VND)
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Revenue Proportion (%)
                      </th>
                    </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                    {loadingCategory ? (
                      <tr>
                        <td
                          colSpan={7}
                          className='px-6 py-4 text-center text-gray-500'
                        >
                          <Loader2 className='h-5 w-5 animate-spin mx-auto' />{' '}
                          Loading categories...
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className='px-6 py-4 text-center text-gray-500'
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map(cat => (
                        <tr
                          key={cat.id}
                          className='cursor-pointer hover:bg-gray-50'
                          onClick={() => handleCategoryRowClick(cat)}
                        >
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {cat.id}
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-left text-gray-900'>
                            {(cat.name || '').replace(/\n|\r|\r\n/g, ' ')}
                          </td>
                          <td className='px-6 py-3 text-sm text-left text-gray-900'>
                            <div className='line-clamp-2'>
                              {(cat.description || '').replace(
                                /\n|\r|\r\n/g,
                                ' '
                              )}
                            </div>
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {cat.courseCount || 0}
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {cat.totalStudents}
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {cat.totalRevenue?.toLocaleString('vi-VN')} ₫
                          </td>
                          <td
                            className={
                              `px-6 py-3 whitespace-nowrap text-sm text-center ` +
                              (cat.revenueProportion === 0
                                ? 'text-black'
                                : cat.revenueProportion > 0 &&
                                cat.revenueProportion <= 20
                                  ? 'text-red-600'
                                  : 'text-green-600')
                            }
                          >
                            {cat.revenueProportion.toFixed(2)}%
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                  </table>
                </div>
                {paginatedData.length > 0 && (
                  <div className='flex items-center gap-2 mt-4 justify-center'>
                    <button
                      className='px-2 py-1 border rounded disabled:opacity-50'
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <button
                        key={idx}
                        className={`px-2 py-1 border rounded ${page === idx ? 'bg-gray-200 font-bold' : ''}`}
                        onClick={() => setPage(idx)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      className='px-2 py-1 border rounded disabled:opacity-50'
                      disabled={page === totalPages - 1}
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
          <TabsContent value='course' className='space-y-4'>
            <Card>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle>Course Details</CardTitle>
                    <CardDescription>
                      Detailed analysis of individual course performance
                    </CardDescription>
                  </div>
                  <label className='flex items-center text-sm'>
                    Show
                    <select
                      value={courseRowsPerPage}
                      onChange={e => {
                        setCourseRowsPerPage(Number(e.target.value))
                        setCoursePage(0) // Reset về trang đầu
                      }}
                      className='border rounded px-2 py-1 ml-2'
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
                <div className='overflow-x-auto border border-gray-200 rounded-md'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ID
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Course Name
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Students
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Rating
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Revenue (VND)
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Revenue %
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Reviews
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Level
                      </th>
                    </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                    {loadingCourse ? (
                      <tr>
                        <td
                          colSpan={8}
                          className='px-6 py-4 text-center text-gray-500'
                        >
                          <Loader2 className='h-5 w-5 animate-spin mx-auto' />{' '}
                          Loading courses...
                        </td>
                      </tr>
                    ) : courseDetails.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className='px-6 py-4 text-center text-gray-500'
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      paginatedCourseData.map((course, idx) => (
                        <tr key={course.courseId}>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {course.courseId}
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-left text-gray-900'>
                            {course.courseName}
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {course.students}
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {course.rating?.toFixed(1) || '0.0'}
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {course.revenue?.toLocaleString('vi-VN') || '0'} ₫
                          </td>
                          <td
                            className={`px-6 py-3 whitespace-nowrap text-sm text-center ${
                              course.revenuePercent === 0
                                ? 'text-black'
                                : course.revenuePercent > 0 &&
                                course.revenuePercent <= 20
                                  ? 'text-red-600'
                                  : 'text-green-600'
                            }`}
                          >
                            {course.revenuePercent?.toFixed(2)}%
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {course.reviews}
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {course.level || 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                  </table>
                </div>
                {courseDetails.length > 0 && (
                  <div className='flex items-center gap-2 mt-4 justify-center'>
                    <button
                      className='px-2 py-1 border rounded disabled:opacity-50'
                      disabled={coursePage === 0}
                      onClick={() => setCoursePage(coursePage - 1)}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalCoursePages }, (_, idx) => (
                      <button
                        key={idx}
                        className={`px-2 py-1 border rounded ${coursePage === idx ? 'bg-gray-200 font-bold' : ''}`}
                        onClick={() => setCoursePage(idx)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      className='px-2 py-1 border rounded disabled:opacity-50'
                      disabled={coursePage === totalCoursePages - 1}
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
          <TabsContent value='student' className='space-y-4'>
            <Card>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle>Student Activity</CardTitle>
                    <CardDescription>
                      Course-specific student engagement and completion metrics
                    </CardDescription>
                  </div>
                  <label className='flex items-center text-sm'>
                    Show
                    <select
                      value={studentRowsPerPage}
                      onChange={e => {
                        setStudentRowsPerPage(Number(e.target.value))
                        setStudentPage(0)
                      }}
                      className='border rounded px-2 py-1 ml-2'
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
                <div className='overflow-x-auto border border-gray-200 rounded-md'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ID
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Course Name
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        New Students
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Previously
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Growth (%)
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Reviews
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Avg Rating
                      </th>
                    </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                    {loadingStudent ? (
                      <tr>
                        <td
                          colSpan={7}
                          className='px-6 py-4 text-center text-gray-500'
                        >
                          <Loader2 className='h-5 w-5 animate-spin mx-auto' />{' '}
                          Loading student analytics...
                        </td>
                      </tr>
                    ) : paginatedStudentData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className='px-6 py-4 text-center text-gray-500'
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      paginatedStudentData.map(data => (
                        <tr key={data.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.id}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-left text-gray-900'>
                            {data.courseName}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.newStudents}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.previousCompletion}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm text-center ${
                              data.growth === 0
                                ? 'text-black'
                                : data.growth > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {data.growth > 0 ? '+' : ''}
                            {data.growth}%
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.reviews}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.avgRating}
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                  </table>
                </div>
                {studentDetails.length > 0 && (
                  <div className='flex items-center gap-2 mt-4 justify-center'>
                    <button
                      className='px-2 py-1 border rounded disabled:opacity-50'
                      disabled={studentPage === 0}
                      onClick={() => setStudentPage(studentPage - 1)}
                    >
                      Previous
                    </button>
                    {Array.from(
                      {
                        length: Math.ceil(
                          totalStudentRows / studentRowsPerPage
                        ),
                      },
                      (_, idx) => (
                        <button
                          key={idx}
                          className={`px-2 py-1 border rounded ${studentPage === idx ? 'bg-gray-200 font-bold' : ''}`}
                          onClick={() => setStudentPage(idx)}
                        >
                          {idx + 1}
                        </button>
                      )
                    )}
                    <button
                      className='px-2 py-1 border rounded disabled:opacity-50'
                      disabled={
                        studentPage ===
                        Math.ceil(totalStudentRows / studentRowsPerPage) - 1
                      }
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
          <TabsContent value='revenue' className='space-y-4'>
            <Card>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>
                      Course-specific revenue performance and growth analysis
                    </CardDescription>
                  </div>
                  <label className='flex items-center text-sm'>
                    Show
                    <select
                      value={revenueRowsPerPage}
                      onChange={e => {
                        setRevenueRowsPerPage(Number(e.target.value))
                        setRevenuePage(0)
                      }}
                      className='border rounded px-2 py-1 ml-2'
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
                <div className='overflow-x-auto border border-gray-200 rounded-md'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ID
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Course Name
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Revenue
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Previously
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Growth (%)
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Orders
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        New Students
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Revenue Share (%)
                      </th>
                    </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                    {loadingRevenue ? (
                      <tr>
                        <td
                          colSpan={8}
                          className='px-6 py-4 text-center text-gray-500'
                        >
                          <Loader2 className='h-5 w-5 animate-spin mx-auto' />{' '}
                          Loading revenue analytics...
                        </td>
                      </tr>
                    ) : paginatedRevenueData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className='px-6 py-4 text-center text-gray-500'
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      paginatedRevenueData.map(data => (
                        <tr key={data.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.id}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-left text-gray-900'>
                            {data.courseName}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.revenue.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.previousRevenue.toLocaleString('vi-VN')} ₫
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm text-center ${
                              data.growth === 0
                                ? 'text-black'
                                : data.growth > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {data.growth > 0 ? '+' : ''}
                            {data.growth}%
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.orders}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.newStudents}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {data.revenueShare}%
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                  </table>
                </div>
                {revenueDetails.length > 0 && (
                  <div className='flex items-center gap-2 mt-4 justify-center'>
                    <button
                      className='px-2 py-1 border rounded disabled:opacity-50'
                      disabled={revenuePage === 0}
                      onClick={() => setRevenuePage(revenuePage - 1)}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalRevenuePages }, (_, idx) => (
                      <button
                        key={idx}
                        className={`px-2 py-1 border rounded ${revenuePage === idx ? 'bg-gray-200 font-bold' : ''}`}
                        onClick={() => setRevenuePage(idx)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      className='px-2 py-1 border rounded disabled:opacity-50'
                      disabled={revenuePage === totalRevenuePages - 1}
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
      <Dialog
        open={showCategoryCoursesDialog}
        onOpenChange={setShowCategoryCoursesDialog}
        modal
      >
        <DialogContent className='sm:max-w-4xl p-6 max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              Courses in {selectedCategoryForCourses?.name}
            </DialogTitle>
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
                  <CardDescription>
                    Breakdown of revenue by course within{' '}
                    {selectedCategoryForCourses?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className='h-[250px]'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={categoryCourses.map(course => ({
                            name: course.title,
                            value: course.finalPrice || 0,
                          }))}
                          dataKey='value'
                          nameKey='name'
                          cx='50%'
                          cy='50%'
                          outerRadius={80}
                          fill='#8884d8'
                          labelLine={false}
                          label={renderCustomizedLabel}
                        >
                          {categoryCourses.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                        ></ChartTooltip>
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
                  <div className='w-full overflow-x-auto max-h-[400px] overflow-y-auto border border-gray-200 rounded-md'>
                    <table className='min-w-[1500px] border bg-white table-fixed text-xs md:text-sm'>
                      <thead>
                      <tr className='bg-gray-50'>
                        <th className='px-2 py-2 border text-center font-semibold whitespace-nowrap'>
                          ID
                        </th>
                        <th className='px-2 py-2 border text-left font-semibold whitespace-nowrap'>
                          Course Name
                        </th>
                        <th className='px-2 py-2 border text-center font-semibold whitespace-nowrap'>
                          Enrollments
                        </th>
                        <th className='px-2 py-2 border text-center font-semibold whitespace-nowrap'>
                          Rating
                        </th>
                        <th className='px-2 py-2 border text-center font-semibold whitespace-nowrap'>
                          Revenue
                        </th>
                        <th className='px-2 py-2 border text-center font-semibold whitespace-nowrap'>
                          Completion %
                        </th>
                      </tr>
                      </thead>
                      <tbody>
                      {categoryCourses.map((course, idx) => (
                        <tr key={course.id}>
                          <td className='border px-2 py-2 text-center align-top'>
                            {idx + 1}
                          </td>
                          <td className='border px-2 py-2 align-top'>
                            {course.title}
                          </td>
                          <td className='border px-2 py-2 text-center align-top'>
                            {course.totalStudents}
                          </td>
                          <td className='border px-2 py-2 text-center align-top'>
                            {course.averageRating?.toFixed(1) || 'N/A'}
                          </td>
                          <td className='border px-2 py-2 text-center align-top'>
                            {course.finalPrice?.toLocaleString('vi-VN') ||
                              '0'}{' '}
                            ₫
                          </td>
                          <td className='border px-2 py-2 text-center align-top'>
                            {Math.floor(Math.random() * 30 + 70)}%
                          </td>
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
      <Dialog
        open={showExportDialog}
        onOpenChange={open => {
          if (!open) {
            handleCloseExportDialog()
          }
        }}
        modal
      >
        <DialogContent
          key='export-dialog'
          className='sm:max-w-[600px] p-6 max-h-[90vh] overflow-y-auto'
        >
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-gray-800'>
              Export Analytics Report
            </DialogTitle>
            <p className='text-sm text-gray-600 mt-2'>
              Configure your export settings and download comprehensive
              analytics data
            </p>
          </DialogHeader>

          <div className='grid gap-6 py-4'>
            {/* Data Selection Section */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b pb-2'>
                <div className='w-4 h-4 bg-blue-500 rounded-sm'></div>
                <span className='font-semibold text-lg text-gray-800'>
                  Select Data to Export
                </span>
              </div>
              <div className='grid grid-cols-1 gap-3'>
                {Object.keys(exportOptions).map(key => (
                  <div
                    key={key}
                    className='flex flex-col gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-gray-50/50'
                  >
                    <div className='flex items-center space-x-3'>
                      <Checkbox
                        id={key}
                        checked={Boolean(
                          exportOptions[key as keyof typeof exportOptions]
                            .checked
                        )}
                        onCheckedChange={value =>
                          setExportOptions(prev => ({
                            ...prev,
                            [key]: {
                              ...prev[key as keyof typeof prev],
                              checked: value === true,
                            },
                          }))
                        }
                        className='w-5 h-5'
                      />
                      <label
                        htmlFor={key}
                        className='text-base font-medium flex-1 cursor-pointer text-gray-700'
                      >
                        {key === 'category' ? '📊 Categories Analytics' : ''}
                        {key === 'course' ? '📚 Course Performance' : ''}
                        {key === 'student' ? '👥 Student Activity' : ''}
                        {key === 'revenue' ? '💰 Revenue Trends' : ''}
                      </label>
                    </div>
                    {exportOptions[key as keyof typeof exportOptions]
                      .checked && (
                      <div className='ml-8 mt-2'>
                        <label className='block text-sm font-medium text-gray-600 mb-2'>
                          Number of records:
                        </label>
                        <select
                          value={exportOptions[
                            key as keyof typeof exportOptions
                            ].rowCount.toString()}
                          onChange={e =>
                            setExportOptions(prev => ({
                              ...prev,
                              [key]: {
                                ...prev[key as keyof typeof prev],
                                rowCount: Number(e.target.value),
                              },
                            }))
                          }
                          className='w-[200px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                        >
                          <option value='5'>First 5 records</option>
                          <option value='10'>First 10 records</option>
                          <option value='20'>First 20 records</option>
                          <option value='50'>First 50 records</option>
                          <option value='-1'>All records</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Time Range Section */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b pb-2'>
                <div className='w-4 h-4 bg-green-500 rounded-sm'></div>
                <span className='font-semibold text-lg text-gray-800'>
                  Time Range
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Time Range Selector */}
                <div className='space-y-3'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Quick Select:
                  </label>
                  <select
                    value={exportTimeRange}
                    onChange={e => {
                      setExportTimeRange(e.target.value)
                      if (e.target.value !== 'custom') {
                        setExportDateRange(null) // Clear custom date when using quick select
                      }
                    }}
                    className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                  >
                    <option value='7d'>Last 7 days</option>
                    <option value='30d'>Last 30 days</option>
                    <option value='90d'>Last 90 days</option>
                    <option value='6m'>Last 6 months</option>
                    <option value='1y'>Last year</option>
                    <option value='custom'>Custom Range</option>
                  </select>
                </div>

                {/* Custom Date Range */}
                <div className='space-y-3'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Custom Date Range:
                  </label>
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['Start date', 'End date']}
                    format='DD/MM/YYYY'
                    onChange={dates => {
                      setExportDateRange(dates as [Date, Date] | null)
                      if (dates) {
                        setExportTimeRange('custom')
                      }
                    }}
                    disabled={exportTimeRange !== 'custom'}
                    className={exportTimeRange !== 'custom' ? 'opacity-50' : ''}
                  />
                </div>
              </div>

              {/* Time Range Preview */}
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                <div className='flex items-center gap-2 text-blue-800'>
                  <svg
                    className='w-4 h-4'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    ></path>
                  </svg>
                  <span className='text-sm font-medium'>Export Period:</span>
                </div>
                <p className='text-sm text-blue-700 mt-1'>
                  {exportDateRange && exportDateRange[0] && exportDateRange[1]
                    ? `${exportDateRange[0].toLocaleDateString('en-GB')} - ${exportDateRange[1].toLocaleDateString('en-GB')}`
                    : exportTimeRange === '7d'
                      ? 'Last 7 days'
                      : exportTimeRange === '30d'
                        ? 'Last 30 days'
                        : exportTimeRange === '90d'
                          ? 'Last 90 days'
                          : exportTimeRange === '6m'
                            ? 'Last 6 months'
                            : exportTimeRange === '1y'
                              ? 'Last year'
                              : 'Please select a time range'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className='mt-6 gap-3'>
            <Button
              variant='outline'
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                handleCloseExportDialog()
              }}
              className='px-6'
            >
              Cancel
            </Button>
            <Button
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                handleExport()
              }}
              disabled={
                isExporting ||
                !Object.values(exportOptions).some(o => o.checked)
              }
              className='px-6 bg-blue-600 hover:bg-blue-700'
            >
              {isExporting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className='mr-2 h-4 w-4' />
                  Export Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}