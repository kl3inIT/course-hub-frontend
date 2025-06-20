import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { courseApi } from '@/services/course-api'
import { lessonApi } from '@/services/lesson-api'
import { enrollmentApi } from '@/services/enrollment-api'
import { CourseDetailsResponseDTO } from '@/types/course'
import { ModuleResponseDTO } from '@/types/module'
import { LessonResponseDTO } from '@/types/lesson'

export interface UseCourseDataProps {
  courseId: string
  lessonId: string
  userId?: string | null
}

export interface UseCourseDataReturn {
  // Data state
  course: CourseDetailsResponseDTO | null
  currentModule: ModuleResponseDTO | null
  currentLesson: LessonResponseDTO | null
  moduleLessons: Record<string, LessonResponseDTO[]>
  expandedModules: Set<string>
  
  // Loading/error state
  loading: boolean
  error: string | null
  
  // Enrollment state
  isEnrolled: boolean | null
  isCheckingEnrollment: boolean
  
  // Video URL
  videoUrl: string | undefined
  
  // Actions
  toggleModuleExpansion: (moduleId: string) => void
  getNextLesson: () => { module: ModuleResponseDTO; lesson: LessonResponseDTO } | null
  getPreviousLesson: () => { module: ModuleResponseDTO; lesson: LessonResponseDTO } | null
  refetchCourseData: () => Promise<void>
}

export function useCourseData({ 
  courseId, 
  lessonId, 
  userId 
}: UseCourseDataProps): UseCourseDataReturn {
  // Data state
  const [course, setCourse] = useState<CourseDetailsResponseDTO | null>(null)
  const [currentModule, setCurrentModule] = useState<ModuleResponseDTO | null>(null)
  const [currentLesson, setCurrentLesson] = useState<LessonResponseDTO | null>(null)
  const [moduleLessons, setModuleLessons] = useState<Record<string, LessonResponseDTO[]>>({})
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  
  // Loading/error state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Enrollment state
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null)
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true)
  
  // Video URL
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined)
  
  const router = useRouter()
  
  // Use a ref for stable router access
  const routerRef = useRef(router)
  routerRef.current = router

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!courseId || !userId) {
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
  }, [courseId, userId])

  // Fetch course data and navigate to appropriate lesson
  const fetchCourseData = useCallback(async () => {
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
            routerRef.current.replace(`/learn/${courseId}/${firstLesson.id}`)
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
  }, [courseId, lessonId])

  // Fetch video URL when lesson changes
  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!currentLesson) return
      
      try {
        const response = await lessonApi.getLessonUrl(
          currentLesson.id.toString()
        )
        setVideoUrl(response)
      } catch (error) {
        console.error('Failed to load video content:', error)
        setVideoUrl(undefined)
      }
    }
    
    fetchVideoUrl()
  }, [currentLesson])

  // Initial data fetch
  useEffect(() => {
    fetchCourseData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId]) // Depend on courseId and lessonId directly instead of fetchCourseData

  // Toggle module expansion and load lessons
  const toggleModuleExpansion = useCallback(async (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
      // Fetch lessons when module is expanded
      if (!moduleLessons[moduleId]) {
        try {
          const lessonsResponse = await lessonApi.getLessonsByModuleId(moduleId)
          setModuleLessons(prev => ({
            ...prev,
            [moduleId]: lessonsResponse.data,
          }))
        } catch (err) {
          console.error('Failed to load module lessons:', err)
        }
      }
    }
    
    setExpandedModules(newExpanded)
  }, [expandedModules, moduleLessons])

  // Get next lesson
  const getNextLesson = useCallback(() => {
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
  }, [course, currentModule, currentLesson, moduleLessons])

  // Get previous lesson
  const getPreviousLesson = useCallback(() => {
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
  }, [course, currentModule, currentLesson, moduleLessons])

  return {
    // Data state
    course,
    currentModule,
    currentLesson,
    moduleLessons,
    expandedModules,
    
    // Loading/error state
    loading,
    error,
    
    // Enrollment state
    isEnrolled,
    isCheckingEnrollment,
    
    // Video URL
    videoUrl,
    
    // Actions
    toggleModuleExpansion,
    getNextLesson,
    getPreviousLesson,
    refetchCourseData: fetchCourseData,
  }
} 