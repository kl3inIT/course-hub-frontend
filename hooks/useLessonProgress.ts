import { useState, useEffect, useRef, useCallback } from 'react'
import { progressApi } from '@/services/progress-api'
import { enrollmentApi } from '@/services/enrollment-api'
import {
  LessonProgressDTO,
  UpdateLessonProgressRequestDTO,
} from '@/types/progress'
import { LessonResponseDTO } from '@/types/lesson'

export interface UseLessonProgressProps {
  courseId: string
  currentLesson: LessonResponseDTO | null
  onProgressUpdate?: (progress: LessonProgressDTO) => void
  onLessonComplete?: (lessonId: number) => void
  onOverallProgressUpdate?: (progress: number) => void
}

export interface UseLessonProgressReturn {
  // Progress state
  lessonProgress: LessonProgressDTO | null
  isProgressLoading: boolean
  canAccessLesson: boolean
  accessReason: string | null
  completedLessons: Set<number>
  isAccessChecking: boolean
  displayProgress: number | undefined
  
  // Progress actions
  updateLessonProgress: (currentTime: number, watchedDelta: number) => Promise<void>
  markLessonComplete: (lessonId: number) => void
  updateOverallProgress: () => Promise<void>
  checkLessonAccess: (lessonId: number) => Promise<boolean>
  
  // Utility functions
  formatDuration: (seconds: number) => string
}

export function useLessonProgress({
  courseId,
  currentLesson,
  onProgressUpdate,
  onLessonComplete,
  onOverallProgressUpdate,
}: UseLessonProgressProps): UseLessonProgressReturn {
  // Progress state
  const [lessonProgress, setLessonProgress] = useState<LessonProgressDTO | null>(null)
  const [isProgressLoading, setIsProgressLoading] = useState(true)
  const [canAccessLesson, setCanAccessLesson] = useState(true)
  const [accessReason, setAccessReason] = useState<string | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set())
  const [isAccessChecking, setIsAccessChecking] = useState(true)
  const [displayProgress, setDisplayProgress] = useState<number | undefined>(undefined)
  
  const lastProgressUpdate = useRef<number>(0)
  const progressUpdateInterval = 10000 // Update progress every 10 seconds

  // Load lesson progress when lesson changes
  useEffect(() => {
    const loadLessonProgress = async () => {
      if (!currentLesson) return
      
      setIsProgressLoading(true)
      try {
        const response = await progressApi.getLessonProgress(currentLesson.id)
        setLessonProgress(response.data)
        onProgressUpdate?.(response.data)
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
        onProgressUpdate?.(defaultProgress)
      } finally {
        setIsProgressLoading(false)
      }
    }
    
    loadLessonProgress()
  }, [currentLesson]) // Remove onProgressUpdate from dependencies

  // Check lesson access and load completed lessons
  useEffect(() => {
    const checkLessonAccess = async () => {
      if (!currentLesson || !courseId) return

      try {
        setIsAccessChecking(true)
        // Check if user can access this lesson
        const canAccess = await progressApi.canAccessLesson(currentLesson.id)
        setCanAccessLesson(canAccess)
        setAccessReason(canAccess ? null : 'Complete the previous lesson first')

        // Load completed lessons for the course
        const completedResponse = await progressApi.getCompletedLessons(
          Number(courseId)
        )
        setCompletedLessons(new Set(completedResponse.data))
      } catch (error) {
        console.error('Failed to check lesson access:', error)
        setCanAccessLesson(false)
        setAccessReason('Failed to verify lesson access')
      } finally {
        setIsAccessChecking(false)
      }
    }

    checkLessonAccess()
  }, [currentLesson, courseId])

  // Update lesson progress
  const updateLessonProgress = useCallback(async (currentTime: number, watchedDelta: number) => {
    if (!currentLesson || isProgressLoading) return

    const now = Date.now()
    if (now - lastProgressUpdate.current < progressUpdateInterval) return

    try {
      if (watchedDelta > 0) {
        const updateData: UpdateLessonProgressRequestDTO = {
          currentTime: Math.floor(currentTime).toString(), // Round to integer
          watchedDelta: Math.floor(watchedDelta).toString(), // Round to integer
        }

        const response = await progressApi.updateLessonProgress(
          currentLesson.id,
          updateData
        )
        setLessonProgress(response.data)
        onProgressUpdate?.(response.data)
        lastProgressUpdate.current = now
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
      // Don't update lastProgressUpdate to retry sooner
    }
  }, [currentLesson, isProgressLoading]) // Remove onProgressUpdate from dependencies

  // Mark lesson as completed
  const markLessonComplete = useCallback(async (lessonId: number) => {
    try {
      console.log('🎯 Marking lesson complete:', lessonId)
      
      // Update local state immediately for UI feedback
      setCompletedLessons(prev => {
        const newSet = new Set(prev).add(lessonId)
        console.log('📝 Updated local completed lessons:', Array.from(newSet))
        return newSet
      })
      
      // Refresh completed lessons from backend to ensure sync
      if (courseId) {
        console.log('🔄 Refreshing completed lessons from backend...')
        const completedResponse = await progressApi.getCompletedLessons(Number(courseId))
        console.log('📋 Backend completed lessons:', completedResponse.data)
        setCompletedLessons(new Set(completedResponse.data))
        
        // ✅ NEW: Force re-check overall progress after completion
        setTimeout(() => {
          updateOverallProgress()
        }, 500)
      }
      
      // Trigger completion callback
      console.log('🎉 Triggering completion callback for lesson:', lessonId)
      onLessonComplete?.(lessonId)
    } catch (error) {
      console.error('❌ Failed to sync lesson completion:', error)
      // Keep local state - better to show completed than not
    }
  }, [courseId]) // Keep minimal dependencies to avoid infinite loops

  // Update overall course progress
  const updateOverallProgress = useCallback(async () => {
    try {
      const res = await enrollmentApi.getEnrollmentStatus(courseId)
      if (res.data && typeof res.data.progress === 'number') {
        setDisplayProgress(res.data.progress)
        localStorage.setItem(
          `course-progress-${courseId}`,
          res.data.progress.toString()
        )
        onOverallProgressUpdate?.(res.data.progress)
      }
    } catch (error) {
      console.error('Failed to update overall progress:', error)
    }
  }, [courseId]) // Remove onOverallProgressUpdate from dependencies

  // Check if user can access a specific lesson
  const checkLessonAccess = useCallback(async (lessonId: number): Promise<boolean> => {
    try {
      return await progressApi.canAccessLesson(lessonId)
    } catch (error) {
      console.error('Failed to check lesson access:', error)
      return false
    }
  }, [])

  // Load progress from localStorage/query on mount
  useEffect(() => {
    const stored = localStorage.getItem(`course-progress-${courseId}`)
    if (stored && displayProgress === undefined) {
      setDisplayProgress(Number(stored))
    }
  }, [courseId, displayProgress])

  // Update overall progress when lesson changes
  useEffect(() => {
    if (currentLesson) {
      updateOverallProgress()
    }
  }, [currentLesson]) // Remove updateOverallProgress dependency to avoid cycle

  // Format duration utility
  const formatDuration = useCallback((seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0m'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) return `${h}h ${m}m ${s > 0 ? s + 's' : ''}`.trim()
    if (m > 0) return `${m}m${s > 0 ? ' ' + s + 's' : ''}`
    return `${s}s`
  }, [])

  return {
    // Progress state
    lessonProgress,
    isProgressLoading,
    canAccessLesson,
    accessReason,
    completedLessons,
    isAccessChecking,
    displayProgress,
    
    // Progress actions
    updateLessonProgress,
    markLessonComplete,
    updateOverallProgress,
    checkLessonAccess,
    
    // Utility functions
    formatDuration,
  }
} 