'use client'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { userApi } from '@/services/user-api'
import type { Course, UserDetail } from '@/types/user'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const S3_URL = 'https://course-hub-resourses.s3.amazonaws.com'

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

const CourseCard = ({ course }: { course: Course }) => {
  return (
    <Link href={`/courses/${course.id}`} prefetch={false}>
      <Card className='hover:shadow-md transition-shadow cursor-pointer'>
        <CardHeader className='p-0'>
          <div className='aspect-video relative rounded-t-lg overflow-hidden bg-gray-100'>
            <img
              src={
                course.thumbnail
                  ? `${S3_URL}/${course.thumbnail}`
                  : '/placeholder.jpg'
              }
              alt={course.title}
              className='object-cover w-full h-full'
            />
          </div>
        </CardHeader>
        <CardContent className='p-4'>
          <h3 className='font-semibold text-base mb-3'>{course.title}</h3>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params?.id as string
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await userApi.getUserProfile(userId)
        setUserDetail(response.data)
      } catch (error) {
        setUserDetail(null)
      } finally {
        setIsLoading(false)
      }
    }
    if (userId) fetchUserDetail()
  }, [userId])

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    )
  }
  if (!userDetail) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        User not found
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className='w-full min-h-screen bg-gray-50/30'>
        <div className='max-w-6xl mx-auto px-2 sm:px-6 lg:px-12 py-10'>
          {/* Header */}
          <Card className='shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 w-full mb-12 rounded-2xl'>
            <CardContent className='p-8 flex flex-col md:flex-row items-center md:items-center md:gap-10'>
              <Avatar className='h-32 w-32 border-4 border-white shadow-lg mb-6 md:mb-0'>
                <AvatarImage src={userDetail.avatar || '/placeholder.svg'} />
                <AvatarFallback className='text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
                  {getInitials(userDetail.name)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 text-center md:text-left'>
                <h1 className='text-3xl font-bold text-gray-900 mb-2 break-words'>
                  {userDetail.name}
                </h1>
                <div className='flex items-center gap-2 text-base text-gray-600 justify-center md:justify-start mb-2'>
                  <Calendar className='h-5 w-5' />
                  <span>Joined {formatDate(userDetail.joinDate)}</span>
                </div>
                {userDetail.bio && (
                  <div className='mt-4 text-gray-700 leading-relaxed text-base max-w-2xl mx-auto md:mx-0'>
                    {userDetail.bio}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Enrolled Courses */}
          <div>
            <h2 className='text-2xl font-semibold mb-6'>Enrolled Courses</h2>
            {userDetail.enrolledCourses &&
            userDetail.enrolledCourses.length > 0 ? (
              <div className='grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {userDetail.enrolledCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className='text-center text-muted-foreground py-12'>
                No enrolled courses.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
