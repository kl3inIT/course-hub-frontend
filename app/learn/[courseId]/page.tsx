'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { courseApi } from '@/api/course-api'
import { lessonApi } from '@/api/lesson-api'
import { Navbar } from '@/components/layout/navbar'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ courseId: string }>
}

export default function CourseLearnPage({ params }: PageProps) {
  const { courseId } = use(params)
  const router = useRouter()

  useEffect(() => {
    const redirectToFirstLesson = async () => {
      try {
        // Get course details
        const courseResponse = await courseApi.getCourseDetails(courseId)
        if (!courseResponse.data) {
          throw new Error('Course not found')
        }

        // Get first module
        const firstModule = courseResponse.data.modules[0]
        if (!firstModule) {
          throw new Error('No modules found in this course')
        }

        // Get lessons from first module
        const lessonsResponse = await lessonApi.getLessonsByModuleId(
          firstModule.id.toString()
        )
        const firstLesson = lessonsResponse.data[0]
        if (!firstLesson) {
          throw new Error('No lessons found in this module')
        }

        // Redirect to first lesson
        router.replace(`/learn/${courseId}/${firstLesson.id}`)
      } catch (error) {
        console.error('Error redirecting to first lesson:', error)
        // Stay on current page and show error
      }
    }

    if (courseId) {
      redirectToFirstLesson()
    }
  }, [courseId, router])

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <ProtectedRoute>
          <Card>
            <CardHeader>
              <CardTitle>Loading Course Content</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-center justify-center py-8 space-y-4'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <p className='text-muted-foreground'>
                Redirecting to first lesson...
              </p>
              <Button variant='outline' onClick={() => router.push('/courses')}>
                Back to Courses
              </Button>
            </CardContent>
          </Card>
        </ProtectedRoute>
      </div>
    </div>
  )
}
