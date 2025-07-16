'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CourseEnrollmentManagement } from '@/components/manager/manager-course/course-enrollment-management'
import { RoleGuard } from '@/components/auth/role-guard'
import { ManagerSidebar } from '@/components/layout/manager-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { courseApi } from '@/services/course-api'
import { CourseResponseDTO } from '@/types/course'
import { toast } from 'sonner'

export default function CourseEnrollmentsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<CourseResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await courseApi.getCourseById(courseId)
        if (response.data) {
          setCourse(response.data)
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load course'
        setError(errorMessage)
        toast.error('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  if (loading) {
    return (
      <RoleGuard allowedRoles={['manager', 'admin']}>
        <SidebarProvider>
          <ManagerSidebar />
          <SidebarInset>
            <div className='flex-1 space-y-4 p-8 pt-6'>
              <div className='flex items-center justify-center min-h-[400px]'>
                <div className='flex flex-col items-center space-y-4'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                  <p className='text-muted-foreground'>
                    Loading course details...
                  </p>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </RoleGuard>
    )
  }

  if (error || !course) {
    return (
      <RoleGuard allowedRoles={['manager', 'admin']}>
        <SidebarProvider>
          <ManagerSidebar />
          <SidebarInset>
            <div className='flex-1 space-y-4 p-8 pt-6'>
              <div className='flex items-center justify-center min-h-[400px]'>
                <div className='text-center space-y-4'>
                  <div className='text-6xl'>⚠️</div>
                  <h3 className='text-xl font-semibold'>
                    Error Loading Course
                  </h3>
                  <p className='text-muted-foreground max-w-md mx-auto'>
                    {error || 'Course not found'}
                  </p>
                  <Button onClick={() => router.back()} variant='outline'>
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Go Back
                  </Button>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard allowedRoles={['manager', 'admin']}>
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <div className='space-y-6'>
              <div className='flex items-center space-x-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => router.back()}
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back to Courses
                </Button>
              </div>

              <CourseEnrollmentManagement
                courseId={courseId}
                courseTitle={course.title}
              />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
