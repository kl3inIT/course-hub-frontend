'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Filter,
  MoreVertical,
  Users,
  TrendingUp,
  Clock,
  Award,
  RefreshCw,
  Download,
  Mail,
  Eye,
  UserMinus,
  Calendar,
  BookOpen,
  CheckCircle,
  BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'
import { courseApi } from '@/services/course-api'
import { CourseEnrollment, CourseEnrollmentStats } from '@/types/course'
import Link from 'next/link'

interface CourseEnrollmentManagementProps {
  courseId: string
  courseTitle: string
}

export function CourseEnrollmentManagement({
  courseId,
  courseTitle,
}: CourseEnrollmentManagementProps) {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [stats, setStats] = useState<CourseEnrollmentStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('enrollmentDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const pageSize = 10

  // Dialog states
  const [unenrollDialog, setUnenrollDialog] = useState<{
    open: boolean
    enrollment: CourseEnrollment | null
  }>({
    open: false,
    enrollment: null,
  })

  // Fetch enrollments & stats khi courseId thay đổi
  useEffect(() => {
    if (!courseId) return
    setLoading(true)

    Promise.all([
      courseApi.getCourseEnrollments(courseId),
      courseApi.getCourseEnrollmentStats(courseId),
    ])
      .then(([enrollmentsData, statsData]) => {
        setEnrollments(enrollmentsData)
        setStats(statsData)
      })
      .catch(error => {
        console.error('Error fetching enrollment data:', error)
        toast.error('Không thể tải dữ liệu ghi danh')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [courseId])

  const filteredAndSortedEnrollments = useMemo(() => {
    const filtered = enrollments.filter(enrollment => {
      const matchesSearch =
        enrollment.studentName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        enrollment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || enrollment.status === statusFilter

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'studentName':
          comparison = a.studentName.localeCompare(b.studentName)
          break
        case 'progress':
          comparison = a.progress - b.progress
          break
        case 'enrollmentDate':
          comparison =
            new Date(a.enrollmentDate).getTime() -
            new Date(b.enrollmentDate).getTime()
          break
        case 'lastAccessed':
          comparison =
            new Date(a.lastAccessed).getTime() -
            new Date(b.lastAccessed).getTime()
          break
        case 'timeSpent':
          comparison = a.timeSpent - b.timeSpent
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [enrollments, searchTerm, statusFilter, sortBy, sortOrder])

  const pagedEnrollments = useMemo(() => {
    const start = page * pageSize
    const end = start + pageSize
    return filteredAndSortedEnrollments.slice(start, end)
  }, [filteredAndSortedEnrollments, page, pageSize])

  const totalPages = Math.ceil(filteredAndSortedEnrollments.length / pageSize)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const [enrollmentsData, statsData] = await Promise.all([
        courseApi.getCourseEnrollments(courseId),
        courseApi.getCourseEnrollmentStats(courseId),
      ])
      setEnrollments(enrollmentsData)
      setStats(statsData)
      toast.success('Đã làm mới dữ liệu ghi danh')
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Không thể làm mới dữ liệu')
    }
    setIsRefreshing(false)
  }

  const handleUnenrollStudent = async (enrollment: CourseEnrollment) => {
    try {
      await courseApi.unenrollStudent(courseId, enrollment.studentId.toString())
      setEnrollments(prev => prev.filter(e => e.id !== enrollment.id))
      // Cập nhật stats
      if (stats) {
        setStats(
          prev =>
            prev && {
              ...prev,
              totalEnrollments: prev.totalEnrollments - 1,
              activeEnrollments:
                prev.activeEnrollments -
                (enrollment.status === 'active' ? 1 : 0),
              completedEnrollments:
                prev.completedEnrollments -
                (enrollment.status === 'completed' ? 1 : 0),
            }
        )
      }
      toast.success(
        `${enrollment.studentName} đã bị hủy ghi danh khỏi khóa học`
      )
      setUnenrollDialog({ open: false, enrollment: null })
    } catch (error) {
      console.error('Error unenrolling student:', error)
      toast.error('Hủy ghi danh thất bại')
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
      active: { variant: 'default' as const, icon: CheckCircle },
      completed: { variant: 'secondary' as const, icon: Award },
    }

    const config = variants[status as keyof typeof variants] || variants.active
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className='flex items-center gap-1'>
        <Icon className='h-3 w-3' />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p>Loading enrollment data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Course Enrollments</h1>
          <p className='text-muted-foreground'>
            Manage enrollments for "{courseTitle}"
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
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='students'>Students</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* Stats Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Enrollments
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {stats?.totalEnrollments ?? 0}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {stats?.activeEnrollments ?? 0} active,{' '}
                  {stats?.completedEnrollments ?? 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Completion Rate
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {stats?.completionRate?.toFixed(1) ?? 0}%
                </div>
                <p className='text-xs text-muted-foreground'>
                  Average progress: {stats?.averageProgress?.toFixed(1) ?? 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Avg. Study Time
                </CardTitle>
                <Clock className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {stats?.averageTimeSpent
                    ? formatDuration(Math.round(stats.averageTimeSpent))
                    : '0m'}
                </div>
                <p className='text-xs text-muted-foreground'>Per student</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Avg. Rating
                </CardTitle>
                <Award className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {stats?.averageRating?.toFixed(1) ?? 0}/5
                </div>
                <p className='text-xs text-muted-foreground'>
                  From student reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {enrollments.slice(0, 5).map(enrollment => (
                  <div
                    key={enrollment.id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex items-center space-x-3'>
                      <Avatar>
                        <AvatarImage src={enrollment.studentAvatar} />
                        <AvatarFallback>
                          {enrollment.studentName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium'>{enrollment.studentName}</p>
                        <p className='text-sm text-muted-foreground'>
                          {enrollment.studentEmail}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>
                          {enrollment.progress?.toFixed(1) ?? 0}%
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Progress
                        </p>
                      </div>
                      {getStatusBadge(enrollment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='students' className='space-y-6'>
          {/* Filters */}
          <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search students...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-full md:w-[200px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Students Table */}
          <Card>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[300px]'>Student</TableHead>
                    <TableHead
                      className='cursor-pointer hover:bg-muted/50'
                      onClick={() => handleSort('progress')}
                    >
                      Progress
                    </TableHead>
                    <TableHead
                      className='cursor-pointer hover:bg-muted/50'
                      onClick={() => handleSort('timeSpent')}
                    >
                      Time Spent
                    </TableHead>
                    <TableHead
                      className='cursor-pointer hover:bg-muted/50'
                      onClick={() => handleSort('enrollmentDate')}
                    >
                      Enrolled
                    </TableHead>
                    <TableHead
                      className='cursor-pointer hover:bg-muted/50'
                      onClick={() => handleSort('lastAccessed')}
                    >
                      Last Accessed
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='w-16'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedEnrollments.map(enrollment => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div className='flex items-center space-x-3'>
                          <Avatar>
                            <AvatarImage src={enrollment.studentAvatar} />
                            <AvatarFallback>
                              {enrollment.studentName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium'>
                              {enrollment.studentName}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              {enrollment.studentEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='flex items-center space-x-2'>
                            <Progress
                              value={enrollment.progress}
                              className='w-20'
                            />
                            <span className='text-sm font-medium'>
                              {enrollment.progress?.toFixed(1) ?? 0}%
                            </span>
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {enrollment.completedLessons}/
                            {enrollment.totalLessons} lessons
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className='font-medium'>
                          {formatDuration(enrollment.timeSpent)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          {new Date(
                            enrollment.enrollmentDate
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          {new Date(
                            enrollment.lastAccessed
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem asChild>
                              <Link href={`/manager/users/${enrollment.studentId}/detail`}>
                                <Eye className='mr-2 h-4 w-4' />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className='mr-2 h-4 w-4' />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className='text-destructive'
                              onClick={() =>
                                setUnenrollDialog({ open: true, enrollment })
                              }
                            >
                              <UserMinus className='mr-2 h-4 w-4' />
                              Unenroll Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination UI */}
              <div className='flex items-center justify-between px-4 py-3 border-t'>
                <Button
                  variant='outline'
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <span className='text-sm text-muted-foreground'>
                  Page {page + 1} of {totalPages || 1}
                </span>
                <Button
                  variant='outline'
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unenroll Dialog */}
      <AlertDialog
        open={unenrollDialog.open}
        onOpenChange={open => setUnenrollDialog({ ...unenrollDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unenroll Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unenroll{' '}
              {unenrollDialog.enrollment?.studentName} from this course? This
              action cannot be undone and will remove their progress data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                unenrollDialog.enrollment &&
                handleUnenrollStudent(unenrollDialog.enrollment)
              }
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Unenroll
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
