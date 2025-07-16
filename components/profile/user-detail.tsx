'use client'

import { Pagination } from '@/components/admin/user-management/user-pagination'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import { userApi } from '@/services/user-api'
import type { Course, UserActivity, UserDetail } from '@/types/user'
import { UserStatus } from '@/types/user'
import { format } from 'date-fns'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  GraduationCap,
  Mail,
  MessageSquare,
  PlusCircle,
  Star,
  TrendingUp,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'

const S3_URL = 'https://course-hub-resourses.s3.amazonaws.com'

// Helper functions
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  try {
    return format(new Date(date), 'PPP')
  } catch (error) {
    return '-'
  }
}

const getInitials = (name: string) => {
  return name
    ? name
        .split(' ')
        .map(n => n?.[0] || '')
        .join('')
        .toUpperCase()
    : 'U'
}

// Status Badge Component (consistent with user-table)
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    [UserStatus.ACTIVE]: {
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
      label: 'Active',
    },
    [UserStatus.INACTIVE]: {
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      label: 'Inactive',
    },
    [UserStatus.BANNED]: {
      className: 'bg-red-100 text-red-600 hover:bg-red-200',
      label: 'Banned',
    },
    active: {
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
      label: 'Active',
    },
    inactive: {
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      label: 'Inactive',
    },
    banned: {
      className: 'bg-red-100 text-red-600 hover:bg-red-200',
      label: 'Banned',
    },
  }

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
  return <Badge className={config.className}>{config.label}</Badge>
}

// Role Badge Component
const RoleBadge = ({ role }: { role: string }) => {
  const roleConfig = {
    learner: {
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      icon: GraduationCap,
      label: 'Learner',
    },
    manager: {
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      icon: User,
      label: 'Manager',
    },
    admin: {
      className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      icon: Star,
      label: 'Admin',
    },
  }

  const config =
    roleConfig[role as keyof typeof roleConfig] || roleConfig.learner
  const Icon = config.icon

  return (
    <Badge className={`${config.className} flex items-center gap-1`}>
      <Icon className='h-3 w-3' />
      {config.label}
    </Badge>
  )
}

// Stats Card Component
const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: string | number
  icon: any
  description?: string
}) => (
  <Card className='hover:shadow-md transition-shadow'>
    <CardContent className='p-3 sm:p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs sm:text-sm font-medium text-muted-foreground'>
            {title}
          </p>
          <p className='text-lg sm:text-xl font-bold'>{value}</p>
          {description && (
            <p className='text-xs text-muted-foreground mt-1'>{description}</p>
          )}
        </div>
        <Icon className='h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground' />
      </div>
    </CardContent>
  </Card>
)

// Components
const UserProfileCard = ({ userDetail }: { userDetail: UserDetail }) => {
  const enrolledCoursesCount =
    userDetail.activities?.filter(a => a.type?.toLowerCase() === 'enrollment')
      .length || 0
  const commentsCount =
    userDetail.activities?.filter(a => a.type?.toLowerCase() === 'comment')
      .length || 0

  // Calculate lesson completions from enrollment progress (backend doesn't send lesson_completion activities)
  const getLessonCompletionsCount = () => {
    if (userDetail.role !== 'learner') return 0

    // Count actual lesson completion activities from backend
    const lessonCompletionActivities =
      userDetail.activities?.filter(
        a => a.type?.toLowerCase() === 'lesson_completion'
      ) || []

    return lessonCompletionActivities.length
  }

  const lessonCompletionsCount = getLessonCompletionsCount()
  const managedCoursesCount = userDetail.managedCourses?.length || 0

  // Calculate average progress from enrolled courses (will be calculated properly by getEnrolledCourses)
  const getAverageProgress = () => {
    if (userDetail.role !== 'learner') return 0

    const enrollmentActivities =
      userDetail.activities?.filter(
        a => a.type?.toLowerCase() === 'enrollment'
      ) || []
    if (enrollmentActivities.length === 0) return 0

    // Calculate average progress from enrollment progressPercentage
    const totalProgress = enrollmentActivities.reduce((sum, enrollment) => {
      return sum + (enrollment.progressPercentage || 0)
    }, 0)

    return Math.round(totalProgress / enrollmentActivities.length)
  }

  return (
    <div className='w-full space-y-6'>
      {/* Header Card */}
      <Card className='shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 w-full'>
        <CardContent className='p-4 sm:p-6 lg:p-8'>
          <div className='flex flex-col items-center lg:flex-row lg:items-center lg:space-x-8'>
            <Avatar className='h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-4 border-white shadow-lg'>
              <AvatarImage src={userDetail.avatar || '/placeholder.svg'} />
              <AvatarFallback className='text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
                {getInitials(userDetail.name)}
              </AvatarFallback>
            </Avatar>

            <div className='mt-6 lg:mt-0 text-center lg:text-left flex-1 w-full lg:w-auto'>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words'>
                {userDetail.name}
              </h1>
              <p className='text-sm sm:text-base text-gray-600 mb-4 flex items-center justify-center lg:justify-start gap-2 break-words'>
                <Mail className='h-4 w-4 flex-shrink-0' />
                <span className='min-w-0'>{userDetail.email}</span>
              </p>
              <div className='flex items-center justify-center lg:justify-start gap-3 mb-4 flex-wrap'>
                <RoleBadge role={userDetail.role} />
                <StatusBadge status={userDetail.status} />
              </div>
              <div className='flex items-center justify-center lg:justify-start text-sm text-gray-600 gap-2 flex-wrap'>
                <Calendar className='h-4 w-4 flex-shrink-0' />
                <span>Joined {formatDate(userDetail.joinDate)}</span>
              </div>
            </div>

            {/* Bio section bên phải */}
            {userDetail.bio && (
              <div className='hidden lg:block max-w-xs ml-8'>
                <Card className='shadow-none border-0 bg-transparent'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <User className='h-5 w-5' />
                      Bio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <p className='text-gray-700 leading-relaxed'>
                      {userDetail.bio}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          {/* Bio section cho mobile/tablet */}
          {userDetail.bio && (
            <div className='block lg:hidden mt-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Bio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-700 leading-relaxed'>
                    {userDetail.bio}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full'>
        {userDetail.role === 'learner' ? (
          <>
            <StatsCard
              title='Enrolled Courses'
              value={enrolledCoursesCount}
              icon={BookOpen}
              description='Total enrollments'
            />
            <StatsCard
              title='Lessons Completed'
              value={lessonCompletionsCount}
              icon={CheckCircle}
              description='Finished lessons'
            />
            <StatsCard
              title='Progress'
              value={`${getAverageProgress()}%`}
              icon={TrendingUp}
              description='Average completion'
            />
            <StatsCard
              title='Comments'
              value={commentsCount}
              icon={MessageSquare}
              description='Posted comments'
            />
          </>
        ) : (
          <>
            <StatsCard
              title='Managed Courses'
              value={managedCoursesCount}
              icon={BookOpen}
              description='Created courses'
            />
            <StatsCard
              title='Total Activities'
              value={userDetail.activities?.length || 0}
              icon={Clock}
              description='Management actions'
            />
            <StatsCard
              title='Course Updates'
              value={
                userDetail.activities?.filter(
                  a => a.type?.toLowerCase() === 'course_update'
                ).length || 0
              }
              icon={TrendingUp}
              description='Course modifications'
            />
            <StatsCard
              title='Course Creations'
              value={
                userDetail.activities?.filter(
                  a => a.type?.toLowerCase() === 'course_creation'
                ).length || 0
              }
              icon={Star}
              description='New courses created'
            />
          </>
        )}
      </div>
    </div>
  )
}

const CourseCard = ({
  course,
}: {
  course: Course & { completedAt?: string }
}) => {
  const progressValue =
    typeof course.progress === 'number' ? course.progress : 0
  const isCompleted = Math.round(progressValue) === 100

  return (
    <Link href={`/courses/${course.id}`}>
      <Card
        className={`relative overflow-hidden group transition-all duration-300
          ${isCompleted ? 'border border-emerald-300 bg-white shadow-md' : 'hover:shadow-lg'}
        `}
      >
        <CardHeader className='p-0'>
          <div className='aspect-video relative rounded-t-lg overflow-hidden bg-gray-100'>
            <img
              src={
                course.thumbnail
                  ? `${S3_URL}/${course.thumbnail}`
                  : '/placeholder.jpg'
              }
              alt={course.title}
              className='object-cover w-full h-full transition-transform duration-300 group-hover:scale-105'
            />
            {isCompleted && (
              <div className='absolute top-3 right-3 flex flex-col items-end z-10'>
                <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium text-xs shadow'>
                  <CheckCircle className='h-4 w-4' /> Completed
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className='p-4'>
          <h3 className='font-semibold text-base mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors'>
            {course.title}
          </h3>
          {typeof course.progress !== 'undefined' && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Progress</span>
                <span
                  className={`font-bold ${isCompleted ? 'text-emerald-700' : ''}`}
                >
                  {isCompleted ? 'Completed' : `${Math.round(progressValue)}%`}
                </span>
              </div>
              <div className='h-2 w-full bg-gray-200 rounded-full overflow-hidden'>
                <div
                  className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-300' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              {isCompleted && course.completedAt && (
                <div className='flex items-center gap-1 mt-2 text-xs text-gray-500'>
                  <Calendar className='inline h-3 w-3 mr-1' />
                  Completed on{' '}
                  {format(new Date(course.completedAt), 'MMM dd, yyyy')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

// Helper functions for activities
const getActivityIcon = (type: string) => {
  const normalizedType = type?.toLowerCase()
  switch (normalizedType) {
    case 'comment':
      return MessageSquare
    case 'enrollment':
      return BookOpen
    case 'course_creation':
      return Star
    case 'course_update':
      return TrendingUp
    case 'lesson_completion':
      return CheckCircle
    case 'course_completion':
      return GraduationCap
    case 'quiz_attempt':
      return Clock
    case 'lesson_creation':
      return PlusCircle
    case 'lesson_update':
      return Edit
    default:
      return Clock
  }
}

const getActivityColor = (type: string) => {
  const normalizedType = type?.toLowerCase()
  switch (normalizedType) {
    case 'comment':
      return 'text-blue-600'
    case 'enrollment':
      return 'text-green-600'
    case 'course_creation':
      return 'text-purple-600'
    case 'course_update':
      return 'text-orange-600'
    case 'lesson_completion':
      return 'text-emerald-600'
    case 'course_completion':
      return 'text-green-600'
    case 'quiz_attempt':
      return 'text-yellow-600'
    default:
      return 'text-gray-600'
  }
}

const getActivityText = (activity: UserActivity) => {
  const normalizedType = activity.type?.toLowerCase()
  switch (normalizedType) {
    case 'comment':
      return `Commented on lesson "${activity.lessonTitle}"`
    case 'enrollment':
      return `Enrolled in course "${activity.courseTitle}"`
    case 'course_creation':
      return `Created course "${activity.courseTitle}"`
    case 'course_update':
      return `Updated course "${activity.courseTitle}"`
    case 'lesson_completion':
      return `Completed lesson "${activity.lessonTitle}" in course "${activity.courseTitle}"`
    case 'course_completion':
      return `Completed course "${activity.courseTitle}"`
    case 'quiz_attempt':
      return `Attempted quiz in "${activity.courseTitle}"`
    case 'lesson_creation':
      return `Created lesson "${activity.lessonTitle}" in course "${activity.courseTitle}"`
    case 'lesson_update':
      return `Updated lesson "${activity.lessonTitle}" in course "${activity.courseTitle}"`
    default:
      return 'Activity'
  }
}

const getActivityTypeBadge = (type: string) => {
  // Convert to lowercase to handle backend uppercase values
  const normalizedType = type?.toLowerCase()

  const typeConfig = {
    comment: { label: 'Comment', className: 'bg-blue-100 text-blue-700' },
    enrollment: {
      label: 'Enrollment',
      className: 'bg-green-100 text-green-700',
    },
    course_creation: {
      label: 'Course Created',
      className: 'bg-purple-100 text-purple-700',
    },
    course_update: {
      label: 'Course Updated',
      className: 'bg-orange-100 text-orange-700',
    },
    lesson_completion: {
      label: 'Lesson Completed',
      className: 'bg-emerald-100 text-emerald-700',
    },
    course_completion: {
      label: 'Course Completed',
      className: 'bg-green-100 text-green-700',
    },
    quiz_attempt: {
      label: 'Quiz Attempt',
      className: 'bg-yellow-100 text-yellow-700',
    },
    lesson_creation: {
      label: 'Lesson Created',
      className: 'bg-sky-100 text-sky-700',
    },
    lesson_update: {
      label: 'Lesson Updated',
      className: 'bg-indigo-100 text-indigo-700',
    },
  }

  const config = typeConfig[normalizedType as keyof typeof typeConfig] || {
    label: 'Activity',
    className: 'bg-gray-100 text-gray-700',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}

const ActivityItem = ({ activity }: { activity: UserActivity }) => {
  const Icon = getActivityIcon(activity.type)

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardContent className='p-4'>
        <div className='flex items-start space-x-4'>
          <div
            className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}
          >
            <Icon className='h-4 w-4' />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between mb-2'>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  {getActivityTypeBadge(activity.type)}
                  {activity.timestamp && (
                    <time className='text-xs text-muted-foreground whitespace-nowrap'>
                      {format(new Date(activity.timestamp), 'MMM dd, yyyy')}
                    </time>
                  )}
                </div>
                <p className='font-medium text-sm text-gray-800'>
                  {getActivityText(activity)}
                </p>
              </div>
            </div>

            {activity.lessonId && activity.lessonTitle && (
              <Link
                href={`/courses/${activity.courseId}/lessons/${activity.lessonId}`}
                className='text-sm text-blue-600 hover:text-blue-800 hover:underline block mb-2'
              >
                {activity.lessonTitle}
              </Link>
            )}
            {activity.courseId && !activity.lessonId && (
              <Link
                href={`/courses/${activity.courseId}`}
                className='text-sm text-blue-600 hover:text-blue-800 hover:underline block mb-2'
              >
                {activity.courseTitle}
              </Link>
            )}

            {activity.commentText && (
              <div className='bg-gray-50 rounded-lg p-3 mt-2'>
                <p className='text-sm text-gray-700 italic'>
                  "{activity.commentText}"
                </p>
              </div>
            )}

            {activity.actionDescription && (
              <p className='text-sm text-muted-foreground mt-2'>
                {activity.actionDescription}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const UserDetailSkeleton = () => (
  <div className='w-full min-h-screen bg-gray-50/30'>
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      <div className='w-full space-y-6'>
        {/* Header Skeleton */}
        <Card className='w-full'>
          <CardContent className='p-4 sm:p-6 lg:p-8'>
            <div className='flex flex-col items-center lg:flex-row lg:items-center lg:space-x-8'>
              <Skeleton className='h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-full' />
              <div className='mt-6 lg:mt-0 text-center lg:text-left flex-1 w-full lg:w-auto'>
                <Skeleton className='h-6 sm:h-8 w-48 sm:w-64 mb-2 mx-auto lg:mx-0' />
                <Skeleton className='h-4 sm:h-5 w-32 sm:w-48 mb-4 mx-auto lg:mx-0' />
                <div className='flex justify-center lg:justify-start gap-3 mb-4 flex-wrap'>
                  <Skeleton className='h-6 w-20' />
                  <Skeleton className='h-6 w-16' />
                </div>
                <Skeleton className='h-4 w-32 mx-auto lg:mx-0' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Skeleton */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-4'>
                <Skeleton className='h-4 w-20 mb-2' />
                <Skeleton className='h-8 w-12 mb-1' />
                <Skeleton className='h-3 w-16' />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <Card className='w-full'>
          <CardContent className='p-6'>
            <Skeleton className='h-10 w-full mb-4' />
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-40 w-full rounded-lg' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)

export function UserDetail({ userId }: { userId: string }) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { getToken } = useAuth()
  const pathname = usePathname()
  const isAdminView = pathname?.startsWith('/admin')
  const [activityTab, setActivityTab] = useState<string>('all')
  const [activityDateRange, setActivityDateRange] = useState<
    DateRange | undefined
  >()
  // Pagination state for activities
  const [activityPage, setActivityPage] = useState(1)
  const [activityPageSize, setActivityPageSize] = useState(5)
  // Pagination state for each activity type tab
  const [tabPages, setTabPages] = useState<{ [key: string]: number }>({})
  const [tabPageSizes, setTabPageSizes] = useState<{ [key: string]: number }>(
    {}
  )

  const MANAGER_ACTIVITY_TYPES = [
    { key: 'course_creation', label: 'Course Created' },
    { key: 'course_update', label: 'Course Updated' },
    { key: 'lesson_creation', label: 'Lesson Created' },
    { key: 'lesson_update', label: 'Lesson Updated' },
    { key: 'comment', label: 'Comment' },
  ]
  const LEARNER_ACTIVITY_TYPES = [
    { key: 'enrollment', label: 'Enrollment' },
    { key: 'comment', label: 'Comment' },
    { key: 'review', label: 'Review' },
    { key: 'lesson_completion', label: 'Lesson Completed' },
  ]

  const activityTypes = useMemo(() => {
    return userDetail?.role === 'manager'
      ? MANAGER_ACTIVITY_TYPES
      : LEARNER_ACTIVITY_TYPES
  }, [userDetail])

  const fetchUserDetail = async () => {
    try {
      if (!getToken()) {
        throw new Error('No auth token')
      }

      const response = await userApi.getUserProfile(userId)
      if (!response.data) {
        throw new Error('No data received from API')
      }

      setUserDetail({
        ...response.data,
        managedCourses: response.data.managedCourses || null,
        activities: response.data.activities || [],
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load user detail',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDetail()
  }, [userId, isAdminView])

  const activitiesToShow = useMemo(() => {
    if (!userDetail?.activities) return []
    if (!activityDateRange?.from && !activityDateRange?.to)
      return userDetail.activities
    return userDetail.activities.filter(a => {
      if (!a.timestamp) return false
      const date = new Date(a.timestamp)
      if (activityDateRange.from && date < activityDateRange.from) return false
      if (activityDateRange.to && date > activityDateRange.to) return false
      return true
    })
  }, [userDetail?.activities, activityDateRange])

  // Paginated activities
  const paginatedActivities = useMemo(() => {
    const start = (activityPage - 1) * activityPageSize
    const end = start + activityPageSize
    return activitiesToShow
      .sort(
        (a, b) =>
          new Date(b.timestamp || 0).getTime() -
          new Date(a.timestamp || 0).getTime()
      )
      .slice(start, end)
  }, [activitiesToShow, activityPage, activityPageSize])

  const totalActivityPages = Math.ceil(
    activitiesToShow.length / activityPageSize
  )

  // Khi chuyển tab, reset page về 1
  useEffect(() => {
    setTabPages(p => ({ ...p, [activityTab]: 1 }))
  }, [activityTab])

  // Helper cho phân trang từng tab con
  const getPaginatedTabActivities = (typeKey: string) => {
    const filtered = activitiesToShow.filter(
      a => a.type?.toLowerCase() === typeKey
    )
    const page = tabPages[typeKey] || 1
    const pageSize = tabPageSizes[typeKey] || 5
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      data: filtered
        .sort(
          (a, b) =>
            new Date(b.timestamp || 0).getTime() -
            new Date(a.timestamp || 0).getTime()
        )
        .slice(start, end),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    }
  }

  if (isLoading) return <UserDetailSkeleton />
  if (!userDetail) {
    return (
      <div className='w-full min-h-screen bg-gray-50/30'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='text-center py-12'>
            <div className='text-muted-foreground text-lg'>User not found</div>
          </div>
        </div>
      </div>
    )
  }

  const getEnrolledCoursesWithProgress = (): Course[] => {
    const { enrolledCourses, activities } = userDetail
    if (!enrolledCourses || !activities) {
      return enrolledCourses || []
    }

    const progressMap = new Map<
      number, // Key is course ID (number)
      { progress?: number; completedAt?: string }
    >()

    // Iterate through all activities to populate the progress map
    for (const activity of activities) {
      // Ensure courseId exists and is a number
      const courseId = activity.courseId ? Number(activity.courseId) : null
      if (courseId === null || isNaN(courseId)) {
        continue
      }

      // Get or create the entry for this course
      const info = progressMap.get(courseId) || {}

      const type = activity.type?.toLowerCase()
      if (type === 'enrollment') {
        info.progress = activity.progressPercentage || 0
      } else if (type === 'course_completion') {
        info.completedAt = activity.timestamp ?? undefined
      }

      progressMap.set(courseId, info)
    }

    // Map over the original enrolled courses and add the progress info
    return enrolledCourses.map(course => {
      const progressInfo = progressMap.get(course.id) // course.id is number
      return {
        ...course,
        progress: progressInfo?.progress,
        completedAt: progressInfo?.completedAt,
      }
    })
  }

  const enrolledCourses = getEnrolledCoursesWithProgress()

  const coursesToShow =
    userDetail.role === 'manager' ? userDetail.managedCourses : enrolledCourses

  return (
    <div className='w-full min-h-screen bg-gray-50/30'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {/* Back Button for Admin View */}
        {isAdminView && (
          <div className='flex items-center gap-4 mb-6'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => window.history.back()}
              className='gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              Back to Users
            </Button>
            <Separator orientation='vertical' className='h-6' />
            <h2 className='text-2xl font-bold'>User Profile</h2>
          </div>
        )}

        <div className='space-y-8'>
          <UserProfileCard userDetail={userDetail} />

          <Card className='shadow-lg'>
            <Tabs defaultValue='courses' className='w-full'>
              <TabsList className='w-full justify-start border-b rounded-none h-14 px-6 bg-transparent'>
                <TabsTrigger
                  value='courses'
                  className='flex items-center gap-2 text-base data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700'
                >
                  <BookOpen className='h-4 w-4' />
                  {userDetail.role === 'manager'
                    ? 'Managed Courses'
                    : 'Enrolled Courses'}
                  <Badge variant='secondary' className='ml-1'>
                    {coursesToShow?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value='activities'
                  className='flex items-center gap-2 text-base data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700'
                >
                  <Clock className='h-4 w-4' />
                  Activities
                  <Badge variant='secondary' className='ml-1'>
                    {activitiesToShow.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value='courses' className='p-6'>
                {!coursesToShow || coursesToShow.length === 0 ? (
                  <div className='text-center py-12'>
                    <BookOpen className='h-12 w-12 text-gray-300 mx-auto mb-3' />
                    <h3 className='text-base font-semibold text-gray-600 mb-2'>
                      {userDetail.role === 'manager'
                        ? 'No Managed Courses'
                        : 'No Enrolled Courses'}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      {userDetail.role === 'manager'
                        ? 'This manager has not created any courses yet.'
                        : 'This user has not enrolled in any courses yet.'}
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {coursesToShow.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value='activities' className='p-6'>
                <Tabs value={activityTab} onValueChange={setActivityTab}>
                  <div className='flex items-center justify-between mb-4 gap-3'>
                    <TabsList>
                      <TabsTrigger value='all'>All</TabsTrigger>
                      {activityTypes.map(type => (
                        <TabsTrigger key={type.key} value={type.key}>
                          {type.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <DateRangePicker
                      value={activityDateRange}
                      onChange={setActivityDateRange}
                    />
                  </div>
                  <TabsContent value='all'>
                    {activitiesToShow.length === 0 ? (
                      <div className='text-center py-12'>
                        <Clock className='h-12 w-12 text-gray-300 mx-auto mb-3' />
                        <h3 className='text-base font-semibold text-gray-600 mb-2'>
                          No Activities Found
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          This user has not performed any activities yet.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className='space-y-4 max-w-4xl mx-auto'>
                          {paginatedActivities.map(activity => (
                            <ActivityItem
                              key={[
                                activity.id,
                                activity.type,
                                activity.timestamp,
                                activity.courseId,
                                activity.lessonId,
                              ]
                                .filter(Boolean)
                                .join('-')}
                              activity={activity}
                            />
                          ))}
                        </div>
                        {totalActivityPages > 1 && (
                          <div className='flex justify-center mt-6'>
                            <Pagination
                              pagination={{
                                currentPage: activityPage - 1,
                                totalPages: totalActivityPages,
                                totalElements: activitiesToShow.length,
                                pageSize: activityPageSize,
                              }}
                              activeTab='Activity'
                              onPageChange={page => setActivityPage(page + 1)}
                              onPageSizeChange={size => {
                                setActivityPageSize(size)
                                setActivityPage(1)
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                  {activityTypes.map(type => (
                    <TabsContent key={type.key} value={type.key}>
                      {(() => {
                        const { data, total, page, pageSize, totalPages } =
                          getPaginatedTabActivities(type.key)
                        if (total === 0) {
                          return (
                            <div className='text-center py-12'>
                              <Clock className='h-12 w-12 text-gray-300 mx-auto mb-3' />
                              <h3 className='text-base font-semibold text-gray-600 mb-2'>
                                No {type.label} Activities
                              </h3>
                            </div>
                          )
                        }
                        return (
                          <>
                            <div className='space-y-4 max-w-4xl mx-auto'>
                              {data.map(activity => (
                                <ActivityItem
                                  key={[
                                    activity.id,
                                    activity.type,
                                    activity.timestamp,
                                    activity.courseId,
                                    activity.lessonId,
                                  ]
                                    .filter(Boolean)
                                    .join('-')}
                                  activity={activity}
                                />
                              ))}
                            </div>
                            {totalPages > 1 && (
                              <div className='flex justify-center mt-6'>
                                <Pagination
                                  pagination={{
                                    currentPage: page - 1,
                                    totalPages,
                                    totalElements: total,
                                    pageSize,
                                  }}
                                  activeTab={type.label}
                                  onPageChange={p =>
                                    setTabPages(tp => ({
                                      ...tp,
                                      [type.key]: p + 1,
                                    }))
                                  }
                                  onPageSizeChange={size => {
                                    setTabPageSizes(ts => ({
                                      ...ts,
                                      [type.key]: size,
                                    }))
                                    setTabPages(tp => ({
                                      ...tp,
                                      [type.key]: 1,
                                    }))
                                  }}
                                />
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
