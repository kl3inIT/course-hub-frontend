import { useState, useEffect } from 'react'
import { courseApi } from '@/services/course-api'

export interface UseCourseMeta {
  courseLevels: Record<string, string>
  courseStatuses: Record<string, string>
  isLoadingLevels: boolean
  isLoadingStatuses: boolean
  levelsError: string | null
  statusesError: string | null
  refreshLevels: () => Promise<void>
  refreshStatuses: () => Promise<void>
}

export function useCourseMeta(): UseCourseMeta {
  const [courseLevels, setCourseLevels] = useState<Record<string, string>>({})
  const [courseStatuses, setCourseStatuses] = useState<Record<string, string>>({})
  const [isLoadingLevels, setIsLoadingLevels] = useState(true)
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true)
  const [levelsError, setLevelsError] = useState<string | null>(null)
  const [statusesError, setStatusesError] = useState<string | null>(null)

  const loadLevels = async () => {
    try {
      setIsLoadingLevels(true)
      setLevelsError(null)
      const response = await courseApi.getCourseLevels()
      setCourseLevels(response.data || {})
    } catch (error) {
      console.error('Failed to load course levels:', error)
      setLevelsError('Failed to load course levels')
      // Fallback to hardcoded values
      setCourseLevels({
        BEGINNER: 'Beginner',
        INTERMEDIATE: 'Intermediate',
        ADVANCED: 'Advanced',
      })
    } finally {
      setIsLoadingLevels(false)
    }
  }

  const loadStatuses = async () => {
    try {
      setIsLoadingStatuses(true)
      setStatusesError(null)
      const response = await courseApi.getCourseStatuses()
      setCourseStatuses(response.data || {})
    } catch (error) {
      console.error('Failed to load course statuses:', error)
      setStatusesError('Failed to load course statuses')
      // Fallback to hardcoded values
      setCourseStatuses({
        DRAFT: 'Draft',
        PUBLISHED: 'Published',
        ARCHIVED: 'Archived',
      })
    } finally {
      setIsLoadingStatuses(false)
    }
  }

  useEffect(() => {
    loadLevels()
    loadStatuses()
  }, [])

  return {
    courseLevels,
    courseStatuses,
    isLoadingLevels,
    isLoadingStatuses,
    levelsError,
    statusesError,
    refreshLevels: loadLevels,
    refreshStatuses: loadStatuses,
  }
} 