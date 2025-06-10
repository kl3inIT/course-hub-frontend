'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react'
import { courseApi } from '@/api/course-api'
import { CourseCard } from './course-card'
import { CourseResponseDTO } from '@/types/course'
import Link from 'next/link'

export function UserEnrolledCourses() {
  const [topCourses, setTopCourses] = useState<CourseResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopCourses = async () => {
      try {
        setLoading(true)
        setError(null)
        // Lấy top 6 khoá học nhiều người tham gia nhất
        const response = await courseApi.searchCourses({
          page: 0,
          size: 6,
          sort: 'totalStudents,desc',
        })
        setTopCourses(response.data.content)
      } catch (err: any) {
        console.error('Error fetching top courses:', err)
        setError('Could not load top courses')
      } finally {
        setLoading(false)
      }
    }
    fetchTopCourses()
  }, [])

  if (loading) {
    return (
      <section className='py-16 px-4'>
        <div className='container mx-auto space-y-8'>
          <div className='text-center space-y-4'>
            <h2 className='text-3xl font-bold'>Top Popular Courses</h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Discover the most popular courses with the highest number of
              students
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className='animate-pulse'>
                <div className='aspect-video bg-muted rounded-lg mb-4'></div>
                <CardHeader>
                  <div className='space-y-2'>
                    <div className='h-4 bg-muted rounded w-3/4'></div>
                    <div className='h-3 bg-muted rounded w-1/2'></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='h-3 bg-muted rounded w-full'></div>
                    <div className='h-3 bg-muted rounded w-2/3'></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className='py-16 px-4'>
        <div className='container mx-auto space-y-8'>
          <div className='text-center space-y-4'>
            <h2 className='text-3xl font-bold'>Top Popular Courses</h2>
            <div className='max-w-md mx-auto'>
              <div className='text-center space-y-4'>
                <div className='text-6xl'>⚠️</div>
                <h3 className='text-xl font-semibold'>An error occurred</h3>
                <p className='text-muted-foreground'>{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant='outline'
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (topCourses.length === 0) {
    return (
      <section className='py-16 px-4'>
        <div className='container mx-auto space-y-8'>
          <div className='text-center space-y-4'>
            <h2 className='text-3xl font-bold'>Top Popular Courses</h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              No popular courses available at the moment.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='py-16 px-4'>
      <div className='container mx-auto space-y-8'>
        <div className='text-center space-y-4'>
          <h2 className='text-3xl font-bold'>Top Popular Courses</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Discover the most popular courses with the highest number of
            students
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {topCourses.map(course => (
            <div key={course.id} className='relative'>
              <CourseCard
                course={course}
                variant='default'
                showInstructor={true}
              />
              <div className='absolute top-3 right-3'>
                <Badge
                  variant='secondary'
                  className='bg-green-100 text-green-800'
                >
                  <CheckCircle className='h-3 w-3 mr-1' />
                  {course.totalStudents || 0} students
                </Badge>
              </div>
            </div>
          ))}
        </div>
        {topCourses.length >= 6 && (
          <div className='text-center'>
            <Link href='/courses'>
              <Button variant='outline' size='lg'>
                View All Courses
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
