'use client'

import { courseApi } from '@/services/course-api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ManagerCourseResponseDTO } from '@/types/course'
import {
  Archive,
  BookOpen,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export function ManagerCourseList() {
  const [courses, setCourses] = useState<ManagerCourseResponseDTO[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory)
  const [sortBy, setSortBy] = useState<string>('lastUpdatedDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    course: ManagerCourseResponseDTO | null
  }>({
    open: false,
    course: null,
  })
  const [deleting, setDeleting] = useState(false)
  const [statusList, setStatusList] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState<string>('PUBLISHED')
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)

  // Lấy danh sách status động từ backend
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await courseApi.getCourseStatuses()
        if (res.data) setStatusList(res.data)
      } catch (e) {
        setStatusList({
          PUBLISHED: 'Published',
          DRAFT: 'Draft',
          ARCHIVED: 'Archived',
        })
      }
    }
    fetchStatuses()
  }, [])

  // Lấy courses theo status, category, page
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        setError(null)
        const params: any = { status: statusFilter }
        if (categoryFilter !== 'all') params.category = categoryFilter
        const courses = await courseApi.getAllCoursesByStatus(params)
        setCourses(Array.isArray(courses) ? courses : [])
      } catch (err) {
        setError('Failed to load courses. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    loadCourses()
  }, [statusFilter, categoryFilter])

  // Reset page về 0 khi filter/search/sort thay đổi
  useEffect(() => {
    setPage(0)
  }, [statusFilter, categoryFilter, searchTerm, sortBy, sortOrder])

  // Get unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(courses.map(course => course.category)))
  }, [courses])

  // Filter + sort + search (chỉ search ở client)
  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter(course => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'enrollments':
          comparison = Number(a.totalEnrollments) - Number(b.totalEnrollments)
          break
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0)
          break
        case 'lastUpdatedDate':
          comparison =
            new Date(a.lastUpdatedDate).getTime() -
            new Date(b.lastUpdatedDate).getTime()
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    return filtered
  }, [courses, searchTerm, sortBy, sortOrder])

  // Phân trang ở frontend
  const pagedCourses = useMemo(() => {
    const start = page * pageSize
    const end = start + pageSize
    return filteredAndSortedCourses.slice(start, end)
  }, [filteredAndSortedCourses, page, pageSize])

  // total là tổng số courses sau filter/search
  const total = filteredAndSortedCourses.length

  // Thống kê
  const totalEnrollments = courses.reduce(
    (sum, course) => sum + Number(course.totalEnrollments),
    0
  )
  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED').length
  const draftCourses = courses.filter(c => c.status === 'DRAFT').length
  const archivedCourses = courses.filter(c => c.status === 'ARCHIVED').length
  const averageRating =
    courses
      .filter(c => (c.rating || 0) > 0)
      .reduce((sum, course) => sum + (course.rating || 0), 0) /
    (courses.filter(c => (c.rating || 0) > 0).length || 1)

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      const params: any = { status: statusFilter }
      if (categoryFilter !== 'all') params.category = categoryFilter
      const courses = await courseApi.getAllCoursesByStatus(params)
      setCourses(Array.isArray(courses) ? courses : [])
      toast.success('Course data has been updated successfully.')
    } catch (err) {
      toast.error('Failed to refresh course data. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDeleteCourse = async (course: ManagerCourseResponseDTO) => {
    try {
      setDeleting(true)
      // await courseApi.deleteCourse(Number(course.id))
      await new Promise(resolve => setTimeout(resolve, 2000))
      if (Math.random() < 0.1) {
        throw new Error('Failed to delete course. Please try again.')
      }
      setCourses(prev => prev.filter(c => c.id !== course.id))
      toast.success(`"${course.title}" has been successfully deleted.`)
      setDeleteDialog({ open: false, course: null })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
    } finally {
      setDeleting(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getLevelBadge = (level: string) => {
    const colors = {
      beginner:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      intermediate:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }

    return (
      <Badge className={colors[level as keyof typeof colors]}>{level}</Badge>
    )
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-muted-foreground'>Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <div className='text-6xl'>⚠️</div>
          <h3 className='text-xl font-semibold'>Error Loading Courses</h3>
          <p className='text-muted-foreground max-w-md mx-auto'>{error}</p>
          <Button onClick={() => window.location.reload()} variant='outline'>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Course Management</h1>
        <p className='text-muted-foreground text-lg mt-1'>
          Organize and manage your courses for better navigation and discovery.
        </p>
      </div>
      <div className='flex items-center justify-between mb-6'>
        <Tabs
          value={statusFilter}
          onValueChange={v => {
            setStatusFilter(v)
            setPage(0)
          }}
          className='mr-4'
        >
          <TabsList>
            {Object.entries(statusList).map(([key, label]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
          <Button asChild>
            <Link href='/manager/create'>Create Course</Link>
          </Button>
        </div>
      </div>
      <div className='grid gap-4 md:grid-cols-4 mb-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{courses.length}</div>
            <p className='text-xs text-muted-foreground'>
              {publishedCourses} published, {draftCourses} draft,{' '}
              {archivedCourses} archived
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {totalEnrollments.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>Across all courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{averageRating.toFixed(1)}</div>
            <p className='text-xs text-muted-foreground'>
              From student reviews
            </p>
          </CardContent>
        </Card>
      </div>
      <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4'>
        <Select
          value={categoryFilter}
          onValueChange={v => {
            setCategoryFilter(v)
            setPage(0)
          }}
        >
          <SelectTrigger className='w-full md:w-[200px]'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className='relative flex-1'>
          <Input
            placeholder='Search courses...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Button variant='outline'>Export</Button>
      </div>
      <div className='border rounded-lg overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[320px]'>Course</TableHead>
              <TableHead
                className='text-center cursor-pointer hover:bg-muted/50'
                onClick={() => handleSort('status')}
              >
                Status
              </TableHead>
              <TableHead
                className='text-right cursor-pointer hover:bg-muted/50'
                onClick={() => handleSort('enrollments')}
              >
                Enrollments
              </TableHead>
              <TableHead
                className='text-right cursor-pointer hover:bg-muted/50'
                onClick={() => handleSort('rating')}
              >
                Rating
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-muted/50'
                onClick={() => handleSort('lastUpdatedDate')}
              >
                Last Updated
              </TableHead>
              <TableHead className='w-16 text-center'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedCourses.map(course => (
              <TableRow
                key={course.id}
                className='hover:bg-muted/40 transition'
              >
                <TableCell>
                  <div className='flex items-center space-x-3'>
                    <Avatar className='h-12 w-12 shadow'>
                      <AvatarImage src={course.thumbnailUrl ?? undefined} />
                      <AvatarFallback>{course.title[0]}</AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                      <div className='font-semibold truncate text-base'>
                        {course.title}
                      </div>
                      <div className='text-sm text-muted-foreground truncate max-w-xs'>
                        {course.description}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {course.category}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-center'>
                  <Badge
                    variant={
                      course.status === 'DRAFT'
                        ? 'secondary'
                        : course.status === 'ARCHIVED'
                          ? 'destructive'
                          : 'default'
                    }
                    className={
                      course.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-none'
                        : ''
                    }
                  >
                    {statusList[course.status] || course.status}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <span className='font-medium'>
                    {Number(course.totalEnrollments).toLocaleString()}
                  </span>
                  <span className='text-xs text-muted-foreground ml-1'>
                    students
                  </span>
                </TableCell>
                <TableCell className='text-right'>
                  {course.rating !== null && course.rating > 0 ? (
                    <div className='flex items-center justify-end gap-1'>
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <span className='font-semibold'>
                        {(course.rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>No ratings</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className='text-sm'>
                    {new Date(course.lastUpdatedDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className='text-center'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='rounded-full hover:bg-accent'
                      >
                        <MoreVertical className='h-5 w-5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem asChild>
                        <Link href={`/manager/courses/${course.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {course.canEdit && (
                        <DropdownMenuItem asChild>
                          <Link href={`/manager/courses/${course.id}/edit`}>
                            Edit Course
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {/* Lifecycle actions */}
                      {course.status?.toUpperCase() === 'ARCHIVED' && (
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              await courseApi.restoreCourse(
                                course.id.toString()
                              )
                              toast.success(
                                `"${course.title}" has been restored successfully.`
                              )
                              await handleRefresh()
                            } catch (err: any) {
                              // Don't log expected business logic errors to console
                              if (err?.response?.status !== 400) {
                                console.error('Unexpected restore error:', err)
                              }

                              let errorMessage =
                                'An error occurred while restoring the course'

                              // Parse backend error message
                              if (err?.response?.data) {
                                const backendMessage =
                                  err.response.data.detail ||
                                  err.response.data.message ||
                                  err.response.data.error ||
                                  err.message
                                errorMessage = backendMessage
                              } else if (err?.message) {
                                errorMessage = err.message
                              }

                              // Add prefix if needed
                              if (
                                !errorMessage.toLowerCase().includes('cannot')
                              ) {
                                errorMessage = `Cannot restore: ${errorMessage}`
                              }

                              toast.error(
                                `Cannot Restore Course: ${errorMessage}`
                              )
                            }
                          }}
                        >
                          Restore Course
                        </DropdownMenuItem>
                      )}
                      {course.status?.toUpperCase() === 'DRAFT' && (
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              await courseApi.publishCourse(
                                course.id.toString()
                              )
                              toast.success(
                                `"${course.title}" has been published successfully.`
                              )
                              await handleRefresh()
                            } catch (err: any) {
                              // Don't log expected business logic errors to console
                              if (err?.response?.status !== 400) {
                                console.error('Unexpected publish error:', err)
                              }

                              // Parse error message from backend API response
                              let errorMessage =
                                'An error occurred while publishing the course'

                              // Check if it's an Axios error with response data
                              if (err?.response?.data) {
                                const responseData = err.response.data

                                // Backend sends structured error response via ResponseGeneral
                                const backendMessage =
                                  responseData.detail ||
                                  responseData.message ||
                                  responseData.error

                                if (backendMessage) {
                                  errorMessage = backendMessage
                                } else {
                                  errorMessage = err.message || errorMessage
                                }
                              } else if (err?.message) {
                                errorMessage = err.message
                              }

                              console.log(
                                'Showing toast with message:',
                                errorMessage
                              )

                              toast.error(
                                `Cannot Publish Course: ${errorMessage}`
                              )
                            }
                          }}
                        >
                          Publish Course
                        </DropdownMenuItem>
                      )}
                      {(course.status?.toUpperCase() === 'PUBLISHED' ||
                        course.status?.toUpperCase() === 'DRAFT') && (
                        <DropdownMenuItem
                          className='text-destructive'
                          onClick={async () => {
                            try {
                              await courseApi.archiveCourse(
                                course.id.toString()
                              )
                              toast.success(
                                `"${course.title}" has been archived successfully.`
                              )
                              await handleRefresh()
                            } catch (err: any) {
                              // Don't log expected business logic errors to console
                              if (err?.response?.status !== 400) {
                                console.error('Unexpected archive error:', err)
                              }

                              let errorMessage =
                                'An error occurred while archiving the course'

                              // Parse backend error message
                              if (err?.response?.data) {
                                const backendMessage =
                                  err.response.data.detail ||
                                  err.response.data.message ||
                                  err.response.data.error ||
                                  err.message
                                errorMessage = backendMessage
                              } else if (err?.message) {
                                errorMessage = err.message
                              }

                              // Add prefix if needed
                              if (
                                !errorMessage.toLowerCase().includes('cannot')
                              ) {
                                errorMessage = `Cannot archive: ${errorMessage}`
                              }

                              toast.error(
                                `Cannot Archive Course: ${errorMessage}`
                              )
                            }
                          }}
                        >
                          Archive Course
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pagedCourses.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-5xl mb-2'>📚</div>
            <div className='font-semibold text-lg mb-1'>No courses found</div>
            <p className='text-muted-foreground mb-4'>
              Try adjusting your search criteria or create a new course.
            </p>
            <Button className='mt-2' asChild>
              <Link href='/manager/create'>Create New Course</Link>
            </Button>
          </div>
        )}
      </div>
      {/* Pagination */}
      <div className='flex items-center justify-between mt-6'>
        <Button
          variant='outline'
          disabled={page === 0}
          onClick={() => setPage(p => Math.max(0, p - 1))}
        >
          Previous
        </Button>
        <span className='text-sm text-muted-foreground'>
          Page {page + 1} of {Math.ceil(total / pageSize) || 1}
        </span>
        <Button
          variant='outline'
          disabled={(page + 1) * pageSize >= total}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={open => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className='space-y-2'>
              {deleteDialog.course && (
                <>
                  <p>
                    This action cannot be undone. This will permanently delete
                    the course:
                  </p>
                  <p className='font-semibold'>"{deleteDialog.course.title}"</p>
                  <p>This will also:</p>
                  <ul className='list-disc list-inside space-y-1 text-sm'>
                    <li>Remove all course materials and content</li>
                    <li>
                      Unenroll all{' '}
                      {Number(deleteDialog.course.totalEnrollments)} students
                    </li>
                    <li>Delete all student progress data</li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDialog.course && handleDeleteCourse(deleteDialog.course)
              }
              disabled={deleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleting ? 'Deleting...' : 'Delete Course'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
