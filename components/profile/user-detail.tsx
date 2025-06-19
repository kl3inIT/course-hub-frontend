'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/auth-context'
import { Skeleton } from '@/components/ui/skeleton'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { userApi } from '@/api/user-api'
import type { UserDetail, Course, UserActivity } from '@/types/user'

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
    : 'U'
}

// Components
const UserProfileCard = ({ userDetail }: { userDetail: UserDetail }) => (
  <Card className='shadow-md'>
    <CardHeader className='pb-4'>
      <div className='flex flex-col md:flex-row md:items-center md:space-x-6'>
        <Avatar className='h-24 w-24 md:h-32 md:w-32 border-2 border-border'>
          <AvatarImage src={userDetail.avatar || '/placeholder.svg'} />
          <AvatarFallback className='text-2xl'>
            {getInitials(userDetail.name)}
          </AvatarFallback>
        </Avatar>
        <div className='mt-4 md:mt-0'>
          <CardTitle className='text-2xl md:text-3xl'>
            {userDetail.name}
          </CardTitle>
          <CardDescription className='text-lg mt-1'>
            {userDetail.email}
          </CardDescription>
          <div className='flex items-center space-x-3 mt-4'>
            <Badge
              variant={userDetail.role === 'manager' ? 'default' : 'secondary'}
              className='px-4 py-1 text-sm capitalize'
            >
              {userDetail.role}
            </Badge>
            <Badge
              variant={
                userDetail.status === 'active' ? 'default' : 'destructive'
              }
              className='px-4 py-1 text-sm capitalize'
            >
              {userDetail.status}
            </Badge>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className='border-t pt-6'>
      <div className='grid md:grid-cols-2 gap-8'>
        <div>
          <h4 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
            Bio
          </h4>
          <p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
            {userDetail.bio || 'No bio provided'}
          </p>
        </div>
        <div>
          <h4 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
            Join Date
          </h4>
          <p className='mt-2 text-sm text-muted-foreground'>
            {formatDate(userDetail.joinDate)}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)

const CourseCard = ({ course }: { course: Course }) => (
  <Link href={`/courses/${course.id}`}>
    <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
      <CardHeader className='p-0'>
        <div className='aspect-video relative rounded-t-lg overflow-hidden'>
          <img
            src={`${S3_URL}/${course.thumbnail}`}
            alt={course.title}
            className='object-cover w-full h-full transition-transform hover:scale-105'
          />
        </div>
      </CardHeader>
      <CardContent className='p-4'>
        <h3 className='font-semibold text-lg mb-3'>{course.title}</h3>
        {typeof course.progress !== 'undefined' && (
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              <span>Course Progress</span>
              <span>{Math.round(course.progress)}%</span>
            </div>
            <div className='h-2 w-full bg-secondary rounded-full overflow-hidden'>
              <div
                className='h-full bg-primary transition-all'
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </Link>
)

const ActivityItem = ({ activity }: { activity: UserActivity }) => {
  if (activity.type !== 'comment') return null

  return (
    <div className='flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/5 transition-colors'>
      <div className='flex-1'>
        <div className='flex items-center space-x-2'>
          <MessageSquare className='h-4 w-4' />
          <p className='text-sm font-medium'>
            Commented on lesson "{activity.lessonTitle}"
          </p>
        </div>
        <div className='mt-1 space-y-1'>
          <Link
            href={`/courses/${activity.courseId}`}
            className='text-sm text-muted-foreground hover:text-primary block'
          >
            {activity.courseTitle}
          </Link>
          {activity.commentText && (
            <p className='text-sm text-muted-foreground italic'>
              "{activity.commentText}"
            </p>
          )}
        </div>
        {activity.timestamp && (
          <p className='text-xs text-muted-foreground mt-2'>
            {format(new Date(activity.timestamp), 'PPp')}
          </p>
        )}
      </div>
    </div>
  )
}

const UserDetailSkeleton = () => (
  <div className='space-y-6'>
    <Card>
      <CardHeader>
        <div className='flex items-center space-x-4'>
          <Skeleton className='h-16 w-16 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[200px]' />
            <Skeleton className='h-4 w-[150px]' />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[200px]' />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          <Skeleton className='h-10 w-full' />
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-[200px] w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-[100px]' />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

export function UserDetail({ userId }: { userId: string }) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { getToken } = useAuth()
  const pathname = usePathname()
  const isAdminView = pathname?.startsWith('/admin')

  const getEnrolledCourses = (activities: UserActivity[]): Course[] => {
    return activities
      .filter(activity => activity.type === 'enrollment')
      .map(activity => ({
        id: activity.courseId,
        title: activity.courseTitle,
        thumbnail: activity.courseThumbnail,
        progress: activity.progressPercentage || 0,
      }))
  }

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

  if (isLoading) return <UserDetailSkeleton />
  if (!userDetail) return <div>User not found</div>

  const enrolledCourses =
    userDetail.role === 'learner'
      ? getEnrolledCourses(userDetail.activities)
      : []

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      <UserProfileCard userDetail={userDetail} />

      <Card className='shadow-md'>
        <CardContent className='p-0'>
          <Tabs defaultValue='courses' className='w-full'>
            <TabsList className='w-full justify-start border-b rounded-none h-14 px-6'>
              <TabsTrigger value='courses' className='flex-1 text-base'>
                {userDetail.role === 'manager'
                  ? 'Managed Courses'
                  : 'Enrolled Courses'}
              </TabsTrigger>
              {userDetail.role === 'learner' && (
                <TabsTrigger value='activities' className='flex-1 text-base'>
                  Comments
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value='courses' className='p-6'>
              {(userDetail.role === 'manager'
                ? userDetail.managedCourses?.length || 0
                : enrolledCourses.length) === 0 ? (
                <div className='text-center py-12'>
                  <div className='text-muted-foreground'>
                    {userDetail.role === 'manager'
                      ? 'No managed courses'
                      : 'No enrolled courses'}
                  </div>
                </div>
              ) : (
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  {(userDetail.role === 'manager'
                    ? userDetail.managedCourses
                    : enrolledCourses
                  )?.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>

            {userDetail.role === 'learner' && (
              <TabsContent value='activities' className='p-6'>
                <div className='space-y-4 max-w-4xl mx-auto'>
                  {userDetail.activities.filter(a => a.type === 'comment')
                    .length === 0 ? (
                    <div className='text-center py-12'>
                      <div className='text-muted-foreground'>
                        No comments found
                      </div>
                    </div>
                  ) : (
                    userDetail.activities
                      .filter(activity => activity.type === 'comment')
                      .map(activity => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
