'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { courseApi } from '@/services/course-api'
import { lessonApi } from '@/services/lesson-api'
import { enrollmentApi } from '@/services/enrollment-api'
import { Navbar } from '@/components/layout/navbar'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Users, BookOpen } from 'lucide-react'

interface PageProps {
  params: Promise<{ courseId: string }>
}

export default function CourseLearnPage({ params }: PageProps) {
  const { courseId } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const redirectToFirstLesson = async () => {
      if (!user) return

      try {
        // Check if user can access this course (enrolled OR manager/admin)
        const canAccess = await enrollmentApi.canAccessCourse(
          courseId,
          user.role
        )

        if (!canAccess) {
          // Redirect to course detail page for enrollment
          router.replace(`/courses/${courseId}`)
          return
        }

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
                Loading Course Content
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-center justify-center py-8 space-y-4'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <p className='text-muted-foreground text-center'>
                Checking access permissions and redirecting to first lesson...
              </p>

              {/* Show different messages based on user role */}
              {user?.role === 'manager' || user?.role === 'admin' ? (
                <Alert className='mt-4'>
                  <Users className='h-4 w-4' />
                  <AlertDescription>
                    You have {user.role} access to all courses without
                    enrollment.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className='mt-4'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    Verifying your enrollment status for this course...
                  </AlertDescription>
                </Alert>
              )}

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
