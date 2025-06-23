'use client'

import type React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  SkipBack,
  SkipForward,
  BookOpen,
  Home,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { DiscussionSection } from './discussion-section'
import { VideoPlayer } from './VideoPlayer'
import { CourseSidebar } from './CourseSidebar'
import { useToast } from '@/components/ui/use-toast'
import { useCourseData, useLessonProgress } from '@/hooks'

interface LessonViewerProps {
  courseId: string
  lessonId: string
}

function LessonViewer({ courseId, lessonId }: LessonViewerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // Use custom hooks for data management
  const courseData = useCourseData({
    courseId,
    lessonId,
    userId: user?.id,
  })

  const lessonProgress = useLessonProgress({
    courseId,
    currentLesson: courseData.currentLesson,
    onProgressUpdate: progress => {
      console.log('Progress updated:', progress)
    },
    onLessonComplete: lessonId => {
      toast({
        title: 'Lesson Completed!',
        description: `You've completed this lesson`,
      })

      const nextLesson = courseData.getNextLesson()
      if (nextLesson) {
        setTimeout(() => {
          navigateToLesson(
            nextLesson.module.id.toString(),
            nextLesson.lesson.id.toString()
          )
        }, 1200)
      }
    },
    onOverallProgressUpdate: progress => {
      console.log('Overall progress updated:', progress)
    },
  })

  // ✅ NEW: Check access and redirect if denied (for direct navigation)
  useEffect(() => {
    const checkAccessAndRedirect = async () => {
      if (
        !courseData.currentLesson ||
        !courseData.isEnrolled ||
        courseData.loading
      )
        return

      // Skip check for current lesson if we're already here (avoid infinite loop)
      if (lessonProgress.isAccessChecking) return

      try {
        console.log(
          '🔍 Checking access for direct navigation to lesson:',
          courseData.currentLesson.id
        )
        const canAccess = await lessonProgress.checkLessonAccess(
          courseData.currentLesson.id
        )
        console.log('🔐 Direct access check result:', canAccess)

        if (!canAccess) {
          console.log('❌ Access denied, redirecting to course page...')
          toast({
            title: 'Access Denied',
            description:
              'You need to complete previous lessons first. Redirecting to course page...',
            variant: 'destructive',
          })

          // Redirect to course page after showing error
          setTimeout(() => {
            router.push(`/courses/${courseId}`)
          }, 2000)
        }
      } catch (error) {
        console.error(
          '❌ Failed to check lesson access for direct navigation:',
          error
        )
      }
    }

    checkAccessAndRedirect()
  }, [
    courseData.currentLesson,
    courseData.isEnrolled,
    courseData.loading,
    lessonProgress.isAccessChecking,
    lessonId,
    courseId,
  ])

  // Navigation function
  const navigateToLesson = async (moduleId: string, targetLessonId: string) => {
    if (!courseId) return

    try {
      console.log('🔄 Navigating to lesson:', targetLessonId)
      console.log(
        '📋 Current completed lessons:',
        Array.from(lessonProgress.completedLessons)
      )

      // Check if user can access the target lesson
      const canAccess = await lessonProgress.checkLessonAccess(
        Number(targetLessonId)
      )
      console.log('🔐 Lesson access check result:', canAccess)

      if (!canAccess) {
        toast({
          title: 'Access Restricted',
          description: `Complete the previous lesson first. Completed: ${Array.from(lessonProgress.completedLessons).join(', ')}`,
          variant: 'destructive',
        })
        return
      }

      // Navigate to the new lesson
      console.log('✅ Navigating to lesson:', targetLessonId)
      router.push(`/learn/${courseId}/${targetLessonId}`)
    } catch (error) {
      console.error('❌ Failed to check lesson access:', error)
      toast({
        title: 'Error',
        description: 'Failed to verify lesson access. Navigating anyway...',
        variant: 'destructive',
      })
      // Navigate anyway in case of API error
      router.push(`/learn/${courseId}/${targetLessonId}`)
    }
  }

  // Early returns for error states
  if (!courseId || !lessonId) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <h2 className='text-2xl font-semibold text-destructive'>
            Error Loading Content
          </h2>
          <p className='text-muted-foreground'>
            {!courseId ? 'Course ID is required' : 'Lesson ID is required'}
          </p>
          <div className='flex gap-2 justify-center'>
            <Button onClick={() => router.push('/courses')}>
              Back to Courses
            </Button>
            {courseId && (
              <Button onClick={() => router.push(`/courses/${courseId}`)}>
                Back to Course
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (courseData.isCheckingEnrollment) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <div className='space-y-2'>
            <p className='text-lg font-medium'>Checking enrollment...</p>
            <p className='text-sm text-muted-foreground'>
              Please wait while we verify your access
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!courseData.isEnrolled) {
    return (
      <div className='max-w-2xl mx-auto'>
        <Alert className='border-destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold text-destructive'>
                  Access Restricted
                </h3>
                <p className='mt-1'>
                  You need to enroll in this course to access its content.
                </p>
              </div>
              <div className='flex gap-2'>
                <Button
                  onClick={() => router.push(`/courses/${courseId}`)}
                  size='sm'
                  variant='outline'
                >
                  <Home className='h-4 w-4 mr-2' />
                  View Course Details
                </Button>
                <Button
                  onClick={() => router.push('/courses')}
                  size='sm'
                  variant='outline'
                >
                  <Home className='h-4 w-4 mr-2' />
                  Browse Courses
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (courseData.loading || lessonProgress.isAccessChecking) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <div className='space-y-2'>
            <p className='text-lg font-medium'>
              {lessonProgress.isAccessChecking
                ? 'Checking lesson access...'
                : 'Loading course content...'}
            </p>
            <p className='text-sm text-muted-foreground'>
              Please wait while we{' '}
              {lessonProgress.isAccessChecking
                ? 'verify your access'
                : 'fetch your lesson'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (courseData.error) {
    return (
      <div className='max-w-2xl mx-auto'>
        <Alert className='border-destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold text-destructive'>
                  Error Loading Content
                </h3>
                <p className='mt-1'>{courseData.error}</p>
              </div>
              <div className='flex gap-2'>
                <Button
                  onClick={() => window.location.reload()}
                  size='sm'
                  variant='outline'
                >
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push('/courses')}
                  size='sm'
                  variant='outline'
                >
                  <Home className='h-4 w-4 mr-2' />
                  Back to Courses
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (
    !courseData.course ||
    !courseData.currentModule ||
    !courseData.currentLesson
  ) {
    return (
      <Alert className='max-w-2xl mx-auto'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          <div className='space-y-3'>
            <div>
              <h3 className='font-semibold'>Content Not Available</h3>
              <p>The requested lesson content could not be found.</p>
            </div>
            <Button onClick={() => router.push('/courses')} size='sm'>
              <Home className='h-4 w-4 mr-2' />
              Back to Courses
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  const nextLesson = courseData.getNextLesson()
  const previousLesson = courseData.getPreviousLesson()

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href='/courses'>Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/courses/${courseData.course.id}`}>
              {courseData.course.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{courseData.currentModule.title}</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{courseData.currentLesson.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <CardTitle className='text-2xl'>
                {courseData.course.title}
              </CardTitle>
            </div>
            {lessonProgress.displayProgress !== undefined && (
              <Badge variant='secondary'>
                {Math.round(lessonProgress.displayProgress)}% Complete
              </Badge>
            )}
          </div>
          {lessonProgress.displayProgress !== undefined && (
            <Progress
              value={lessonProgress.displayProgress}
              className='w-full'
            />
          )}
        </CardHeader>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-3 space-y-6'>
          {/* Current Module Info */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-lg'>
                    Module {courseData.currentModule.orderNumber}:{' '}
                    {courseData.currentModule.title}
                  </CardTitle>
                  <CardDescription>
                    {courseData.course.totalLessons} lessons •{' '}
                    {lessonProgress.formatDuration(
                      courseData.course.totalDuration
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Video Player */}
          <Card>
            <CardContent className='p-0'>
              <VideoPlayer
                videoUrl={courseData.videoUrl}
                course={courseData.course}
                lesson={courseData.currentLesson}
                onVideoEnded={async () => {
                  // ✅ FIXED: Update progress to 100% first, then mark complete
                  if (courseData.currentLesson) {
                    // First update progress to completion (using lesson duration or current video duration)
                    const lessonDuration =
                      courseData.currentLesson.duration || 0
                    if (lessonDuration > 0) {
                      await lessonProgress.updateLessonProgress(
                        lessonDuration,
                        0
                      )
                    }

                    // Then mark lesson complete (this will sync with backend AND refresh completed lessons)
                    await lessonProgress.markLessonComplete(
                      courseData.currentLesson.id
                    )
                  }
                }}
                onProgressUpdate={(currentTime, progress) => {
                  if (courseData.currentLesson) {
                    lessonProgress.updateLessonProgress(currentTime, progress)
                  }
                }}
                onPreviousLesson={() =>
                  previousLesson &&
                  navigateToLesson(
                    previousLesson.module.id.toString(),
                    previousLesson.lesson.id.toString()
                  )
                }
                onNextLesson={() =>
                  nextLesson &&
                  navigateToLesson(
                    nextLesson.module.id.toString(),
                    nextLesson.lesson.id.toString()
                  )
                }
                hasPreviousLesson={!!previousLesson}
                hasNextLesson={!!nextLesson}
              />
            </CardContent>
          </Card>

          {/* Lesson Content */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <BookOpen className='h-5 w-5 mr-2' />
                Lesson {courseData.currentLesson.orderNumber}:{' '}
                {courseData.currentLesson.title}
              </CardTitle>
              <CardDescription>
                Lesson content for {courseData.currentLesson.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='content' className='w-full'>
                <TabsList>
                  <TabsTrigger value='content'>Lesson Content</TabsTrigger>
                  <TabsTrigger value='discussion'>Discussion</TabsTrigger>
                </TabsList>

                <TabsContent value='content' className='mt-4'>
                  <div className='prose prose-sm max-w-none dark:prose-invert'>
                    <div className='whitespace-pre-wrap'>
                      <p>
                        This is the content area for "
                        {courseData.currentLesson.title}".
                      </p>
                      <p>
                        Lesson content and materials will be displayed here when
                        available.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='discussion' className='mt-4'>
                  <DiscussionSection
                    lessonId={courseData.currentLesson.id.toString()}
                    courseId={courseData.course.id.toString()}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className='flex justify-between'>
            <Button
              variant='outline'
              onClick={() =>
                previousLesson &&
                navigateToLesson(
                  previousLesson.module.id.toString(),
                  previousLesson.lesson.id.toString()
                )
              }
              disabled={!previousLesson}
            >
              <SkipBack className='h-4 w-4 mr-2' />
              Previous Lesson
            </Button>
            <Button
              onClick={() =>
                nextLesson &&
                navigateToLesson(
                  nextLesson.module.id.toString(),
                  nextLesson.lesson.id.toString()
                )
              }
              disabled={!nextLesson}
            >
              Next Lesson
              <SkipForward className='h-4 w-4 ml-2' />
            </Button>
          </div>
        </div>

        {/* Sidebar - Course Structure */}
        <div className='space-y-4'>
          <CourseSidebar
            course={courseData.course}
            currentLesson={courseData.currentLesson}
            moduleLessons={courseData.moduleLessons}
            expandedModules={courseData.expandedModules}
            completedLessons={lessonProgress.completedLessons}
            accessReason={lessonProgress.accessReason}
            onLessonClick={navigateToLesson}
            onModuleToggle={courseData.toggleModuleExpansion}
            formatDuration={lessonProgress.formatDuration}
          />
        </div>
      </div>
    </div>
  )
}

// Export the LessonViewer component directly
export default LessonViewer
