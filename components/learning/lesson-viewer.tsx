'use client'

import type React from 'react'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronRight,
  Home,
  AlertCircle,
  RefreshCw,
  Monitor,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { DiscussionSection } from './discussion-section'
import { useToast } from '@/components/ui/use-toast'
import { courseApi } from '@/services/course-api'
import { moduleApi } from '@/services/module-api'
import { lessonApi } from '@/services/lesson-api'
import { CourseDetailsResponseDTO } from '@/types/course'
import { ModuleResponseDTO } from '@/types/module'
import { LessonResponseDTO } from '@/types/lesson'
import { progressApi } from '@/services/progress-api'
import {
  LessonProgressDTO,
  UpdateLessonProgressRequestDTO,
} from '@/types/progress'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { enrollmentApi } from '@/services/enrollment-api'

interface LessonViewerProps {
  courseId: string
  lessonId: string
}

function LessonViewer({ courseId, lessonId }: LessonViewerProps) {
  // All hooks must be called before any early return
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : undefined
  const overallProgress = searchParams
    ? Number(searchParams.get('progress'))
    : undefined

  // Enrollment state
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null)
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true)

  // Course/lesson/module state
  const [course, setCourse] = useState<CourseDetailsResponseDTO | null>(null)
  const [currentModule, setCurrentModule] = useState<ModuleResponseDTO | null>(
    null
  )
  const [currentLesson, setCurrentLesson] = useState<LessonResponseDTO | null>(
    null
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [moduleLessons, setModuleLessons] = useState<
    Record<string, LessonResponseDTO[]>
  >({})

  // Video player state
  const [videoSize, setVideoSize] = useState<'small' | 'medium' | 'large'>(
    'medium'
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // Video refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Seek state
  const [hasSeeked, setHasSeeked] = useState(false)

  // Video URL
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined)

  // Progress tracking
  const [lessonProgress, setLessonProgress] =
    useState<LessonProgressDTO | null>(null)
  const [isProgressLoading, setIsProgressLoading] = useState(true)
  const [canAccessLesson, setCanAccessLesson] = useState(true)
  const [accessReason, setAccessReason] = useState<string | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(
    new Set()
  )
  const lastProgressUpdate = useRef<number>(0)
  const progressUpdateInterval = 10000 // Update progress every 10 seconds
  const [isAccessChecking, setIsAccessChecking] = useState(true)

  // Progress from query/localStorage
  const [displayProgress, setDisplayProgress] = useState<number | undefined>(
    overallProgress
  )

  // All hooks above, now handle early returns below

  // Add enrollment check effect
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!courseId || !user) {
        setIsEnrolled(false)
        setIsCheckingEnrollment(false)
        return
      }
      try {
        setIsCheckingEnrollment(true)
        const response = await enrollmentApi.getEnrollmentStatus(courseId)
        setIsEnrolled(response.data?.enrolled || false)
      } catch (error) {
        console.error('Failed to check enrollment:', error)
        setIsEnrolled(false)
      } finally {
        setIsCheckingEnrollment(false)
      }
    }
    checkEnrollment()
  }, [courseId, user])

  // Validation for required params
  useEffect(() => {
    if (!courseId || !lessonId) {
      setError(!courseId ? 'Course ID is required' : 'Lesson ID is required')
      setLoading(false)
    }
  }, [courseId, lessonId])

  // Fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
      const activeElement = document.activeElement?.tagName
      if (
        e.key === ' ' &&
        activeElement !== 'INPUT' &&
        activeElement !== 'TEXTAREA'
      ) {
        e.preventDefault()
        await togglePlayPause()
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isFullscreen, isPlaying])

  // Fetch course data and navigate to appropriate lesson
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        setError('Course ID is required')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const courseResponse = await courseApi.getCourseDetails(courseId)
        if (!courseResponse.data) {
          throw new Error(`Course with ID "${courseId}" not found`)
        }
        setCourse(courseResponse.data)
        if (!lessonId) {
          const firstModule = courseResponse.data.modules[0]
          if (firstModule) {
            const lessonsResponse = await lessonApi.getLessonsByModuleId(
              firstModule.id.toString()
            )
            const firstLesson = lessonsResponse.data[0]
            if (firstLesson) {
              router.replace(`/learn/${courseId}?lesson=${firstLesson.id}`)
              return
            }
          }
        }
        let foundModule: ModuleResponseDTO | undefined = undefined
        let foundLesson: LessonResponseDTO | undefined = undefined
        for (const m of courseResponse.data.modules) {
          const lessonsResponse = await lessonApi.getLessonsByModuleId(
            m.id.toString()
          )
          const lesson = lessonsResponse.data.find(
            l => l.id.toString() === lessonId
          )
          if (lesson) {
            foundModule = m
            foundLesson = lesson
            setModuleLessons(prev => ({
              ...prev,
              [m.id]: lessonsResponse.data,
            }))
            break
          } else {
            setModuleLessons(prev => ({
              ...prev,
              [m.id]: lessonsResponse.data,
            }))
          }
        }
        if (!foundModule || !foundLesson) {
          throw new Error(
            `Lesson with ID "${lessonId}" not found in any module of course "${courseResponse.data.title}"`
          )
        }
        setCurrentModule(foundModule)
        setCurrentLesson(foundLesson)
        setExpandedModules(new Set([foundModule.id.toString()]))
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load course content'
        )
      } finally {
        setLoading(false)
      }
    }
    fetchCourseData()
  }, [courseId, lessonId, router])

  // Video player functions
  const togglePlayPause = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause()
          setIsPlaying(false)
        } else {
          if (!videoUrl) {
            return
          }
          if (videoRef.current.readyState < 2) {
            videoRef.current.load()
            await new Promise(resolve => {
              const handleCanPlay = () => {
                videoRef.current?.removeEventListener('canplay', handleCanPlay)
                resolve(true)
              }
              videoRef.current?.addEventListener('canplay', handleCanPlay)
            })
          }
          try {
            await videoRef.current.play()
            setIsPlaying(true)
          } catch (error) {
            setIsPlaying(false)
          }
        }
      } catch (error) {
        setIsPlaying(false)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (videoContainerRef.current?.requestFullscreen) {
        videoContainerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      setProgress((current / total) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const percentage = clickX / width
      const newTime = percentage * duration
      videoRef.current.currentTime = newTime
    }
  }

  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = Number.parseFloat(e.target.value)
    setPlaybackSpeed(newSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleLessonComplete = () => {
    if (!currentLesson || !course) return

    // TODO: Implement lesson completion API call
    toast({
      title: 'Lesson Completed!',
      description: `You've completed "${currentLesson.title}"`,
    })
  }

  const navigateToLesson = async (
    targetModuleId: string,
    targetLessonId: string
  ) => {
    if (!courseId) return

    try {
      // Check if user can access the target lesson
      const canAccess = await progressApi.canAccessLesson(
        Number(targetLessonId)
      )
      if (!canAccess) {
        toast({
          title: 'Access Restricted',
          description: 'Complete the previous lesson first',
          variant: 'destructive',
        })
        return
      }

      // Reset video state when navigating
      setVideoUrl(undefined)
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
      setDuration(0)

      // Điều hướng đúng sang /learn/[courseId]/[lessonId]
      router.push(`/learn/${courseId}/${targetLessonId}`)
    } catch (error) {
      console.error('Failed to check lesson access:', error)
      toast({
        title: 'Error',
        description: 'Failed to verify lesson access',
        variant: 'destructive',
      })
    }
  }

  const getNextLesson = () => {
    if (!course || !currentModule || !currentLesson) return null

    const currentModuleIndex = course.modules.findIndex(
      m => m.id.toString() === currentModule.id.toString()
    )
    const currentLessonIndex = moduleLessons[currentModule.id]?.findIndex(
      l => l.id.toString() === currentLesson.id.toString()
    )

    // Next lesson in current module
    if (
      currentLessonIndex !== undefined &&
      currentLessonIndex < moduleLessons[currentModule.id].length - 1
    ) {
      return {
        module: currentModule,
        lesson: moduleLessons[currentModule.id][currentLessonIndex + 1],
      }
    }

    // First lesson of next module
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1]
      return {
        module: nextModule,
        lesson: moduleLessons[nextModule.id]?.[0],
      }
    }

    return null
  }

  const getPreviousLesson = () => {
    if (!course || !currentModule || !currentLesson) return null

    const currentModuleIndex = course.modules.findIndex(
      m => m.id.toString() === currentModule.id.toString()
    )
    const currentLessonIndex = moduleLessons[currentModule.id]?.findIndex(
      l => l.id.toString() === currentLesson.id.toString()
    )

    // Previous lesson in current module
    if (currentLessonIndex !== undefined && currentLessonIndex > 0) {
      return {
        module: currentModule,
        lesson: moduleLessons[currentModule.id][currentLessonIndex - 1],
      }
    }

    // Last lesson of previous module
    if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1]
      return {
        module: prevModule,
        lesson:
          moduleLessons[prevModule.id]?.[
          moduleLessons[prevModule.id].length - 1
            ],
      }
    }

    return null
  }

  const toggleModuleExpansion = async (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
      // Fetch lessons when module is expanded
      try {
        const lessonsResponse = await lessonApi.getLessonsByModuleId(moduleId)
        setModuleLessons(prev => ({
          ...prev,
          [moduleId]: lessonsResponse.data,
        }))
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to load module lessons',
          variant: 'destructive',
        })
      }
    }
    setExpandedModules(newExpanded)
  }

  // Add effect to check lesson access and load completed lessons
  useEffect(() => {
    const checkLessonAccess = async () => {
      if (!currentLesson || !course) return

      try {
        setIsAccessChecking(true)
        // Check if user can access this lesson
        const canAccess = await progressApi.canAccessLesson(currentLesson.id)
        setCanAccessLesson(canAccess)
        setAccessReason(canAccess ? null : 'Complete the previous lesson first')

        // Load completed lessons for the course
        const completedResponse = await progressApi.getCompletedLessons(
          course.id
        )
        setCompletedLessons(new Set(completedResponse.data))
      } catch (error) {
        console.error('Failed to check lesson access:', error)
        setCanAccessLesson(false)
        setAccessReason('Failed to verify lesson access')
        toast({
          title: 'Error',
          description: 'Failed to verify lesson access. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsAccessChecking(false)
      }
    }

    checkLessonAccess()
  }, [currentLesson, course, toast])

  // Add progress tracking effect
  useEffect(() => {
    const loadLessonProgress = async () => {
      if (currentLesson) {
        setIsProgressLoading(true)
        try {
          const response = await progressApi.getLessonProgress(currentLesson.id)
          setLessonProgress(response.data)
          // Set video position if progress exists
          if (response.data && videoRef.current) {
            videoRef.current.currentTime = response.data.currentTime
          }
        } catch (error) {
          console.error('Failed to load lesson progress:', error)
          // Initialize with default values if progress doesn't exist
          const defaultProgress: LessonProgressDTO = {
            lessonId: currentLesson.id,
            currentTime: 0,
            watchedTime: 0,
            isCompleted: 0,
          }
          setLessonProgress(defaultProgress)
        } finally {
          setIsProgressLoading(false)
        }
      }
    }
    loadLessonProgress()
  }, [currentLesson])

  // Update progress periodically
  useEffect(() => {
    if (isProgressLoading) return // Don't update if still loading initial progress

    const updateProgress = async () => {
      if (!currentLesson || !videoRef.current) return

      const now = Date.now()
      if (now - lastProgressUpdate.current < progressUpdateInterval) return

      try {
        const currentTime = Math.floor(videoRef.current.currentTime)
        const watchedDelta = Math.floor(
          Math.max(
            0,
            videoRef.current.currentTime - (lessonProgress?.currentTime || 0)
          )
        )

        if (watchedDelta > 0) {
          const updateData: UpdateLessonProgressRequestDTO = {
            currentTime: currentTime.toString(),
            watchedDelta: watchedDelta.toString(),
          }

          const response = await progressApi.updateLessonProgress(
            currentLesson.id,
            updateData
          )
          setLessonProgress(response.data)
          lastProgressUpdate.current = now
        }
      } catch (error) {
        console.error('Failed to update progress:', error)
        // Don't update lastProgressUpdate to retry sooner
      }
    }

    const interval = setInterval(updateProgress, progressUpdateInterval)
    return () => clearInterval(interval)
  }, [currentLesson, lessonProgress, isProgressLoading])

  // Update progress when video ends
  const handleVideoEnded = async () => {
    if (!currentLesson || !videoRef.current || isProgressLoading) return
    try {
      const updateData: UpdateLessonProgressRequestDTO = {
        currentTime: Math.floor(videoRef.current.duration).toString(),
        watchedDelta: Math.floor(
          videoRef.current.duration - (lessonProgress?.currentTime || 0)
        ).toString(),
      }
      const response = await progressApi.updateLessonProgress(
        currentLesson.id,
        updateData
      )
      setLessonProgress(response.data)
      setIsPlaying(false)
      // Mark lesson as completed in sidebar instantly
      setCompletedLessons(prev => new Set(prev).add(currentLesson.id))
      // Nếu có nextLesson thì tự động chuyển sang bài tiếp theo
      if (nextLesson && nextLesson.lesson && nextLesson.module) {
        setTimeout(() => {
          navigateToLesson(
            nextLesson.module.id.toString(),
            nextLesson.lesson.id.toString()
          )
        }, 1200)
      }
      // Cập nhật progress tổng thể
      updateOverallProgress()
    } catch (error) {
      setIsPlaying(false)
    }
  }

  // Add effect to handle video source changes
  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!currentLesson) return
      try {
        const response = await lessonApi.getLessonUrl(
          currentLesson.id.toString()
        )
        setVideoUrl(response)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load video content',
          variant: 'destructive',
        })
        setVideoUrl(undefined)
      }
    }
    fetchVideoUrl()
  }, [currentLesson, toast])

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.load() // Reload video when source changes
      // Reset video state
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
      setDuration(0)

      // Add event listener for when video is ready to play
      const handleCanPlay = () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration)
        }
      }
      videoRef.current.addEventListener('canplay', handleCanPlay)

      return () => {
        videoRef.current?.removeEventListener('canplay', handleCanPlay)
      }
    }
  }, [videoUrl])

  // Thêm hàm formatDuration
  function formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0m'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) return `${h}h ${m}m ${s > 0 ? s + 's' : ''}`.trim()
    if (m > 0) return `${m}m${s > 0 ? ' ' + s + 's' : ''}`
    return `${s}s`
  }

  // Khi nhận progress từ query string:
  useEffect(() => {
    if (overallProgress !== undefined && !isNaN(overallProgress)) {
      localStorage.setItem(
        `course-progress-${courseId}`,
        overallProgress.toString()
      )
    }
  }, [overallProgress, courseId])

  // Khi render, lấy từ localStorage nếu không có trong query string:
  useEffect(() => {
    if (overallProgress === undefined || isNaN(overallProgress)) {
      const stored = localStorage.getItem(`course-progress-${courseId}`)
      if (stored) setDisplayProgress(Number(stored))
    } else {
      setDisplayProgress(overallProgress)
    }
  }, [overallProgress, courseId])

  // Hàm cập nhật progress tổng thể từ backend
  const updateOverallProgress = async () => {
    try {
      const res = await enrollmentApi.getEnrollmentStatus(courseId)
      if (res.data && typeof res.data.progress === 'number') {
        setDisplayProgress(res.data.progress)
        localStorage.setItem(
          `course-progress-${courseId}`,
          res.data.progress.toString()
        )
      }
    } catch {}
  }

  // Gọi updateOverallProgress khi sang lesson mới
  useEffect(() => {
    if (currentLesson) {
      updateOverallProgress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson])

  // Reset video player state when lessonId changes
  useEffect(() => {
    setIsPlaying(false)
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
    setHasSeeked(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }, [lessonId])

  // Early returns (after all hooks)
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

  if (isCheckingEnrollment) {
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

  if (!isEnrolled) {
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

  const nextLesson = getNextLesson()
  const previousLesson = getPreviousLesson()

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <div className='space-y-2'>
            <p className='text-lg font-medium'>Loading course content...</p>
            <p className='text-sm text-muted-foreground'>
              Please wait while we fetch your lesson
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
                <p className='mt-1'>{error}</p>
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

  if (!course || !currentModule || !currentLesson) {
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
            <BreadcrumbLink href={`/courses/${course.id}`}>
              {course.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentModule.title}</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentLesson.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <CardTitle className='text-2xl'>{course.title}</CardTitle>
            </div>
            {displayProgress !== undefined && (
              <Badge variant='secondary'>
                {Math.round(displayProgress)}% Complete
              </Badge>
            )}
          </div>
          {displayProgress !== undefined && (
            <Progress value={displayProgress} className='w-full' />
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
                    Module {currentModule.orderNumber}: {currentModule.title}
                  </CardTitle>
                  <CardDescription>
                    {course.totalLessons} lessons •{' '}
                    {formatDuration(course.totalDuration)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Enhanced Video Player */}
          <Card>
            <CardContent className='p-0'>
              {isAccessChecking ? (
                <div className='p-8 text-center space-y-4'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
                  <p className='text-muted-foreground'>
                    Checking lesson access...
                  </p>
                </div>
              ) : !canAccessLesson ? (
                <div className='p-8 text-center space-y-4'>
                  <AlertCircle className='h-12 w-12 mx-auto text-destructive' />
                  <h3 className='text-lg font-semibold'>
                    Lesson Access Restricted
                  </h3>
                  <p className='text-muted-foreground'>{accessReason}</p>
                  {previousLesson && (
                    <Button
                      onClick={() =>
                        navigateToLesson(
                          previousLesson.module.id.toString(),
                          previousLesson.lesson.id.toString()
                        )
                      }
                    >
                      <SkipBack className='h-4 w-4 mr-2' />
                      Return to Previous Lesson
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  className={`relative bg-black transition-all duration-300 ${
                    isFullscreen ? 'fixed inset-0 z-50' : 'rounded-t-lg'
                  }`}
                  ref={videoContainerRef}
                >
                  {!videoUrl && (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/80 z-10'>
                      <div className='text-white text-center'>
                        No video available for this lesson.
                      </div>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    className={`w-full object-contain ${
                      isFullscreen
                        ? 'h-screen'
                        : videoSize === 'small'
                          ? 'h-48 md:h-64'
                          : videoSize === 'medium'
                            ? 'h-64 md:h-80 lg:h-96'
                            : 'h-80 md:h-96 lg:h-[32rem]'
                    }`}
                    poster={
                      course.thumbnailUrl ||
                      '/placeholder.svg?height=400&width=600'
                    }
                    controls={false}
                    onClick={togglePlayPause}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnded}
                    onError={e => console.error('Video error:', e)}
                  >
                    {videoUrl && <source src={videoUrl} type='video/mp4' />}
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Overlay Controls */}
                  <div
                    className={`absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 ${isPlaying ? '' : 'opacity-100'}`}
                  >
                    {/* Center Play/Pause Button */}
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <Button
                        size='lg'
                        variant='secondary'
                        className='rounded-full h-16 w-16 bg-black/50 hover:bg-black/70 backdrop-blur-sm'
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className='h-8 w-8' />
                        ) : (
                          <Play className='h-8 w-8 ml-1' />
                        )}
                      </Button>
                    </div>

                    {/* Top Controls */}
                    <div className='absolute top-4 right-4 flex items-center space-x-2'>
                      {/* Video Size Controls */}
                      <div className='flex items-center space-x-1 bg-black/50 rounded-lg p-1 backdrop-blur-sm'>
                        <Button
                          size='sm'
                          variant={
                            videoSize === 'small' ? 'secondary' : 'ghost'
                          }
                          className='h-8 w-8 p-0 text-white hover:text-black'
                          onClick={() => setVideoSize('small')}
                          title='Small video'
                        >
                          <Monitor className='h-3 w-3' />
                        </Button>
                        <Button
                          size='sm'
                          variant={
                            videoSize === 'medium' ? 'secondary' : 'ghost'
                          }
                          className='h-8 w-8 p-0 text-white hover:text-black'
                          onClick={() => setVideoSize('medium')}
                          title='Medium video'
                        >
                          <Monitor className='h-4 w-4' />
                        </Button>
                        <Button
                          size='sm'
                          variant={
                            videoSize === 'large' ? 'secondary' : 'ghost'
                          }
                          className='h-8 w-8 p-0 text-white hover:text-black'
                          onClick={() => setVideoSize('large')}
                          title='Large video'
                        >
                          <Monitor className='h-5 w-5' />
                        </Button>
                      </div>

                      {/* Fullscreen Toggle */}
                      <Button
                        size='sm'
                        variant='ghost'
                        className='h-8 w-8 p-0 text-white hover:text-black bg-black/50 hover:bg-white/90 backdrop-blur-sm'
                        onClick={toggleFullscreen}
                        title={
                          isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                        }
                      >
                        {isFullscreen ? (
                          <Minimize2 className='h-4 w-4' />
                        ) : (
                          <Maximize2 className='h-4 w-4' />
                        )}
                      </Button>
                    </div>

                    {/* Bottom Controls Bar */}
                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                      {/* Progress Bar */}
                      <div className='mb-3'>
                        <div
                          className='w-full h-1 bg-white/30 rounded-full cursor-pointer group relative'
                          onClick={handleProgressClick}
                          ref={progressBarRef}
                          title='Seeking will not count towards watch time'
                        >
                          <div
                            className='h-full bg-primary rounded-full transition-all duration-150'
                            style={{ width: `${progress}%` }}
                          />
                          {/* Hover Tooltip */}
                          <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap'>
                            Seeking will not count towards watch time
                          </div>
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                            onClick={() =>
                              previousLesson &&
                              navigateToLesson(
                                previousLesson.module.id.toString(),
                                previousLesson.lesson.id.toString()
                              )
                            }
                            disabled={!previousLesson}
                            title='Previous lesson'
                          >
                            <SkipBack className='h-4 w-4' />
                          </Button>

                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                            onClick={() => seekVideo(-10)}
                            title='Rewind 10 seconds'
                          >
                            <RotateCcw className='h-4 w-4' />
                          </Button>

                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                            onClick={togglePlayPause}
                            title={isPlaying ? 'Pause' : 'Play'}
                          >
                            {isPlaying ? (
                              <Pause className='h-4 w-4' />
                            ) : (
                              <Play className='h-4 w-4' />
                            )}
                          </Button>

                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                            onClick={() => seekVideo(10)}
                            title='Forward 10 seconds'
                          >
                            <RotateCw className='h-4 w-4' />
                          </Button>

                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                            onClick={() =>
                              nextLesson &&
                              navigateToLesson(
                                nextLesson.module.id.toString(),
                                nextLesson.lesson.id.toString()
                              )
                            }
                            disabled={!nextLesson}
                            title='Next lesson'
                          >
                            <SkipForward className='h-4 w-4' />
                          </Button>

                          {/* Volume Control */}
                          <div className='flex items-center space-x-2'>
                            <Button
                              size='sm'
                              variant='ghost'
                              className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                              onClick={toggleMute}
                              title={isMuted ? 'Unmute' : 'Mute'}
                            >
                              {isMuted ? (
                                <VolumeX className='h-4 w-4' />
                              ) : (
                                <Volume2 className='h-4 w-4' />
                              )}
                            </Button>
                            <input
                              type='range'
                              min='0'
                              max='1'
                              step='0.1'
                              value={volume}
                              onChange={handleVolumeChange}
                              className='w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider'
                              title='Volume'
                            />
                          </div>
                        </div>

                        <div className='flex items-center space-x-4 text-white text-sm'>
                          {/* Time Display */}
                          <span className='font-mono'>
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>

                          {/* Playback Speed */}
                          <select
                            value={playbackSpeed}
                            onChange={handleSpeedChange}
                            className='bg-black/50 text-white text-xs rounded px-2 py-1 border-none outline-none cursor-pointer'
                            title='Playback speed'
                          >
                            <option value={0.5}>0.5x</option>
                            <option value={0.75}>0.75x</option>
                            <option value={1}>1x</option>
                            <option value={1.25}>1.25x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fullscreen Exit Hint */}
                  {isFullscreen && (
                    <div className='absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded backdrop-blur-sm'>
                      Press ESC to exit fullscreen
                    </div>
                  )}
                </div>
              )}

              {/* Video Info Bar (only visible when not fullscreen) */}
              {!isFullscreen && (
                <div className='p-4 border-t bg-muted/30'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                        <Clock className='h-4 w-4' />
                        <span>
                          {formatDuration(currentLesson?.duration || 0)}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                        <Monitor className='h-4 w-4' />
                        <span className='capitalize'>{videoSize} player</span>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={toggleFullscreen}
                      >
                        <Maximize2 className='h-4 w-4 mr-2' />
                        Fullscreen
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lesson Content */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <BookOpen className='h-5 w-5 mr-2' />
                Lesson {currentLesson.orderNumber}: {currentLesson.title}
              </CardTitle>
              <CardDescription>{currentLesson.description}</CardDescription>
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
                      {currentLesson.description}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='discussion' className='mt-4'>
                  <DiscussionSection
                    lessonId={currentLesson.id.toString()}
                    courseId={course.id.toString()}
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
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Course Content</CardTitle>
              <CardDescription>
                {course.totalModules} modules • {course.totalLessons} lessons
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              {course.modules.map(module => (
                <Collapsible
                  key={module.id}
                  open={expandedModules.has(module.id.toString())}
                  onOpenChange={() =>
                    toggleModuleExpansion(module.id.toString())
                  }
                >
                  <CollapsibleTrigger asChild>
                    <div className='flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted'>
                      <div className='flex items-center space-x-2'>
                        {expandedModules.has(module.id.toString()) ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                        <div className='text-left'>
                          <p className='font-medium text-sm'>
                            Module {module.orderNumber}: {module.title}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {formatDuration(module.totalDuration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className='space-y-1 ml-6 mt-2'>
                    {moduleLessons[module.id]?.map(lesson => (
                      <div
                        key={lesson.id}
                        className={`p-2 rounded cursor-pointer transition-colors text-sm ${
                          currentLesson?.id === lesson.id
                            ? 'bg-primary/10 border border-primary'
                            : 'hover:bg-muted'
                        } ${
                          !completedLessons.has(lesson.id) &&
                          lesson.id !== currentLesson?.id
                            ? 'opacity-50'
                            : ''
                        }`}
                        onClick={() =>
                          navigateToLesson(
                            module.id.toString(),
                            lesson.id.toString()
                          )
                        }
                        title={
                          !completedLessons.has(lesson.id) &&
                          lesson.id !== currentLesson?.id
                            ? accessReason || 'Locked'
                            : undefined
                        }
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <p className='font-medium'>
                              {lesson.orderNumber}. {lesson.title}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {formatDuration(lesson?.duration || 0)}
                            </p>
                          </div>
                          <div className='flex items-center space-x-2'>
                            {completedLessons.has(lesson.id) ? (
                              <CheckCircle className='h-4 w-4 text-green-500' />
                            ) : (
                              <Badge variant='outline' className='text-xs'>
                                Locked
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Export the LessonViewer component directly
export default LessonViewer