'use client'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// Mock data for courses
const MOCK_COURSES = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    thumbnail: '/courses/web-dev.jpg',
    progress: 75,
    enrolledStudents: 1234,
    duration: '8 weeks',
    isFree: true,
  },
  {
    id: '2',
    title: 'Advanced JavaScript Programming',
    thumbnail: '/courses/javascript.jpg',
    progress: 45,
    enrolledStudents: 890,
    duration: '10 weeks',
    isFree: false,
  },
  {
    id: '3',
    title: 'React Fundamentals',
    thumbnail: '/courses/react.jpg',
    progress: 100,
    enrolledStudents: 2100,
    duration: '6 weeks',
    isFree: false,
  },
]

interface ResponseGeneral<T> {
  message: string
  data: T
}

interface User {
  id: string
  name: string
  avatar?: string
  joinDate?: string
  enrolledCourses: typeof MOCK_COURSES
}

const BACKEND_URL = 'http://localhost:8080'

export default function UserProfile() {
  const params = useParams()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { getToken } = useAuth()

  useEffect(() => {
    const userId = params?.id
    const fetchUserProfile = async () => {
      try {
        const token = getToken()
        if (!token) {
          throw new Error('No auth token')
        }
        if (!userId) {
          throw new Error('No user ID provided')
        }
        const apiUrl = `${BACKEND_URL}/api/users/profile/${userId}`
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to fetch user profile')
        }
        const responseData: ResponseGeneral<User> = await response.json()
        setUser({
          ...responseData.data,
          enrolledCourses: MOCK_COURSES,
        })
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load user profile',
          variant: 'destructive',
        })
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    if (params?.id) {
      fetchUserProfile()
    }
  }, [params, pathname, getToken, toast])

  if (isLoading) {
    return (
      <div className='min-h-screen flex flex-col'>
        <Navbar />
        <main className='flex-grow'>
          <div className='container mx-auto px-6 py-8'>
            <div className='grid grid-cols-10 gap-8'>
              <div className='col-span-3'>
                <Card>
                  <CardContent className='p-6'>
                    <div className='flex flex-col items-center text-center space-y-4'>
                      <Skeleton className='h-[180px] w-[180px] rounded-full' />
                      <div className='space-y-2'>
                        <Skeleton className='h-6 w-32' />
                        <Skeleton className='h-4 w-24' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className='col-span-7'>
                <Card>
                  <CardHeader className='border-b'>
                    <Skeleton className='h-8 w-64' />
                  </CardHeader>
                  <CardContent className='p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {[1, 2, 3].map(i => (
                        <Card key={i} className='overflow-hidden'>
                          <Skeleton className='aspect-video' />
                          <CardContent className='p-4'>
                            <Skeleton className='h-5 w-full mb-3' />
                            <Skeleton className='h-4 w-3/4' />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className='min-h-screen flex flex-col'>
        <Navbar />
        <main className='flex-grow'>
          <div className='container mx-auto px-6 py-8 text-center'>
            <h1 className='text-2xl font-bold text-red-600'>User not found</h1>
            <p className='text-muted-foreground mt-2'>
              The requested user profile could not be found.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const completedCourses = MOCK_COURSES.filter(
    course => course.progress === 100
  ).length
  const inProgressCourses = MOCK_COURSES.filter(
    course => course.progress > 0 && course.progress < 100
  ).length

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <main className='flex-grow'>
        <div className='container mx-auto px-6 py-8'>
          <div className='grid grid-cols-10 gap-8'>
            {/* Left Side - Profile Info (3/10) */}
            <div className='col-span-3'>
              <Card>
                <CardContent className='p-6'>
                  <div className='flex flex-col items-center text-center space-y-4'>
                    <Avatar className='h-[180px] w-[180px]'>
                      <AvatarImage src={user.avatar || '/placeholder.svg'} />
                      <AvatarFallback className='text-4xl'>
                        {user.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className='text-xl font-bold'>{user.name}</h1>
                    </div>
                    <div className='grid grid-cols-2 gap-4 w-full'>
                      <div className='text-center'>
                        <p className='text-2xl font-bold text-primary'>
                          {completedCourses}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Completed
                        </p>
                      </div>
                      <div className='text-center'>
                        <p className='text-2xl font-bold text-primary'>
                          {inProgressCourses}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          In Progress
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Courses (7/10) */}
            <div className='col-span-7'>
              <Card>
                <CardHeader className='border-b'>
                  <div className='flex items-center justify-between'>
                    <CardTitle>
                      Enrolled Courses ({MOCK_COURSES.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='p-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {MOCK_COURSES.map(course => (
                      <Card
                        key={course.id}
                        className='overflow-hidden hover:border-primary transition-all duration-200'
                      >
                        <div className='aspect-video relative'>
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className='object-cover w-full h-full'
                          />
                          <div className='absolute bottom-0 left-0 right-0 h-1 bg-muted'>
                            <div
                              className='h-full bg-primary'
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          {course.isFree && (
                            <div className='absolute top-3 left-3'>
                              <Badge
                                variant='secondary'
                                className='bg-red-500 text-white hover:bg-red-600'
                              >
                                Free
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className='p-4'>
                          <h3 className='font-semibold text-base mb-3 line-clamp-2 hover:text-primary transition-colors'>
                            {course.title}
                          </h3>
                          <div className='flex items-center justify-between text-sm text-muted-foreground'>
                            <div className='flex items-center gap-4'>
                              <span className='flex items-center gap-1'>
                                <svg
                                  className='h-4 w-4'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                                  />
                                </svg>
                                {course.enrolledStudents.toLocaleString()}
                              </span>
                              <span className='flex items-center gap-1'>
                                <svg
                                  className='h-4 w-4'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                  />
                                </svg>
                                {course.duration}
                              </span>
                            </div>
                            <span className='text-primary font-medium'>
                              {course.progress}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
