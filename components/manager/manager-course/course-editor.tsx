'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { RoleGuard } from '@/components/auth/role-guard'
import { courseApi } from '@/services/course-api'
import { moduleApi } from '@/services/module-api'
import { lessonApi } from '@/services/lesson-api'
import { categoryApi } from '@/services/category-api'
import {
  CourseUpdateRequestDTO,
  CourseCreateUpdateResponseDTO,
  CourseRequestDTO,
  CourseDetailsResponseDTO,
} from '@/types/course'
import { ModuleResponseDTO } from '@/types/module'
import { LessonResponseDTO } from '@/types/lesson'
import { toast } from 'sonner'
import { CourseBasicInfoForm } from './course-basic-info-form'
import { CourseThumbnailUploader } from './course-thumbnail-uploader'
import { CourseSummaryCard } from './course-summary-card'
import { CourseModulesEditor } from './course-modules-editor'

interface CourseEditorProps {
  courseId: string
}

export function CourseEditor({ courseId }: CourseEditorProps) {
  const router = useRouter()
  const initializedRef = useRef(false)

  // Loading states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])

  // Course data
  const [originalCourse, setOriginalCourse] =
    useState<CourseDetailsResponseDTO | null>(null)
  const [courseData, setCourseData] = useState<CourseRequestDTO>({
    title: '',
    description: '',
    price: 0,
    level: '',
    categoryCode: 0,
  })
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(
    null
  )

  // Form validation
  const [isValidCourseData, setIsValidCourseData] = useState(false)
  const [courseErrors, setCourseErrors] = useState<Record<string, string>>({})

  // Save status
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'success' | 'error'
  >('idle')

  // Content structure
  const [modules, setModules] = useState<any[]>([])
  const [originalModules, setOriginalModules] = useState<any[]>([])
  const [loadingModules, setLoadingModules] = useState(false)
  const [savingContent, setSavingContent] = useState(false)

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load categories and course details in parallel
        const [courseResponse, categoriesResponse] = await Promise.all([
          courseApi.getCourseDetails(courseId),
          categoryApi.getAllCategories(),
        ])

        const course = courseResponse.data
        const categoriesList = categoriesResponse.data.content || []

        setOriginalCourse(course)
        setCurrentThumbnailUrl(course.thumbnailUrl)
        setCategories(categoriesList)

        // Find categoryCode by category name
        const categoryCode =
          categoriesList.find(cat => cat.name === course.category)?.id || 0

        // Convert to form data - only set once to avoid re-renders
        if (!initializedRef.current) {
          setCourseData({
            title: course.title,
            description: course.description,
            price: course.price,
            level: course.level,
            categoryCode: categoryCode,
          })
          initializedRef.current = true
        }
      } catch (error) {
        console.error('Failed to load course:', error)
        setError('Failed to load course details')
        toast.error('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      loadCourse()
    }
  }, [courseId])

  const handleCourseDataChange = useCallback((data: CourseRequestDTO) => {
    setCourseData(data)
  }, [])

  const handleValidationChange = useCallback(
    (isValid: boolean, errors: Record<string, string>) => {
      setIsValidCourseData(isValid)
      setCourseErrors(errors)
    },
    []
  )

  const handleThumbnailChange = useCallback((file: File | null) => {
    setThumbnailFile(file)
  }, [])

  const loadModules = useCallback(async () => {
    if (!courseId) return
    try {
      setLoadingModules(true)
      // Load modules first
      const modulesResponse = await moduleApi.getModulesByCourseId(courseId)
      const modules = modulesResponse.data || []
      // Load lessons for each module
      const modulesWithLessons = await Promise.all(
        modules.map(async module => {
          try {
            const lessonsResponse = await lessonApi.getLessonsByModuleId(
              module.id.toString()
            )
            const lessons = (lessonsResponse.data || []).map(lesson => ({
              id: lesson.id.toString(),
              title: lesson.title,
              duration: lesson.duration || 0,
              lessonId: lesson.id.toString(),
            }))
            return {
              id: module.id.toString(),
              title: module.title,
              lessons: lessons,
              moduleId: module.id.toString(),
            }
          } catch (error) {
            return {
              id: module.id.toString(),
              title: module.title,
              lessons: [],
              moduleId: module.id.toString(),
            }
          }
        })
      )
      setModules(modulesWithLessons)
      // Deep clone for original snapshot
      setOriginalModules(JSON.parse(JSON.stringify(modulesWithLessons)))
    } catch (error) {
      toast.error('Failed to load course modules')
      setModules([])
      setOriginalModules([])
    } finally {
      setLoadingModules(false)
    }
  }, [courseId])

  // Only update state, do not call API
  const handleModulesChange = useCallback((newModules: any[]) => {
    setModules(newModules)
  }, [])

  // Best practice: Only call API on Save Content
  const handleSaveContentStructure = async () => {
    if (!courseId) return
    setSavingContent(true)
    try {
      // 1. Build lookup maps for original and current
      const origModulesMap = new Map(
        originalModules.map((m: any) => [m.moduleId, m])
      )
      const currModulesMap = new Map(modules.map((m: any) => [m.moduleId, m]))
      // 2. Delete removed modules
      for (const origModule of originalModules) {
        if (!modules.find((m: any) => m.moduleId === origModule.moduleId)) {
          await moduleApi.deleteModule(origModule.moduleId)
        }
      }
      // 3. Create new modules
      for (const currModule of modules) {
        if (!currModule.moduleId) {
          // New module
          const res = await moduleApi.createModule(courseId, {
            title: currModule.title,
          })
          currModule.moduleId = res.data.id.toString()
          // Also update id for consistency
          currModule.id = currModule.moduleId
        } else {
          // Update title if changed
          const orig = origModulesMap.get(currModule.moduleId)
          if (orig && orig.title !== currModule.title) {
            await moduleApi.updateModule(currModule.moduleId, {
              title: currModule.title,
            })
          }
        }
      }
      // 4. Handle lessons for each module
      for (const currModule of modules) {
        const origModule: any =
          originalModules.find(
            (m: any) => m.moduleId === currModule.moduleId
          ) || {}
        const origTitle = 'title' in origModule ? origModule.title : ''
        const origLessonsArr = Array.isArray(origModule.lessons)
          ? origModule.lessons
          : []
        const origLessonsMap = new Map(
          origLessonsArr.map((l: any) => [l.lessonId, l])
        )
        // Delete removed lessons
        for (const origLesson of origLessonsArr) {
          if (
            !currModule.lessons.find(
              (l: any) => l.lessonId === origLesson.lessonId
            )
          ) {
            await lessonApi.deleteLesson(origLesson.lessonId)
          }
        }
        // Create/update lessons
        for (const currLesson of currModule.lessons) {
          if (!currLesson.lessonId) {
            // New lesson
            const prepareUploadData = {
              title: currLesson.title,
              fileName: currLesson.videoFile?.name ?? '',
              fileType: currLesson.videoFile?.type ?? '',
            }
            const prepareResponse = await lessonApi.prepareUpload(
              currModule.moduleId,
              prepareUploadData
            )
            const { preSignedPutUrl, lessonId } = prepareResponse.data
            // Upload video if present
            if (currLesson.videoFile) {
              await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('PUT', preSignedPutUrl, true)
                xhr.setRequestHeader('Content-Type', currLesson.videoFile.type)
                xhr.onload = () => resolve()
                xhr.onerror = () => reject(new Error('Upload failed'))
                xhr.send(currLesson.videoFile)
              })
            }
            // Confirm upload
            await lessonApi.completeUpload(lessonId.toString(), {
              duration: currLesson.duration,
            })
            currLesson.lessonId = lessonId.toString()
            currLesson.id = lessonId.toString()
          } else {
            // Existing lesson - check if video needs replacement
            if (
              currLesson.videoFile &&
              (currLesson as any).needsVideoReplacement
            ) {
              // Replace existing video
              const updateVideoData = {
                title: currLesson.title,
                fileName: currLesson.videoFile.name,
                fileType: currLesson.videoFile.type,
              }
              const updateResponse = await lessonApi.updateLessonVideo(
                currLesson.lessonId,
                updateVideoData
              )
              const { preSignedPutUrl } = updateResponse.data

              // Upload new video
              await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('PUT', preSignedPutUrl, true)
                xhr.setRequestHeader('Content-Type', currLesson.videoFile.type)
                xhr.onload = () => resolve()
                xhr.onerror = () => reject(new Error('Upload failed'))
                xhr.send(currLesson.videoFile)
              })

              // Confirm upload with new duration
              await lessonApi.completeUpload(currLesson.lessonId, {
                duration: currLesson.duration,
              })
            } else {
              // Update only metadata if changed
              const orig = origLessonsMap.get(currLesson.lessonId)
              if (
                orig &&
                typeof orig === 'object' &&
                orig !== null &&
                (('title' in orig ? orig.title : '') !== currLesson.title ||
                  ('duration' in orig ? orig.duration : 0) !==
                    currLesson.duration)
              ) {
                await lessonApi.updateLesson(currLesson.lessonId, {
                  title: currLesson.title,
                  duration: currLesson.duration,
                })
              }
            }
          }
        }
        // Update module title if changed
        if (currModule.moduleId && origTitle !== currModule.title) {
          await moduleApi.updateModule(currModule.moduleId, {
            title: currModule.title,
          })
        }
      }
      toast.success('Course content updated successfully!')
      // Reload modules and update originalModules
      await loadModules()
    } catch (error) {
      toast.error('Failed to save course content')
    } finally {
      setSavingContent(false)
    }
  }

  const handleSaveCourse = async () => {
    if (!isValidCourseData) {
      toast.error('Please fix the errors in the form')
      return
    }

    setSaving(true)
    setSaveStatus('saving')

    try {
      // Prepare update data - only include changed fields
      const updateData: CourseUpdateRequestDTO = {}

      if (courseData.title !== originalCourse?.title) {
        updateData.title = courseData.title.trim()
      }
      if (courseData.description !== originalCourse?.description) {
        updateData.description = courseData.description.trim()
      }
      if (courseData.price !== originalCourse?.price) {
        updateData.price = courseData.price
      }
      if (courseData.level !== originalCourse?.level) {
        updateData.level = courseData.level
      }
      if (courseData.categoryCode !== 0) {
        // Only update if a new category is selected
        updateData.categoryCode = courseData.categoryCode
      }

      // Update course basic info if there are changes
      if (Object.keys(updateData).length > 0) {
        const updateResponse = await courseApi.updateCourse(
          courseId,
          updateData
        )
        console.log('Course updated:', updateResponse.data)
      }

      // Upload new thumbnail if changed
      if (thumbnailFile) {
        await courseApi.uploadThumbnail(courseId, thumbnailFile)
        setCurrentThumbnailUrl(URL.createObjectURL(thumbnailFile))
        setThumbnailFile(null)
      }

      setSaveStatus('success')
      toast.success('Course updated successfully!')

      // Reload course data to reflect changes
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Failed to save course:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update course'
      toast.error(errorMessage)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    if (!originalCourse) return false

    return (
      courseData.title !== originalCourse.title ||
      courseData.description !== originalCourse.description ||
      courseData.price !== originalCourse.price ||
      courseData.level !== originalCourse.level ||
      thumbnailFile !== null ||
      courseData.categoryCode !== 0 // New category selected
    )
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

  if (error || !originalCourse) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <div className='text-6xl'>⚠️</div>
          <h3 className='text-xl font-semibold'>Error Loading Course</h3>
          <p className='text-muted-foreground max-w-md mx-auto'>{error}</p>
          <Button onClick={() => router.back()} variant='outline'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['manager', 'admin']}>
      <div className='space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='outline'
              onClick={() => router.push('/manager/courses')}
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Courses
            </Button>
            <div>
              <h1 className='text-3xl font-bold'>Edit Course</h1>
              <p className='text-muted-foreground'>
                Update course information and content
              </p>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-sm text-muted-foreground'>
              Course ID: {originalCourse.id}
            </p>
            <p className='font-medium'>{originalCourse.title}</p>
          </div>
        </div>

        {/* Course Summary */}
        <CourseSummaryCard
          course={{
            title: courseData.title || originalCourse.title,
            description: courseData.description || originalCourse.description,
            price: courseData.price || originalCourse.price,
            level: courseData.level || originalCourse.level,
            category: originalCourse.category,
            thumbnailUrl: thumbnailFile
              ? URL.createObjectURL(thumbnailFile)
              : currentThumbnailUrl,
          }}
        />

        {/* Edit Tabs */}
        <Tabs
          defaultValue='basic-info'
          className='w-full'
          onValueChange={value => {
            if (
              value === 'content' &&
              modules.length === 0 &&
              !loadingModules
            ) {
              loadModules()
            }
          }}
        >
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='basic-info'>Basic Information</TabsTrigger>
            <TabsTrigger value='content'>Content & Structure</TabsTrigger>
            <TabsTrigger value='settings'>Settings</TabsTrigger>
          </TabsList>

          <TabsContent value='basic-info' className='space-y-6'>
            {/* Course Basic Information Form */}
            <CourseBasicInfoForm
              initialData={courseData}
              onDataChange={handleCourseDataChange}
              onValidationChange={handleValidationChange}
              isEditing={true}
            />

            {/* Course Thumbnail Uploader */}
            <CourseThumbnailUploader
              value={thumbnailFile || currentThumbnailUrl}
              onChange={handleThumbnailChange}
            />

            {/* Save Status */}
            {saveStatus === 'success' && (
              <Alert className='border-green-500 bg-green-50'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                <AlertDescription className='text-green-800'>
                  Course updated successfully!
                </AlertDescription>
              </Alert>
            )}

            {saveStatus === 'error' && (
              <Alert className='border-red-500 bg-red-50'>
                <AlertCircle className='h-4 w-4 text-red-600' />
                <AlertDescription className='text-red-800'>
                  Failed to update course. Please check the form and try again.
                </AlertDescription>
              </Alert>
            )}

            {saveStatus === 'saving' && (
              <Alert className='border-blue-500 bg-blue-50'>
                <Info className='h-4 w-4 text-blue-600' />
                <AlertDescription className='text-blue-800'>
                  Saving changes...
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className='flex gap-4'>
              <Button
                onClick={handleSaveCourse}
                disabled={saving || !isValidCourseData || !hasChanges()}
                className='flex-1 md:flex-none md:min-w-[200px]'
              >
                {saving ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>

              <Button
                variant='outline'
                onClick={() => router.push(`/manager/courses/${courseId}`)}
                disabled={saving}
              >
                View Course Details
              </Button>
            </div>
          </TabsContent>

          <TabsContent value='content' className='space-y-6'>
            {loadingModules ? (
              <div className='flex items-center justify-center py-12'>
                <div className='flex flex-col items-center space-y-4'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                  <p className='text-muted-foreground'>
                    Loading course modules...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold'>Course Content</h3>
                    <p className='text-muted-foreground'>
                      Manage your course modules and lessons
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <Button onClick={loadModules} variant='outline'>
                      Refresh Content
                    </Button>
                    <Button
                      onClick={handleSaveContentStructure}
                      disabled={savingContent}
                    >
                      {savingContent ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className='h-4 w-4 mr-2' />
                          Save Content
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <CourseModulesEditor
                  modules={modules}
                  onModulesChange={handleModulesChange}
                  isEditing={true}
                  courseId={courseId}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value='settings' className='space-y-6'>
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold mb-2'>Course Settings</h3>
              <p className='text-muted-foreground mb-4'>
                Advanced course settings will be implemented here
              </p>
              <Button variant='outline' disabled>
                Coming Soon
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
