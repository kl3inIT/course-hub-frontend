'use client'

import { courseApi } from '@/api/course-api'
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
import { toast } from '@/hooks/use-toast'
import { CourseResponseDTO } from '@/types/course'
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
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  status: 'published' | 'draft' | 'archived'
  level: 'beginner' | 'intermediate' | 'advanced'
  enrollments: number
  revenue: number
  rating: number
  reviews: number
  lastUpdated: string
  category: string
  instructor: string
  price: number
  createdAt: string
}

// Transform backend course to UI course format
function transformCourse(backendCourse: CourseResponseDTO): Course {
  return {
    id: backendCourse.id.toString(),
    title: backendCourse.title || 'Untitled Course',
    description: backendCourse.description || 'No description available',
    thumbnail:
      backendCourse.thumbnailUrl || '/placeholder.svg?height=200&width=300',
    status:
      backendCourse.status?.toLowerCase() === 'published'
        ? 'published'
        : 'draft',
    level: (backendCourse.level?.toLowerCase() || 'beginner') as
      | 'beginner'
      | 'intermediate'
      | 'advanced',
    enrollments: Number(backendCourse.totalStudents) || 0,
    revenue:
      (backendCourse.finalPrice || backendCourse.price || 0) *
      (Number(backendCourse.totalStudents) || 0),
    rating: backendCourse.averageRating || 0,
    reviews: Number(backendCourse.totalReviews) || 0,
    lastUpdated: new Date().toISOString().split('T')[0], // Default to today since we don't have this field
    category: backendCourse.category || 'General',
    instructor: backendCourse.instructorName || 'Unknown Instructor',
    price: backendCourse.finalPrice || backendCourse.price || 0,
    createdAt: new Date().toISOString().split('T')[0], // Default to today since we don't have this field
  }
}

export function ManagerCourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory)
  const [sortBy, setSortBy] = useState<string>('lastUpdated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    course: Course | null
  }>({
    open: false,
    course: null,
  })
  const [deleting, setDeleting] = useState(false)
  // Tab state
  const [tab, setTab] = useState<'published' | 'draft' | 'archived'>(
    'published'
  )

  // Get unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(courses.map(course => course.category)))
  }, [courses])

  // Load courses from API
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await courseApi.getAllCourses({ page: 0, size: 100 })
        if (response.data && response.data.content) {
          const transformedCourses = response.data.content.map(transformCourse)
          setCourses(transformedCourses)
        }
      } catch (err) {
        console.error('Error loading courses:', err)
        setError('Failed to load courses. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    loadCourses()
  }, [])

  // Filter by tab (status)
  const tabCourses = useMemo(
    () => courses.filter(c => c.status === tab),
    [courses, tab]
  )

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = tabCourses.filter(course => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        categoryFilter === 'all' || course.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'instructor':
          comparison = a.instructor.localeCompare(b.instructor)
          break
        case 'enrollments':
          comparison = a.enrollments - b.enrollments
          break
        case 'revenue':
          comparison = a.revenue - b.revenue
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'lastUpdated':
          comparison =
            new Date(a.lastUpdated).getTime() -
            new Date(b.lastUpdated).getTime()
          break
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    return filtered
  }, [tabCourses, searchTerm, categoryFilter, sortBy, sortOrder])

  // Thống kê cho tab hiện tại
  const totalRevenue = tabCourses.reduce(
    (sum, course) => sum + course.revenue,
    0
  )
  const totalEnrollments = tabCourses.reduce(
    (sum, course) => sum + course.enrollments,
    0
  )
  const publishedCourses = tabCourses.filter(
    c => c.status === 'published'
  ).length
  const averageRating =
    tabCourses
      .filter(c => c.rating > 0)
      .reduce((sum, course) => sum + course.rating, 0) /
      tabCourses.filter(c => c.rating > 0).length || 0

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      const response = await courseApi.getAllCourses({ page: 0, size: 100 })

      if (response.data && response.data.content) {
        const transformedCourses = response.data.content.map(transformCourse)
        setCourses(transformedCourses)
        toast({
          title: 'Data Refreshed',
          description: 'Course data has been updated successfully.',
        })
      }
    } catch (err) {
      console.error('Error refreshing courses:', err)
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh course data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDeleteCourse = async (course: Course) => {
    try {
      setDeleting(true)

      // Here you would call the actual delete API
      // await courseApi.deleteCourse(Number(course.id))

      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (Math.random() < 0.1) {
        throw new Error('Failed to delete course. Please try again.')
      }

      setCourses(prev => prev.filter(c => c.id !== course.id))
      toast({
        title: 'Course Deleted',
        description: `"${course.title}" has been successfully deleted.`,
      })

      setDeleteDialog({ open: false, course: null })
    } catch (err) {
      toast({
        title: 'Deletion Failed',
        description:
          err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
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

  const getStatusBadge = (status: string) => {
    const variants = {
      published: {
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600',
      },
      draft: {
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-yellow-600',
      },
      archived: {
        variant: 'outline' as const,
        icon: Archive,
        color: 'text-gray-600',
      },
    }

    const config = variants[status as keyof typeof variants] || variants.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className='flex items-center gap-1'>
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    )
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
    <Tabs value={tab} onValueChange={v => setTab(v as any)}>
      <TabsList className='mb-6'>
        <TabsTrigger value='published'>Published</TabsTrigger>
        <TabsTrigger value='draft'>Draft</TabsTrigger>
        <TabsTrigger value='archived'>Archived</TabsTrigger>
      </TabsList>
      <TabsContent value='published'>
        {renderCourseTable(
          filteredAndSortedCourses,
          totalRevenue,
          totalEnrollments,
          publishedCourses,
          averageRating
        )}
      </TabsContent>
      <TabsContent value='draft'>
        {renderCourseTable(
          filteredAndSortedCourses,
          totalRevenue,
          totalEnrollments,
          publishedCourses,
          averageRating
        )}
      </TabsContent>
      <TabsContent value='archived'>
        {renderCourseTable(
          filteredAndSortedCourses,
          totalRevenue,
          totalEnrollments,
          publishedCourses,
          averageRating
        )}
      </TabsContent>
    </Tabs>
  )

  // Helper render function
  function renderCourseTable(
    filteredAndSortedCourses: Course[],
    totalRevenue: number,
    totalEnrollments: number,
    publishedCourses: number,
    averageRating: number
  ) {
    return (
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Course Management</h1>
            <p className='text-muted-foreground'>
              Manage and monitor all courses in the system
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Course
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Courses
              </CardTitle>
              <BookOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{courses.length}</div>
              <p className='text-xs text-muted-foreground'>
                {publishedCourses} published,{' '}
                {courses.filter(c => c.status === 'draft').length} draft
              </p>
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
                {totalEnrollments.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground'>
                Across all courses
              </p>
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
                ${totalRevenue.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground'>Lifetime earnings</p>
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
              <div className='text-2xl font-bold'>
                {averageRating.toFixed(1)}
              </div>
              <p className='text-xs text-muted-foreground'>
                From student reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger
              className={`w-full md:w-[200px] ${categoryFilter ? 'bg-black text-white font-bold' : ''}`}
            >
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
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search courses, instructors...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>

          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
        </div>

        {/* Course Table */}
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => handleSort('instructor')}
                >
                  Instructor
                </TableHead>
                <TableHead
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableHead>
                <TableHead
                  className='cursor-pointer hover:bg-muted/50 text-right'
                  onClick={() => handleSort('enrollments')}
                >
                  Enrollments
                </TableHead>
                <TableHead
                  className='cursor-pointer hover:bg-muted/50 text-right'
                  onClick={() => handleSort('revenue')}
                >
                  Revenue
                </TableHead>
                <TableHead
                  className='cursor-pointer hover:bg-muted/50 text-right'
                  onClick={() => handleSort('rating')}
                >
                  Rating
                </TableHead>
                <TableHead
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => handleSort('lastUpdated')}
                >
                  Last Updated
                </TableHead>
                <TableHead className='w-12'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCourses.map(course => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className='flex items-center space-x-3'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage src={course.thumbnail} />
                        <AvatarFallback>{course.title[0]}</AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <div className='font-medium truncate'>
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
                  <TableCell>
                    <div className='font-medium'>{course.instructor}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(course.status)}</TableCell>
                  <TableCell className='text-right'>
                    <div className='font-medium'>
                      {course.enrollments.toLocaleString()}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      students
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='font-medium'>
                      ${course.revenue.toLocaleString()}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      ${course.price}
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    {course.rating > 0 ? (
                      <div className='flex items-center justify-end'>
                        <Star className='h-4 w-4 fill-yellow-400 text-yellow-400 mr-1' />
                        <span className='font-medium'>
                          {course.rating.toFixed(1)}
                        </span>
                        <span className='text-xs text-muted-foreground ml-1'>
                          ({course.reviews})
                        </span>
                      </div>
                    ) : (
                      <span className='text-muted-foreground'>No ratings</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      {new Date(course.lastUpdated).toLocaleDateString()}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Created: {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                          <Link href={`/manager/courses/${course.id}`}>
                            <Eye className='mr-2 h-4 w-4' />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/courses/${course.id}`}>
                            <Eye className='mr-2 h-4 w-4' />
                            Preview Course
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/manager/courses/${course.id}/edit`}>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit Course
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className='text-destructive'
                          onClick={() =>
                            setDeleteDialog({ open: true, course })
                          }
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAndSortedCourses.length === 0 && (
            <div className='text-center py-8'>
              <BookOpen className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-2 text-sm font-semibold'>No courses found</h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                Try adjusting your search criteria or create a new course.
              </p>
              <Button className='mt-4'>
                <Plus className='mr-2 h-4 w-4' />
                Create New Course
              </Button>
            </div>
          )}
        </div>

        {/* Pagination could be added here */}
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Showing {filteredAndSortedCourses.length} of {courses.length}{' '}
            courses
          </p>
        </div>

        {/* Delete Confirmation Dialog */}
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
                    <p className='font-semibold'>
                      "{deleteDialog.course.title}"
                    </p>
                    <p>This will also:</p>
                    <ul className='list-disc list-inside space-y-1 text-sm'>
                      <li>Remove all course materials and content</li>
                      <li>
                        Unenroll all {deleteDialog.course.enrollments} students
                      </li>
                      <li>Delete all student progress data</li>
                      <li>Remove all reviews and ratings</li>
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
}
