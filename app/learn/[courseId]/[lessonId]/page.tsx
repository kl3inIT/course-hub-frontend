'use client'
import { use } from 'react'
import LessonViewer from '@/components/learning/lesson-viewer'
import { Navbar } from '@/components/layout/navbar'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { RoleGuard } from '@/components/auth/role-guard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, Users, GraduationCap } from 'lucide-react'
import { notFound, useRouter } from 'next/navigation'

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>
}

export default function LearnPage({ params }: PageProps) {
  const { courseId, lessonId } = use(params)
  const router = useRouter()

  // Validate required parameters
  if (!courseId || !lessonId) {
    notFound()
  }

  // Custom fallback for unauthorized access
  const UnauthorizedFallback = () => (
    <div className='max-w-2xl mx-auto'>
      <Alert className='border-amber-200 bg-amber-50'>
        <AlertCircle className='h-4 w-4 text-amber-600' />
        <AlertDescription>
          <div className='space-y-4'>
            <div>
              <h3 className='font-semibold text-amber-800'>
                Course Access Required
              </h3>
              <p className='text-amber-700'>
                You need to be enrolled in this course or have appropriate
                permissions to access the lessons.
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={() => router.push(`/courses/${courseId}`)}
                size='sm'
                variant='outline'
              >
                <GraduationCap className='h-4 w-4 mr-2' />
                View Course & Enroll
              </Button>
              <Button
                onClick={() => router.push('/courses')}
                size='sm'
                variant='outline'
              >
                Browse All Courses
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <ProtectedRoute
          requireAuth={true}
          fallback={
            <Alert className='max-w-2xl mx-auto'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                <div className='space-y-4'>
                  <div>
                    <h3 className='font-semibold'>Sign In Required</h3>
                    <p>Please sign in to access course content.</p>
                  </div>
                  <Button onClick={() => router.push('/login')} size='sm'>
                    Sign In
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          }
        >
          {/* Allow learners (enrolled), managers, and admins */}
          <RoleGuard
            allowedRoles={['learner', 'manager', 'admin']}
            redirectOnUnauthorized={false}
            fallback={UnauthorizedFallback()}
          >
            {/* Note: LessonViewer will handle enrollment checking internally with enhanced logic */}
            <LessonViewer courseId={courseId} lessonId={lessonId} />
          </RoleGuard>
        </ProtectedRoute>
      </div>
    </div>
  )
}
