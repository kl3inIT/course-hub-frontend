'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { CheckCircle, ChevronDown, ChevronRight, Lock } from 'lucide-react'
import { CourseDetailsResponseDTO } from '@/types/course'
import { ModuleResponseDTO } from '@/types/module'
import { LessonResponseDTO } from '@/types/lesson'
import { progressApi } from '@/services/progress-api'

interface CourseSidebarProps {
  course: CourseDetailsResponseDTO
  currentLesson: LessonResponseDTO | null
  moduleLessons: Record<string, LessonResponseDTO[]>
  expandedModules: Set<string>
  completedLessons: Set<number>
  accessReason?: string | null
  onLessonClick: (moduleId: string, lessonId: string) => void
  onModuleToggle: (moduleId: string) => void
  formatDuration: (seconds: number) => string
}

export function CourseSidebar({
  course,
  currentLesson,
  moduleLessons,
  expandedModules,
  completedLessons,
  accessReason,
  onLessonClick,
  onModuleToggle,
  formatDuration,
}: CourseSidebarProps) {
  // ✅ NEW: Track lesson accessibility from backend API
  const [lessonAccess, setLessonAccess] = useState<Record<number, boolean>>({})
  const [checkingAccess, setCheckingAccess] = useState(false)

  // ✅ NEW: Check access for all lessons when completed lessons change
  useEffect(() => {
    const checkAllLessonsAccess = async () => {
      if (!course?.modules || checkingAccess) return

      setCheckingAccess(true)
      console.log('🔍 Checking access for all lessons...')

      try {
        const accessPromises: Promise<{
          lessonId: number
          canAccess: boolean
        }>[] = []

        // Collect all lessons
        const allLessons: LessonResponseDTO[] = []
        course.modules.forEach(module => {
          const lessons = moduleLessons[module.id] || []
          allLessons.push(...lessons)
        })

        // Check access for each lesson
        for (const lesson of allLessons) {
          accessPromises.push(
            progressApi
              .canAccessLesson(lesson.id)
              .then(canAccess => ({ lessonId: lesson.id, canAccess }))
              .catch(error => {
                console.error(
                  `Failed to check access for lesson ${lesson.id}:`,
                  error
                )
                return { lessonId: lesson.id, canAccess: false }
              })
          )
        }

        const results = await Promise.all(accessPromises)
        const newAccessMap: Record<number, boolean> = {}

        results.forEach(({ lessonId, canAccess }) => {
          newAccessMap[lessonId] = canAccess
        })

        console.log('🔐 Lesson access results:', newAccessMap)
        setLessonAccess(newAccessMap)
      } catch (error) {
        console.error('❌ Failed to check lessons access:', error)
      } finally {
        setCheckingAccess(false)
      }
    }

    checkAllLessonsAccess()
  }, [completedLessons, course?.modules, moduleLessons]) // Re-check when completed lessons change

  // ✅ FIXED: Use backend API to check real accessibility
  const isLessonAccessible = (lesson: LessonResponseDTO) => {
    // Current lesson is always accessible (already loaded)
    if (lesson.id === currentLesson?.id) return true

    // Check backend API result
    return lessonAccess[lesson.id] === true
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Course Content</CardTitle>
          <CardDescription>
            {course.totalModules} modules • {course.totalLessons} lessons
            {checkingAccess && (
              <span className='ml-2 text-xs'>(Checking access...)</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          {course.modules.map(module => (
            <Collapsible
              key={module.id}
              open={expandedModules.has(module.id.toString())}
              onOpenChange={() => onModuleToggle(module.id.toString())}
            >
              <CollapsibleTrigger asChild>
                <div className='flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors'>
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
                {moduleLessons[module.id]?.map(lesson => {
                  const isAccessible = isLessonAccessible(lesson)
                  const isCurrent = currentLesson?.id === lesson.id
                  const isCompleted = completedLessons.has(lesson.id)

                  return (
                    <div
                      key={lesson.id}
                      className={`p-2 rounded cursor-pointer transition-colors text-sm ${
                        isCurrent
                          ? 'bg-primary/10 border border-primary'
                          : isAccessible
                            ? 'hover:bg-muted'
                            : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (isAccessible) {
                          console.log(
                            '🔗 Clicking accessible lesson:',
                            lesson.id
                          )
                          onLessonClick(
                            module.id.toString(),
                            lesson.id.toString()
                          )
                        } else {
                          console.log(
                            '🔒 Lesson not accessible:',
                            lesson.id,
                            'Access status:',
                            lessonAccess[lesson.id]
                          )
                        }
                      }}
                      title={
                        !isAccessible && !isCurrent
                          ? `Complete previous lessons first. Access status: ${lessonAccess[lesson.id] === undefined ? 'Checking...' : 'Denied'}`
                          : undefined
                      }
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium truncate'>
                            {lesson.orderNumber}. {lesson.title}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {formatDuration(lesson?.duration || 0)}
                          </p>
                        </div>

                        <div className='flex items-center space-x-2 ml-2'>
                          {isCompleted ? (
                            <CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
                          ) : isCurrent ? (
                            <Badge variant='outline' className='text-xs'>
                              Current
                            </Badge>
                          ) : !isAccessible ? (
                            <Lock className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                          ) : (
                            <Badge variant='secondary' className='text-xs'>
                              Available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
