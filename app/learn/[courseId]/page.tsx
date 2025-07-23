'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { courseApi } from '@/services/course-api'
import { lessonApi } from '@/services/lesson-api'
import { Navbar } from '@/components/layout/navbar'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, BookOpen } from 'lucide-react'

interface PageProps {
  params: Promise<{ courseId: string }>
}

export default function CourseLearnPage({ params }: PageProps) {
  const { courseId } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const redirectToFirstLesson = async () => {
      if (!user || !courseId) return

      try {
        // Get course details to find first module
        const courseResponse = await courseApi.getCourseDetails(courseId)

        if (!courseResponse.data?.modules?.[0]) {
          router.replace(`/courses/${courseId}`)
          return
        }

        const firstModuleId = courseResponse.data.modules[0].id

        // Get lessons from first module
        const lessonsResponse = await lessonApi.getLessonsByModuleId(
          firstModuleId.toString()
        )

        if (!lessonsResponse.data?.[0]) {
          router.replace(`/courses/${courseId}`)
          return
        }

        const firstLessonId = lessonsResponse.data[0].id
        router.replace(`/learn/${courseId}/${firstLessonId}`)
      } catch (error) {
        console.error('Error finding first lesson:', error)
        router.replace(`/courses/${courseId}`)
      }
    }

    redirectToFirstLesson()
  }, [courseId, router, user])

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <ProtectedRoute requireAuth={true}>
          <Card className='max-w-2xl mx-auto'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BookOpen className='h-5 w-5' />
                Starting Course
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-center justify-center py-8 space-y-4'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <p className='text-muted-foreground text-center'>
                Loading first lesson...
              </p>

              <div className='flex gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => router.push('/courses')}
                >
                  Back to Courses
                </Button>
                <Button
                  variant='outline'
                  onClick={() => router.push(`/courses/${courseId}`)}
                >
                  Course Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </ProtectedRoute>
      </div>
    </div>
  )
}
