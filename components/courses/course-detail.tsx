'use client'

import { courseApi } from '@/api/course-api'
import { enrollmentApi } from '@/api/enrollment-api'
import { lessonApi } from '@/api/lesson-api'
import { reviewApi } from '@/api/review-api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Page } from '@/types/common'
import { CourseDetailsResponseDTO } from '@/types/course'
import { EnrollmentStatusResponseDTO } from '@/types/enrollment'
import { LessonResponseDTO } from '@/types/lesson'
import { ModuleResponseDTO } from '@/types/module'
import { ReviewResponseDTO } from '@/types/review'
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Lock,
  Play,
  PlayCircle,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { PaymentModal } from '../payment/payment-modal'

interface CourseDetailProps {
  courseId: string
}

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function CourseDetail({ courseId }: CourseDetailProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [course, setCourse] = useState<CourseDetailsResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [expandedModules, setExpandedModules] = useState<number[]>([])
  const [moduleLessons, setModuleLessons] = useState<
    Record<number, LessonResponseDTO[]>
  >({})
  const [loadingLessons, setLoadingLessons] = useState<Record<number, boolean>>(
    {}
  )
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null)
  const [heroPreviewLoading, setHeroPreviewLoading] = useState(false)
  const [heroPreviewLesson, setHeroPreviewLesson] =
    useState<LessonResponseDTO | null>(null)
  const [enrollmentStatus, setEnrollmentStatus] =
    useState<EnrollmentStatusResponseDTO | null>(null)
  const [enrollmentLoading, setEnrollmentLoading] = useState(false)
  const router = useRouter()
  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([])
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewPage, setReviewPage] = useState<Page<ReviewResponseDTO> | null>(
    null
  )
  const [expandedReviewIds, setExpandedReviewIds] = useState<number[]>([])
  const [reportModal, setReportModal] = useState<{
    open: boolean
    reviewId?: number
  }>({ open: false })
  const [reportReason, setReportReason] = useState('')
  const [reportError, setReportError] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const [previewLesson, setPreviewLesson] = useState<LessonResponseDTO | null>(
    null
  )
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const checkEnrollmentStatus = async (courseId: string) => {
    if (!user) {
      setEnrollmentStatus({ enrolled: false, progress: 0, completed: false })
      return
    }

    try {
      setEnrollmentLoading(true)
      const response = await enrollmentApi.getEnrollmentStatus(courseId)
      if (response.data) {
        setEnrollmentStatus(response.data)
      }
    } catch (err) {
      console.error('Error checking enrollment status:', err)
      setEnrollmentStatus({ enrolled: false, progress: 0, completed: false })
    } finally {
      setEnrollmentLoading(false)
    }
  }

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await courseApi.getCourseDetails(courseId)
        console.log('API Response:', response)

        if (response) {
          console.log('Course Data:', response.data)
          setCourse(response.data)
          // Check enrollment status only if user is authenticated
          if (user) {
            await checkEnrollmentStatus(courseId)
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load course details'
        )
        toast({
          title: 'Error',
          description: 'Failed to load course details. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId, toast, user])

  useEffect(() => {
    if (course && course.modules && course.modules.length > 0) {
      const firstModuleId = course.modules[0].id
      setHeroPreviewLoading(true)
      lessonApi
        .getLessonsByModuleId(firstModuleId.toString())
        .then(res => {
          const lessons = res.data || []
          // Lấy lesson đầu tiên (hoặc lesson preview đầu tiên nếu muốn)
          const previewLesson = lessons[0] // hoặc: lessons.find(l => l.isPreview)
          if (previewLesson) {
            setHeroPreviewLesson(previewLesson)
            return lessonApi.getLessonPreviewUrl(previewLesson.id.toString())
          } else {
            setHeroPreviewLesson(null)
            setHeroPreviewUrl(null)
            setHeroPreviewLoading(false)
            return null
          }
        })
        .then(url => {
          if (url) setHeroPreviewUrl(url)
        })
        .catch(() => {
          setHeroPreviewLesson(null)
          setHeroPreviewUrl(null)
        })
        .finally(() => setHeroPreviewLoading(false))
    }
  }, [course])

  const fetchModuleLessons = async (moduleId: number) => {
    if (moduleLessons[moduleId]) return // Don't fetch if already loaded

    try {
      setLoadingLessons(prev => ({ ...prev, [moduleId]: true }))
      const response = await lessonApi.getLessonsByModuleId(moduleId.toString())
      if (response.data) {
        setModuleLessons(prev => ({ ...prev, [moduleId]: response.data }))
      }
    } catch (err) {
      console.error('Error fetching lessons:', err)
      toast({
        title: 'Error',
        description: 'Failed to load lessons. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoadingLessons(prev => ({ ...prev, [moduleId]: false }))
    }
  }

  const handleEnroll = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to enroll in this course.',
        variant: 'destructive',
      })
      router.push(
        '/login?redirect=' + encodeURIComponent(window.location.pathname)
      )
      return
    }
    setShowPayment(true)
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => {
      const newExpanded = prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]

      // Fetch lessons when module is expanded
      if (newExpanded.includes(moduleId)) {
        fetchModuleLessons(moduleId)
      }

      return newExpanded
    })
  }

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewLoading(true)
      setReviewError(null)
      try {
        const res = await reviewApi.getAllReviews({
          courseId: Number(courseId),
          page: 0,
          size: 10,
          sortBy: 'modifiedDate',
          direction: 'DESC',
        })
        setReviewPage(res.data)
        setReviews(res.data.content)
      } catch (err) {
        setReviewError('Failed to load reviews')
      } finally {
        setReviewLoading(false)
      }
    }
    if (courseId) {
      fetchReviews()
    }
  }, [courseId])

  // Add preview video handling
  const handlePreviewClick = async (lesson: LessonResponseDTO) => {
    if (!lesson.isPreview) {
      toast({
        title: 'Preview Not Available',
        description: 'This lesson is not available for preview.',
        variant: 'destructive',
      })
      return
    }

    try {
      setPreviewLesson(lesson)
      const url = await lessonApi.getLessonPreviewUrl(lesson.id.toString())
      setPreviewVideoUrl(url)
      setShowPreview(true)
    } catch (error) {
      console.error('Error loading preview:', error)
      toast({
        title: 'Error',
        description: 'Failed to load preview video.',
        variant: 'destructive',
      })
    }
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setPreviewVideoUrl(null)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-muted-foreground'>Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <AlertCircle className='h-12 w-12 text-destructive mx-auto' />
          <h3 className='text-xl font-semibold'>Course Not Found</h3>
          <p className='text-muted-foreground max-w-md mx-auto'>
            {error ||
              "The course you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => window.location.reload()} variant='outline'>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto space-y-8'>
      {/* Hero Section */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden relative group'>
            {heroPreviewUrl ? (
              <video
                controls
                autoPlay={false}
                src={heroPreviewUrl}
                className='w-full h-full object-cover'
                poster={
                  course.thumbnailUrl || '/placeholder.svg?height=400&width=600'
                }
              />
            ) : (
              <img
                src={
                  course.thumbnailUrl || '/placeholder.svg?height=400&width=600'
                }
                alt={course.title}
                className='w-full h-full object-cover'
                onError={e => {
                  e.currentTarget.src = '/placeholder.svg?height=400&width=600'
                }}
              />
            )}
            {heroPreviewLoading && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
                <Loader2 className='h-8 w-8 animate-spin text-white' />
              </div>
            )}
          </div>

          <div>
            <div className='flex gap-2 mb-4'>
              <Badge variant='secondary'>{course.category}</Badge>
              <Badge variant='outline'>{course.level}</Badge>
            </div>
            <h1 className='text-4xl font-bold mb-4'>{course.title}</h1>
            <p className='text-xl text-muted-foreground mb-6'>
              {course.description}
            </p>
            <div className='flex items-center gap-2 mb-6'>
              <span className='text-lg font-medium'>By:</span>
              <span className='text-lg text-primary font-semibold'>
                {course.instructorName}
              </span>
            </div>

            <div className='flex items-center gap-6 text-sm text-muted-foreground mb-6'>
              <div className='flex items-center gap-1'>
                <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                <span className='font-medium'>
                  {course.averageRating?.toFixed(1) || '0.0'}
                </span>
                <span>({course.totalReviews.toLocaleString()} reviews)</span>
              </div>
              <div className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                <span>{formatDuration(course.totalDuration)}</span>
              </div>
              <div className='flex items-center gap-1'>
                <PlayCircle className='h-4 w-4' />
                <span>{course.totalLessons} lessons</span>
              </div>
            </div>

            <div className='text-sm text-muted-foreground'>
              Last updated: {formatDate(course.updatedAt)}
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        <div className='lg:col-span-1'>
          <Card className='sticky top-6'>
            <CardHeader>
              {enrollmentStatus?.enrolled ? null : (
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-3xl font-bold'>
                    ${course.finalPrice.toFixed(2)}
                  </span>
                  {course.discount && course.discount > 0 && (
                    <span className='text-lg text-muted-foreground line-through'>
                      $
                      {(
                        course.finalPrice /
                        (1 - course.discount / 100)
                      ).toFixed(2)}
                    </span>
                  )}
                  {course.discount && course.discount > 0 && (
                    <Badge variant='destructive' className='ml-auto'>
                      {course.discount}% OFF
                    </Badge>
                  )}
                </div>
              )}
              <CardDescription>Full lifetime access</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {enrollmentLoading ? (
                <Button disabled className='w-full' size='lg'>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Checking...
                </Button>
              ) : enrollmentStatus?.enrolled ? (
                <div className='space-y-3'>
                  <Button
                    onClick={() =>
                      router.push(
                        `/learn/${course.id}/${heroPreviewLesson?.id || ''}?progress=${enrollmentStatus?.progress ?? 0}`
                      )
                    }
                    className='w-full'
                    size='lg'
                  >
                    <Play className='h-4 w-4 mr-2' />
                    Continue Learning
                  </Button>
                  {enrollmentStatus.progress > 0 && (
                    <div className='text-sm text-muted-foreground'>
                      <div className='flex justify-between mb-1'>
                        <span>Progress</span>
                        <span>{Math.round(enrollmentStatus.progress)}%</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-primary h-2 rounded-full transition-all duration-300'
                          style={{ width: `${enrollmentStatus.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {enrollmentStatus.completed && (
                    <div className='flex items-center gap-2 text-green-600 text-sm'>
                      <CheckCircle className='h-4 w-4' />
                      <span>Course Completed!</span>
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={handleEnroll} className='w-full' size='lg'>
                  Enroll Now
                </Button>
              )}

              <div className='space-y-2 text-sm'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <span>Certificate of completion</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content Tabs */}
      <Tabs defaultValue='curriculum' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='curriculum'>Curriculum</TabsTrigger>
          <TabsTrigger value='reviews'>Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value='curriculum' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-2xl font-semibold'>Course Content</h3>
            <div className='text-sm text-muted-foreground'>
              {course?.totalModules} modules • {course?.totalLessons} lessons •{' '}
              {formatDuration(course?.totalDuration || 0)}
            </div>
          </div>

          <div className='space-y-4'>
            {course?.modules && course.modules.length > 0 ? (
              course.modules.map((module: ModuleResponseDTO) => {
                return (
                  <Card key={module.id} className='overflow-hidden'>
                    <Collapsible
                      open={expandedModules.includes(module.id)}
                      onOpenChange={() => toggleModule(module.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className='cursor-pointer hover:bg-muted/50 transition-colors'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              {expandedModules.includes(module.id) ? (
                                <ChevronDown className='h-5 w-5' />
                              ) : (
                                <ChevronRight className='h-5 w-5' />
                              )}
                              <div>
                                <CardTitle className='text-lg'>
                                  {module.title}
                                </CardTitle>
                                <CardDescription>
                                  Module {module.orderNumber}
                                </CardDescription>
                              </div>
                            </div>
                            <div className='text-right text-sm text-muted-foreground'>
                              <div>{module.totalLessons} lessons</div>
                              <div>{formatDuration(module.totalDuration)}</div>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className='pt-0'>
                          {loadingLessons[module.id] ? (
                            <div className='flex items-center justify-center py-4'>
                              <Loader2 className='h-4 w-4 animate-spin mr-2' />
                              <span className='text-muted-foreground'>
                                Loading lessons...
                              </span>
                            </div>
                          ) : moduleLessons[module.id] ? (
                            <div className='space-y-2'>
                              {moduleLessons[module.id].map(
                                (lesson: LessonResponseDTO) => {
                                  const isPreview = !!lesson.isPreview
                                  const hasDuration =
                                    lesson.duration && lesson.duration > 0
                                  return (
                                    <div
                                      key={lesson.id}
                                      className={`flex items-center justify-between p-2 rounded-lg ${isPreview ? 'hover:bg-primary/10 cursor-pointer transition' : ''}`}
                                      onClick={
                                        isPreview
                                          ? () => handlePreviewClick(lesson)
                                          : undefined
                                      }
                                    >
                                      <div className='flex items-center gap-2'>
                                        <PlayCircle className='h-4 w-4 text-muted-foreground' />
                                        <span>{lesson.title}</span>
                                        {isPreview && (
                                          <Badge
                                            variant='secondary'
                                            className='text-xs'
                                          >
                                            Preview
                                          </Badge>
                                        )}
                                      </div>
                                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        {hasDuration && (
                                          <span>
                                            {formatDuration(
                                              lesson.duration || 0
                                            )}
                                          </span>
                                        )}
                                        {!isPreview && (
                                          <Lock className='h-4 w-4' />
                                        )}
                                      </div>
                                    </div>
                                  )
                                }
                              )}
                            </div>
                          ) : (
                            <div className='flex items-center justify-center py-4 text-muted-foreground'>
                              No lessons available
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )
              })
            ) : (
              <div className='text-center text-muted-foreground py-4'>
                No modules available for this course.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value='reviews' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-2xl font-semibold'>Student Reviews</h3>
          </div>

          <div className='space-y-4'>
            {reviewLoading ? (
              <div className='text-center text-muted-foreground'>
                Loading reviews...
              </div>
            ) : reviewError ? (
              <div className='text-center text-destructive'>{reviewError}</div>
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className='p-6'>
                  <div className='text-center text-muted-foreground'>
                    No reviews yet. Be the first to review this course!
                  </div>
                </CardContent>
              </Card>
            ) : (
              reviews.map(review => {
                const isExpanded = expandedReviewIds.includes(review.id)
                const handleToggleExpand = () => {
                  setExpandedReviewIds(prev =>
                    isExpanded
                      ? prev.filter(id => id !== review.id)
                      : [...prev, review.id]
                  )
                }
                const handleOpenReport = () => {
                  setReportModal({ open: true, reviewId: review.id })
                  setReportReason('')
                  setReportError('')
                }
                return (
                  <Card
                    key={review.id}
                    className='rounded-xl shadow-sm border border-gray-200'
                  >
                    <CardContent className='p-5 pb-4 relative'>
                      <div className='flex items-start gap-4'>
                        {/* Avatar */}
                        <div
                          className='w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-4'
                          style={{ borderColor: '#1e293b' }}
                        >
                          <Link
                            href={`/profile/${review.userId}`}
                            className='block w-12 h-12'
                          >
                            {review.userAvatar ? (
                              <Image
                                src={review.userAvatar}
                                alt={review.userName}
                                width={48}
                                height={48}
                                className='object-cover w-full h-full'
                                onError={e => {
                                  e.currentTarget.src =
                                    '/placeholder.svg?height=48&width=48'
                                }}
                              />
                            ) : (
                              <div
                                className='w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold border-4'
                                style={{ borderColor: '#1e293b' }}
                              >
                                {review.userName?.charAt(0) || '?'}
                              </div>
                            )}
                          </Link>
                        </div>
                        {/* Info + comment */}
                        <div className='flex-1'>
                          <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3'>
                            <Link
                              href={`/profile/${review.userId}`}
                              className='font-semibold text-base sm:text-lg text-gray-900 hover:underline'
                            >
                              {review.userName}
                            </Link>
                            <div className='flex items-center gap-1'>
                              {[...Array(5)].map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`h-4 w-4 ${idx < review.star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className='text-xs text-muted-foreground sm:ml-auto'>
                              {(() => {
                                const d = new Date(review.createdDate)
                                return (
                                  d.toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }) +
                                  ' ' +
                                  d.toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                  })
                                )
                              })()}
                            </span>
                          </div>
                          <div className='mt-2 flex items-center justify-between'>
                            <div
                              className={`text-gray-800 text-sm sm:text-base whitespace-pre-line ${isExpanded ? '' : 'line-clamp-2'}`}
                              style={{ maxWidth: '90%' }}
                            >
                              {review.comment}
                            </div>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='flex items-center gap-1 text-sm ml-2 hover:bg-red-50 group'
                              title='Báo cáo'
                              onClick={handleOpenReport}
                            >
                              {/* Flag icon outline */}
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'
                                strokeWidth={1.5}
                                stroke='currentColor'
                                className='w-5 h-5 group-hover:text-red-500 transition-colors'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  d='M3 3v18'
                                />
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  d='M3 5h13l-1.5 4L16 13H3'
                                />
                              </svg>
                              Report
                            </Button>
                          </div>
                          {/* See more/less */}
                          {review.comment && review.comment.length > 80 && (
                            <button
                              className='text-xs text-primary mt-1 ml-1 hover:underline focus:outline-none'
                              onClick={handleToggleExpand}
                            >
                              {isExpanded ? 'See less' : 'See more'}
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Video Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className='sm:max-w-[800px] p-0 gap-0'>
          <DialogHeader className='p-4 border-b'>
            <div className='flex items-center justify-between'>
              <DialogTitle>
                {previewLesson?.title || 'Lesson Preview'}
              </DialogTitle>
            </div>
            <DialogDescription>
              Preview video for this lesson. This is a sample of the course
              content.
            </DialogDescription>
          </DialogHeader>
          <div className='aspect-video bg-black'>
            {previewVideoUrl ? (
              <video
                ref={videoRef}
                src={previewVideoUrl}
                controls
                className='w-full h-full'
                autoPlay
              />
            ) : (
              <div className='flex items-center justify-center h-full'>
                <Loader2 className='h-8 w-8 animate-spin text-white' />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        course={{
          id: course.id,
          title: course.title,
          price: course.price,
          discountedPrice: course.finalPrice,
          thumbnail: course.thumbnailUrl || undefined,
          duration: course.totalDuration,
          totalVideos: course.totalLessons,
          rating: course.averageRating || undefined,
          totalStudents: course.totalStudents,
        }}
      />

      {/* Report Modal */}
      <Dialog
        open={reportModal.open}
        onOpenChange={open => {
          // Luôn cho phép đóng modal khi ấn Cancel, X hoặc click ngoài
          setReportModal(v => ({ ...v, open }))
          setReportError('')
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg'>Report Review</DialogTitle>
          </DialogHeader>
          <div className='mb-2'>
            <Textarea
              value={reportReason}
              onChange={e => {
                setReportReason(e.target.value)
                if (e.target.value.trim().length === 0)
                  setReportError('Reason is required')
                else if (e.target.value.length > 200)
                  setReportError('Maximum 200 characters')
                else setReportError('')
              }}
              placeholder='Enter your reason (1-200 characters)'
              rows={4}
              maxLength={200}
              className={reportError ? 'border-red-500' : ''}
            />
            <div className='flex justify-between items-center mt-1'>
              <span className='text-xs text-muted-foreground'>
                {reportReason.length}/200
              </span>
              {reportError && (
                <span className='text-xs text-red-500'>{reportError}</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setReportModal({ open: false })}
              disabled={reportLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!reportReason.trim()) {
                  setReportError('Please enter a reason')
                  return
                }
                if (reportReason.length > 200) {
                  setReportError('Maximum 200 characters')
                  return
                }
                setReportLoading(true)
                // Fake send to admin
                setTimeout(() => {
                  console.log('[REPORT_TO_ADMIN]', {
                    reviewId: reportModal.reviewId,
                    reason: reportReason,
                  })
                  setReportLoading(false)
                  setReportModal({ open: false })
                  setReportReason('')
                  setReportError('')
                  toast({
                    title: 'Report sent successfully!',
                    description: 'Your report has been sent to admin.',
                    variant: 'default',
                  })
                }, 1000)
              }}
              disabled={
                reportLoading ||
                !reportReason.trim() ||
                reportReason.length > 200
              }
            >
              {reportLoading ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
