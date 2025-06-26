'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { analyticsApi } from '@/services/analytics-api'
import { CategoryDetailDTO, CourseAnalyticsDetailResponseDTO, RevenueAnalyticsDetailResponseDTO, StudentAnalyticsDetailResponseDTO } from '@/types/analytics'
import { formatDateForAPI } from '@/utils/analytics-utils'
import { BookOpen, DollarSign, Download, Loader2, RefreshCw, Star, TrendingUp, Users } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'react-hot-toast'
import { AnalyticsExportDialog } from './AnalyticsExportDialog'
import { PaginationComponent } from './PaginationComponent'

// Helper function để tạo params cho API calls
const createApiParams = (timeRange: string, selectedDateRange?: DateRange) => {
  const params: any = {}
  if (timeRange === 'custom' && selectedDateRange?.from && selectedDateRange?.to) {
    params.startDate = formatDateForAPI(selectedDateRange.from)
    params.endDate = formatDateForAPI(selectedDateRange.to)
  } else {
    params.range = timeRange
  }
  params.page = 0
  params.size = 500
  return params
}

// Helper function để tạo pagination logic
const createPaginationLogic = (data: any[], currentPage: number, rowsPerPage: number) => {
  const totalRows = data.length
  const totalPages = rowsPerPage === -1 ? 1 : Math.ceil(totalRows / rowsPerPage)
  const paginatedData = rowsPerPage === -1 
    ? data 
    : data.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
  
  return { totalRows, totalPages, paginatedData }
}

// Helper function để tạo rows per page selector
const createRowsPerPageSelector = (value: number, onChange: (value: number) => void, onPageReset: () => void) => (
  <label className='flex items-center text-sm'>
    Show
    <select
      value={value}
      onChange={e => {
        onChange(Number(e.target.value))
        onPageReset()
      }}
      className='border rounded px-2 py-1 ml-2'
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={-1}>All</option>
    </select>
  </label>
)

// Helper function để tạo loading row
const createLoadingRow = (colSpan: number, message: string) => (
  <tr>
    <td colSpan={colSpan} className='px-6 py-4 text-center text-gray-500'>
      <Loader2 className='h-5 w-5 animate-spin mx-auto' /> {message}
    </td>
  </tr>
)

// Helper function để tạo empty row
const createEmptyRow = (colSpan: number) => (
  <tr>
    <td colSpan={colSpan} className='px-6 py-4 text-center text-gray-500'>
      No data available
    </td>
  </tr>
)

// Helper function để tạo table header
const createTableHeader = (headers: string[]) => (
  <thead className='bg-gray-50'>
    <tr>
      {headers.map((header, index) => (
        <th key={index} className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
          {header}
        </th>
      ))}
    </tr>
  </thead>
)

// Custom label cho PieChart để tránh dính chữ
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent === 0) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * radius * Math.sin(-midAngle * RADIAN)
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

export function ManagerAnalytics() {
  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#8dd1e1', '#d88884',
  ]
  
  // Common states
  const [timeRange, setTimeRange] = useState('6m')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>()

  // Category Analytics State
  const [loadingCategory, setLoadingCategory] = useState(false)
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetailDTO[]>([])
  const [totalCategoryElements, setTotalCategoryElements] = useState(0)
  const [totalCategoryPages, setTotalCategoryPages] = useState(1)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Course Analytics State
  const [loadingCourse, setLoadingCourse] = useState(false)
  const [courseDetails, setCourseDetails] = useState<CourseAnalyticsDetailResponseDTO[]>([])
  const [totalCourseElements, setTotalCourseElements] = useState(0)
  const [coursePage, setCoursePage] = useState(0)
  const [courseRowsPerPage, setCourseRowsPerPage] = useState(5)

  // Student Analytics State
  const [loadingStudent, setLoadingStudent] = useState(false)
  const [studentDetails, setStudentDetails] = useState<StudentAnalyticsDetailResponseDTO[]>([])
  const [totalStudentElements, setTotalStudentElements] = useState(0)
  const [studentPage, setStudentPage] = useState(0)
  const [studentRowsPerPage, setStudentRowsPerPage] = useState(5)

  // Revenue Analytics State
  const [loadingRevenue, setLoadingRevenue] = useState(false)
  const [revenueDetails, setRevenueDetails] = useState<RevenueAnalyticsDetailResponseDTO[]>([])
  const [totalRevenueElements, setTotalRevenueElements] = useState(0)
  const [revenuePage, setRevenuePage] = useState(0)
  const [revenueRowsPerPage, setRevenueRowsPerPage] = useState(5)

  // Other states
  const hasMountedRef = useRef(false)

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

  const handleCategoryFilter = async () => {
    const params = createApiParams(timeRange, selectedDateRange)
    const res = await analyticsApi.getCategoryAnalyticsDetails(params)
    setCategoryDetails(res.data.content || [])
    setTotalCategoryElements(res.data.totalElements || 0)
    setTotalCategoryPages(res.data.totalPages || 1)
  }

  const handleCourseFilter = async () => {
    setLoadingCourse(true)
    try {
      const params = createApiParams(timeRange, selectedDateRange)
      const res = await analyticsApi.getCourseAnalyticsDetails(params)
      setCourseDetails(res.data.content || [])
      setTotalCourseElements(res.data.totalElements || 0)
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
      const params = createApiParams(timeRange, selectedDateRange)
      const res = await analyticsApi.getStudentAnalyticsDetails(params)
      setStudentDetails(res.data.content || [])
      setTotalStudentElements(res.data.totalElements || 0)
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
      const params = createApiParams(timeRange, selectedDateRange)
      const res = await analyticsApi.getRevenueAnalyticsDetails(params)
      setRevenueDetails(res.data.content || [])
      setTotalRevenueElements(res.data.totalElements || 0)
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

  // Removed useEffect for page/rowsPerPage since we're using client-side pagination now

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
    // Khôi phục khả năng cuộn bình thường cho trang
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'

    return () => {
      // Cleanup khi component unmount
    }
  }, [])

  // Pagination logic for category detail table - Convert to client-side for consistency
  const { totalRows, totalPages, paginatedData } = createPaginationLogic(categoryDetails, page, rowsPerPage)

  // Pagination logic for course detail table - Client-side
  const { totalRows: totalCourseRows, totalPages: totalCoursePages, paginatedData: paginatedCourseData } = createPaginationLogic(courseDetails, coursePage, courseRowsPerPage)

  // Pagination logic for student activity table
  const { totalRows: totalStudentRows, totalPages: totalStudentPages, paginatedData: paginatedStudentData } = createPaginationLogic(studentDetails, studentPage, studentRowsPerPage)

  // Pagination logic for revenue trends table
  const { totalRows: totalRevenueRows, totalPages: totalRevenuePages, paginatedData: paginatedRevenueData } = createPaginationLogic(revenueDetails, revenuePage, revenueRowsPerPage)

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    setSelectedDateRange(dateRange)
    if (dateRange?.from && dateRange?.to) {
      setTimeRange('custom')
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header - Clean and Simple Layout */}
      <div className='space-y-4'>
        {/* Title Section */}
        <div>
          <h1 className='text-3xl font-bold'>Analytics Dashboard</h1>
          <p className='text-muted-foreground'>
            Track your course performance and student engagement
          </p>
        </div>

        {/* Controls Section */}
        <div className='flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 rounded-lg'>
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
            <DateRangePicker
              value={selectedDateRange}
              onChange={handleDateRangeChange}
              className='h-10 w-60'
            />
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-2 md:ml-auto'>
            <button
              onClick={handleFilter}
              disabled={timeRange !== 'custom' || !selectedDateRange?.from || !selectedDateRange?.to}
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
            >
              <Download className='w-4 h-4' />
              Export
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
                    {createRowsPerPageSelector(rowsPerPage, setRowsPerPage, () => setPage(0))}
                    <span className='text-sm'></span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto border border-gray-200 rounded-md'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    {createTableHeader(['ID', 'Category Name', 'Details', 'Courses', 'Students', 'Revenue (VND)', 'Revenue Proportion (%)'])}
                    <tbody className='bg-white divide-y divide-gray-200'>
                    {loadingCategory ? createLoadingRow(7, 'Loading categories...') : paginatedData.length === 0 ? createEmptyRow(7) : paginatedData.map((cat, index) => (
                        <tr
                          key={cat.id}
                          className='cursor-pointer hover:bg-gray-50'
                        >
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {rowsPerPage === -1 ? index + 1 : page * rowsPerPage + (index + 1)}
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
                          <td className={`px-6 py-3 whitespace-nowrap text-sm text-center ${cat.revenueProportion === 0 ? 'text-black' : cat.revenueProportion > 0 && cat.revenueProportion <= 20 ? 'text-red-600' : 'text-green-600'}`}>
                            {cat.revenueProportion.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationComponent
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalRows}
                  itemsPerPage={rowsPerPage}
                  onPageChange={setPage}
                  dataLength={paginatedData.length}
                />
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
                  <div className='flex items-center gap-2'>
                    {createRowsPerPageSelector(courseRowsPerPage, setCourseRowsPerPage, () => setCoursePage(0))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto border border-gray-200 rounded-md'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    {createTableHeader(['ID', 'Course Name', 'Students', 'Rating', 'Revenue (VND)', 'Revenue %', 'Reviews', 'Level'])}
                    <tbody className='bg-white divide-y divide-gray-200'>
                    {loadingCourse ? createLoadingRow(8, 'Loading courses...') : courseDetails.length === 0 ? createEmptyRow(8) : paginatedCourseData.map((course, idx) => (
                        <tr key={course.courseId}>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {courseRowsPerPage === -1 ? idx + 1 : coursePage * courseRowsPerPage + (idx + 1)}
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
                          <td className={`px-6 py-3 whitespace-nowrap text-sm text-center ${course.revenuePercent === 0 ? 'text-black' : course.revenuePercent > 0 && course.revenuePercent <= 20 ? 'text-red-600' : 'text-green-600'}`}>
                            {course.revenuePercent?.toFixed(2)}%
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {course.reviews}
                          </td>
                          <td className='px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900'>
                            {course.level || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationComponent
                  currentPage={coursePage}
                  totalPages={totalCoursePages}
                  totalItems={courseDetails.length}
                  itemsPerPage={courseRowsPerPage}
                  onPageChange={setCoursePage}
                  dataLength={courseDetails.length}
                />
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
                  {createRowsPerPageSelector(studentRowsPerPage, setStudentRowsPerPage, () => setStudentPage(0))}
                </div>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto border border-gray-200 rounded-md'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    {createTableHeader(['ID', 'Course Name', 'New Students', 'Previously', 'Growth (%)', 'Reviews', 'Avg Rating'])}
                    <tbody className='bg-white divide-y divide-gray-200'>
                    {loadingStudent ? createLoadingRow(7, 'Loading student analytics...') : paginatedStudentData.length === 0 ? createEmptyRow(7) : paginatedStudentData.map((data, index) => (
                        <tr key={data.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {studentRowsPerPage === -1 ? index + 1 : studentPage * studentRowsPerPage + (index + 1)}
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
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${data.growth === 0 ? 'text-black' : data.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationComponent
                  currentPage={studentPage}
                  totalPages={totalStudentPages}
                  totalItems={studentDetails.length}
                  itemsPerPage={studentRowsPerPage}
                  onPageChange={setStudentPage}
                  dataLength={studentDetails.length}
                />
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
                  {createRowsPerPageSelector(revenueRowsPerPage, setRevenueRowsPerPage, () => setRevenuePage(0))}
                </div>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto border border-gray-200 rounded-md'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    {createTableHeader(['ID', 'Course Name', 'Revenue', 'Previously', 'Growth (%)', 'Orders', 'New Students', 'Revenue Share (%)'])}
                    <tbody className='bg-white divide-y divide-gray-200'>
                    {loadingRevenue ? createLoadingRow(8, 'Loading revenue analytics...') : paginatedRevenueData.length === 0 ? createEmptyRow(8) : paginatedRevenueData.map((data, index) => (
                        <tr key={data.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                            {revenueRowsPerPage === -1 ? index + 1 : revenuePage * revenueRowsPerPage + (index + 1)}
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
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${data.growth === 0 ? 'text-black' : data.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationComponent
                  currentPage={revenuePage}
                  totalPages={totalRevenuePages}
                  totalItems={revenueDetails.length}
                  itemsPerPage={revenueRowsPerPage}
                  onPageChange={setRevenuePage}
                  dataLength={revenueDetails.length}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
      <AnalyticsExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />
    </div>
  )
}