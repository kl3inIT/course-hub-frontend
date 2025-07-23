'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Save,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { RoleGuard } from '@/components/auth/role-guard'
import { courseApi } from '@/services/course-api'
import { moduleApi } from '@/services/module-api'
import { lessonApi } from '@/services/lesson-api'
import {
  CourseCreationRequestDTO,
  CourseCreateUpdateResponseDTO,
  CourseRequestDTO,
} from '@/types/course'
import { toast } from 'sonner'
import { ModuleRequestDTO } from '@/types/module'
import { LessonUploadRequestDTO, LessonConfirmRequestDTO } from '@/types/lesson'
import { useAuth } from '@/context/auth-context'
import { CourseBasicInfoForm } from './course-basic-info-form'
import { CourseThumbnailUploader } from './course-thumbnail-uploader'
import { CourseModulesEditor } from './course-modules-editor'
import { CourseSummaryCard } from './course-summary-card'

interface Module {
  id: string
  title: string
  lessons: Lesson[]
  moduleId?: string
}

interface Lesson {
  id: string
  title: string
  duration: number
  lessonId?: string
  videoFile?: File
}

type Step = 'basic-info' | 'content-structure' | 'final-review'

export function CourseCreationForm() {
  const router = useRouter()
  const { user: _user } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('basic-info')

  // Course basic info state
  const [courseData, setCourseData] = useState<CourseRequestDTO>({
    title: '',
    description: '',
    price: 0,
    level: '',
    categoryCode: 0,
  })
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isValidCourseData, setIsValidCourseData] = useState(false)
  const [_courseErrors, setCourseErrors] = useState<Record<string, string>>({})

  // Course creation state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error' | 'creating' | 'uploading'
  >('idle')
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null)
  const [createdCourse, setCreatedCourse] =
    useState<CourseCreateUpdateResponseDTO | null>(null)

  // Content structure state
  const [modules, setModules] = useState<Module[]>([])

  // State lưu tiến trình upload cho từng lesson
  const [_lessonUploadProgress, setLessonUploadProgress] = useState<
    Record<string, number>
  >({})

  const getStepProgress = useCallback(() => {
    switch (currentStep) {
      case 'basic-info':
        return 33
      case 'content-structure':
        return 66
      case 'final-review':
        return 100
      default:
        return 0
    }
  }, [currentStep])

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

  const handleCreateCourse = async () => {
    if (!isValidCourseData) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('creating')

    try {
      const courseCreationData: CourseCreationRequestDTO = {
        title: courseData.title.trim(),
        description: courseData.description.trim(),
        price: courseData.price,
        level: courseData.level,
        categoryCode: courseData.categoryCode,
      }

      const createResponse = await courseApi.createCourse(courseCreationData)
      const createdCourse = createResponse.data
      setCreatedCourseId(createdCourse.id)
      setCreatedCourse(createdCourse)

      if (thumbnailFile) {
        setSubmitStatus('uploading')
        await courseApi.uploadThumbnail(
          createdCourse.id.toString(),
          thumbnailFile
        )
      }

      setCurrentStep('content-structure')
      setSubmitStatus('success')
      toast.success('Course created successfully!')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred'
      toast.error(errorMessage)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModulesChange = useCallback((newModules: Module[]) => {
    setModules(newModules)
  }, [])

  const handleFinalizeCourse = async () => {
    if (!createdCourseId) return

    try {
      setIsSubmitting(true)
      // Create modules and lessons
      for (const module of modules) {
        // Chỉ gửi title
        const moduleData: ModuleRequestDTO = {
          title: module.title,
        }
        const moduleResponse = await moduleApi.createModule(
          createdCourseId.toString(),
          moduleData
        )
        const createdModule = moduleResponse.data
        module.moduleId = createdModule.id.toString()

        // Create lessons
        for (const lesson of module.lessons) {
          if (lesson.videoFile) {
            const prepareUploadData: LessonUploadRequestDTO = {
              title: lesson.title,
              fileName: lesson.videoFile?.name ?? '',
              fileType: lesson.videoFile?.type ?? '',
            }
            const prepareResponse = await lessonApi.prepareUpload(
              createdModule.id.toString(),
              prepareUploadData
            )
            const { preSignedPutUrl, lessonId } = prepareResponse.data

            // Upload video with progress
            await new Promise<void>((resolve, reject) => {
              if (!lesson.videoFile) return reject(new Error('No video file'))
              const xhr = new XMLHttpRequest()
              xhr.open('PUT', preSignedPutUrl, true)
              xhr.setRequestHeader('Content-Type', lesson.videoFile.type)
              xhr.upload.onprogress = event => {
                if (event.lengthComputable) {
                  setLessonUploadProgress(prev => ({
                    ...prev,
                    [lesson.id]: Math.round((event.loaded / event.total) * 100),
                  }))
                }
              }
              xhr.onload = () => {
                setLessonUploadProgress(prev => ({ ...prev, [lesson.id]: 100 }))
                resolve()
              }
              xhr.onerror = () => {
                setLessonUploadProgress(prev => ({ ...prev, [lesson.id]: 0 }))
                reject(new Error('Upload failed'))
              }
              xhr.send(lesson.videoFile)
            })

            const completeData: LessonConfirmRequestDTO = {
              duration: lesson.duration,
            }
            const completeResponse = await lessonApi.completeUpload(
              lessonId.toString(),
              completeData
            )
            lesson.lessonId = completeResponse.data.id.toString()
          }
        }
      }
      toast.success('Course structure saved! Redirecting to course editor...')
      setTimeout(() => {
        router.push(`/manager/courses/${createdCourseId}/edit`)
      }, 1500)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred'
      toast.error(errorMessage)
      toast.error('Failed to save course structure')
    } finally {
      setIsSubmitting(false)
      setLessonUploadProgress({})
    }
  }

  const getStepTitle = useCallback(() => {
    switch (currentStep) {
      case 'basic-info':
        return 'Course Information'
      case 'content-structure':
        return 'Content Structure'
      case 'final-review':
        return 'Final Review'
      default:
        return 'Create Course'
    }
  }, [currentStep])

  return (
    <RoleGuard allowedRoles={['manager', 'admin']}>
      <div className='space-y-8'>
        {/* Progress Header */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold'>{getStepTitle()}</h1>
              <p className='text-muted-foreground'>
                {currentStep === 'basic-info' &&
                  'Provide the basic details about your course'}
                {currentStep === 'content-structure' &&
                  'Structure your course with modules and lessons'}
                {currentStep === 'final-review' &&
                  'Review and finalize your course'}
              </p>
            </div>
            {createdCourse && (
              <div className='text-right'>
                <p className='text-sm text-muted-foreground'>
                  Course ID: {createdCourse.id}
                </p>
                <p className='font-medium'>{createdCourse.title}</p>
              </div>
            )}
          </div>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>
                Step{' '}
                {currentStep === 'basic-info'
                  ? '1'
                  : currentStep === 'content-structure'
                    ? '2'
                    : '3'}{' '}
                of 3
              </span>
              <span>{getStepProgress()}% Complete</span>
            </div>
            <Progress value={getStepProgress()} className='h-2' />
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'basic-info' && (
          <div className='space-y-6'>
            {/* Course Basic Information Form */}
            <CourseBasicInfoForm
              initialData={courseData}
              onDataChange={handleCourseDataChange}
              onValidationChange={handleValidationChange}
            />

            {/* Course Thumbnail Uploader */}
            <CourseThumbnailUploader
              value={thumbnailFile}
              onChange={handleThumbnailChange}
            />

            {/* Submit Status */}
            {submitStatus === 'success' && (
              <Alert className='border-green-500 bg-green-50'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                <AlertDescription className='text-green-800'>
                  Course created successfully! You can now add modules and
                  lessons.
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === 'error' && (
              <Alert className='border-red-500 bg-red-50'>
                <AlertCircle className='h-4 w-4 text-red-600' />
                <AlertDescription className='text-red-800'>
                  Failed to create course. Please check the form and try again.
                </AlertDescription>
              </Alert>
            )}

            {(submitStatus === 'creating' || submitStatus === 'uploading') && (
              <Alert className='border-blue-500 bg-blue-50'>
                <Info className='h-4 w-4 text-blue-600' />
                <AlertDescription className='text-blue-800'>
                  {submitStatus === 'creating'
                    ? 'Creating your course...'
                    : 'Uploading thumbnail...'}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className='flex gap-4'>
              <Button
                type='button'
                onClick={handleCreateCourse}
                disabled={isSubmitting || !isValidCourseData}
                className='flex-1 md:flex-none md:min-w-[200px]'
              >
                {isSubmitting ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                    {submitStatus === 'creating'
                      ? 'Creating course...'
                      : 'Uploading thumbnail...'}
                  </>
                ) : (
                  <>
                    <ArrowRight className='h-4 w-4 mr-2' />
                    Create Course & Continue
                  </>
                )}
              </Button>
              <Button
                type='button'
                variant='outline'
                disabled={isSubmitting}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Content Structure Step */}
        {currentStep === 'content-structure' && createdCourse && (
          <div className='space-y-6'>
            {/* Course Summary */}
            <CourseSummaryCard
              course={{
                title: createdCourse.title,
                description: createdCourse.description,
                price: createdCourse.price,
                level: createdCourse.level,
                category: createdCourse.category,
                thumbnailUrl: thumbnailFile || createdCourse.thumbnailUrl,
              }}
            />

            {/* Modules Editor */}
            <CourseModulesEditor
              modules={modules}
              onModulesChange={handleModulesChange}
              courseId={createdCourseId?.toString()}
            />

            {/* Navigation Buttons */}
            <div className='flex gap-4'>
              <Button
                variant='outline'
                onClick={() => setCurrentStep('basic-info')}
                disabled={isSubmitting}
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Course Info
              </Button>
              <Button
                onClick={handleFinalizeCourse}
                disabled={isSubmitting}
                className='flex-1 md:flex-none'
              >
                {isSubmitting ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    Complete Course Creation
                  </>
                )}
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  router.push(`/manager/courses/${createdCourseId}/edit`)
                }
                disabled={isSubmitting}
              >
                Skip & Go to Editor
              </Button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
