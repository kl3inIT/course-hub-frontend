'use client'

import type React from 'react'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  ImageIcon,
  DollarSign,
  BookOpen,
  Save,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Tags,
  ArrowRight,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  PlayCircle,
  Video,
} from 'lucide-react'
import { RoleGuard } from '@/components/auth/role-guard'
import { courseApi } from '@/services/course-api'
import { categoryApi } from '@/services/category-api'
import { moduleApi } from '@/services/module-api'
import { lessonApi } from '@/services/lesson-api'
import { CourseRequestDTO, CourseResponseDTO } from '@/types/course'
import { CategoryResponseDTO } from '@/types/category'
import { toast } from 'sonner'
import { ModuleRequestDTO } from '@/types/module'
import { LessonUploadRequestDTO, LessonConfirmRequestDTO } from '@/types/lesson'
import { useAuth } from '@/context/auth-context'

interface FormData {
  title: string
  price: string
  description: string
  thumbnail: File | null
  level: string
  category: string
}

interface FormErrors {
  title?: string
  price?: string
  description?: string
  thumbnail?: string
  level?: string
  category?: string
}

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
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('basic-info')
  const [formData, setFormData] = useState<FormData>({
    title: '',
    price: '',
    description: '',
    thumbnail: null,
    level: '',
    category: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error' | 'creating' | 'uploading'
  >('idle')
  const [imagePreview, setImagePreview] = useState<string>('')
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null)
  const [createdCourse, setCreatedCourse] = useState<CourseResponseDTO | null>(
    null
  )
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Content structure state
  const [modules, setModules] = useState<Module[]>([])
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // State lưu tiến trình upload cho từng lesson
  const [lessonUploadProgress, setLessonUploadProgress] = useState<
    Record<string, number>
  >({})

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await categoryApi.getAllCategories()
        setCategories(response.data.content || [])
      } catch (error) {
        console.error('Failed to load categories:', error)
        toast.error('Failed to load categories')
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  const getStepProgress = () => {
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
  }

  const formatPrice = (value: string): string => {
    const num = Number.parseFloat(value)
    if (isNaN(num)) return ''
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const validateField = (
    name: keyof FormData,
    value: any
  ): string | undefined => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Course title is required'
        if (value.length < 5) return 'Title must be at least 5 characters'
        if (value.length > 100) return 'Title must be 100 characters or less'
        break
      case 'price':
        if (!value) return 'Price is required'
        const price = Number.parseFloat(value)
        if (isNaN(price) || price <= 0) return 'Price must be greater than 0'
        if (!/^\d+(\.\d{1,2})?$/.test(value))
          return 'Price must have at most 2 decimal places'
        break
      case 'description':
        if (!value.trim()) return 'Course description is required'
        if (value.length < 20)
          return 'Description must be at least 20 characters'
        if (value.length > 2000)
          return 'Description must be 2000 characters or less'
        break
      case 'thumbnail':
        if (!value) return 'Course thumbnail is required'
        break
      case 'level':
        if (!value) return 'Course level is required'
        break
      case 'category':
        if (!value) return 'Course category is required'
        break
    }
    return undefined
  }

  const handleInputChange = (name: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    if (name === 'price') {
      const error = validateField(name, value)
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }))
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        thumbnail: 'Please upload a valid image file (JPEG, PNG, GIF, WebP)',
      }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        thumbnail: 'Image size must be less than 5MB',
      }))
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      setImagePreview(result)
      setFormData(prev => ({ ...prev, thumbnail: file }))
      setErrors(prev => ({ ...prev, thumbnail: undefined }))
    }
    reader.readAsDataURL(file)
  }

  const validateBasicInfo = (): boolean => {
    const newErrors: FormErrors = {}

    Object.keys(formData).forEach(key => {
      const error = validateField(
        key as keyof FormData,
        formData[key as keyof FormData]
      )
      if (error) {
        newErrors[key as keyof FormErrors] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateCourse = async () => {
    if (!validateBasicInfo()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('creating')

    try {
      const courseData: CourseRequestDTO = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        level: formData.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        categoryCode: parseInt(formData.category, 10),
      }

      const createResponse = await courseApi.createCourse(courseData)
      const createdCourse = createResponse.data
      setCreatedCourseId(createdCourse.id)
      setCreatedCourse(createdCourse)

      if (formData.thumbnail) {
        await courseApi.uploadThumbnail(
          createdCourse.id.toString(),
          formData.thumbnail
        )
      }

      setCurrentStep('content-structure')
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

  // Module management functions
  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `Module ${modules.length + 1}`,
      lessons: [],
    }
    setModules([...modules, newModule])
    setActiveModuleId(newModule.id)
  }

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setModules(
      modules.map(module =>
        module.id === moduleId ? { ...module, ...updates } : module
      )
    )
  }

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter(module => module.id !== moduleId))
    if (activeModuleId === moduleId) {
      setActiveModuleId(null)
    }
  }

  const addLesson = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: `Lesson ${module.lessons.length + 1}`,
      duration: 0,
    }
    updateModule(moduleId, {
      lessons: [...module.lessons, newLesson],
    })
  }

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return
    const updatedLessons = module.lessons.map(lesson =>
      lesson.id === lessonId ? { ...lesson, ...updates } : lesson
    )
    updateModule(moduleId, { lessons: updatedLessons })
  }

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return
    const updatedLessons = module.lessons.filter(
      lesson => lesson.id !== lessonId
    )
    updateModule(moduleId, { lessons: updatedLessons })
  }

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

  const resetForm = () => {
    setFormData({
      title: '',
      price: '',
      description: '',
      thumbnail: null,
      level: '',
      category: '',
    })
    setImagePreview('')
    setErrors({})
    setCreatedCourseId(null)
    setCreatedCourse(null)
    setModules([])
    setActiveModuleId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStepTitle = () => {
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
  }

  const handleVideoUpload = (
    moduleId: string,
    lessonId: string,
    file: File
  ) => {
    // Giới hạn 100MB
    const MAX_SIZE_MB = 100
    if (!file.type.startsWith('video/')) {
      toast.error('Only video files are allowed')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error('Video file size must be less than 100MB')
      return
    }
    const module = modules.find(m => m.id === moduleId)
    if (!module) return
    const lesson = module.lessons.find(l => l.id === lessonId)
    if (!lesson) return
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const durationInSeconds = Math.round(video.duration)
      updateLesson(moduleId, lessonId, {
        videoFile: file,
        duration: durationInSeconds,
      })
    }
    video.src = URL.createObjectURL(file)
  }

  function formatDuration(seconds: number) {
    if (!seconds && seconds !== 0) return ''
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <RoleGuard allowedRoles={['manager', 'admin']}>
      <TooltipProvider>
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
            <div className='space-y-8'>
              {/* Course Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <BookOpen className='h-5 w-5' />
                    Course Information
                  </CardTitle>
                  <CardDescription>
                    Provide the basic details about your course
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Title and Price Row */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Course Title */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Label htmlFor='title' className='text-sm font-medium'>
                          Course Title <span className='text-red-500'>*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className='h-4 w-4 text-muted-foreground' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Choose a clear, descriptive title that accurately
                              represents your course content
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id='title'
                        value={formData.title}
                        onChange={e =>
                          handleInputChange('title', e.target.value)
                        }
                        placeholder='e.g., Complete React.js Development Course'
                        className={errors.title ? 'border-red-500' : ''}
                        maxLength={100}
                      />
                      <div className='flex justify-between text-xs'>
                        <span
                          className={
                            errors.title
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                          }
                        >
                          {errors.title || 'Enter a compelling course title'}
                        </span>
                        <span
                          className={`${formData.title.length > 90 ? 'text-orange-500' : 'text-muted-foreground'}`}
                        >
                          {formData.title.length}/100
                        </span>
                      </div>
                    </div>

                    {/* Course Price */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Label htmlFor='price' className='text-sm font-medium'>
                          Course Price <span className='text-red-500'>*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className='h-4 w-4 text-muted-foreground' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Set a competitive price for your course. Consider
                              the value you're providing.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className='relative'>
                        <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                          id='price'
                          type='number'
                          step='0.01'
                          min='0'
                          value={formData.price}
                          onChange={e =>
                            handleInputChange('price', e.target.value)
                          }
                          placeholder='99.99'
                          className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {formData.price && !errors.price && (
                        <p className='text-sm text-green-600'>
                          Formatted: ${formatPrice(formData.price)}
                        </p>
                      )}
                      {errors.price && (
                        <p className='text-xs text-red-500'>{errors.price}</p>
                      )}
                    </div>
                  </div>

                  {/* Level and Category Row */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Course Level */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Label htmlFor='level' className='text-sm font-medium'>
                          Course Level <span className='text-red-500'>*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className='h-4 w-4 text-muted-foreground' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Select the appropriate difficulty level for your
                              target audience
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={formData.level}
                        onValueChange={value =>
                          handleInputChange('level', value)
                        }
                      >
                        <SelectTrigger
                          className={errors.level ? 'border-red-500' : ''}
                        >
                          <SelectValue placeholder='Select course level' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='BEGINNER'>
                            <div className='flex items-center gap-2'>
                              <Badge variant='secondary'>Beginner</Badge>
                              <span className='text-sm text-muted-foreground'>
                                No prior experience required
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value='INTERMEDIATE'>
                            <div className='flex items-center gap-2'>
                              <Badge variant='default'>Intermediate</Badge>
                              <span className='text-sm text-muted-foreground'>
                                Some experience recommended
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value='ADVANCED'>
                            <div className='flex items-center gap-2'>
                              <Badge variant='destructive'>Advanced</Badge>
                              <span className='text-sm text-muted-foreground'>
                                Extensive experience required
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.level && (
                        <p className='text-xs text-red-500'>{errors.level}</p>
                      )}
                    </div>

                    {/* Course Category */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Label
                          htmlFor='category'
                          className='text-sm font-medium'
                        >
                          Course Category{' '}
                          <span className='text-red-500'>*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className='h-4 w-4 text-muted-foreground' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Select the appropriate category for your course
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={formData.category}
                        onValueChange={value =>
                          handleInputChange('category', value)
                        }
                      >
                        <SelectTrigger
                          className={`${errors.category ? 'border-red-500' : ''} ${formData.category ? 'text-foreground' : 'text-muted-foreground'}`}
                          disabled={loadingCategories}
                        >
                          <SelectValue
                            placeholder={
                              loadingCategories
                                ? 'Loading categories...'
                                : 'Select course category'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.length === 0 && !loadingCategories ? (
                            <SelectItem value='none' disabled>
                              <span className='text-muted-foreground'>
                                No categories available
                              </span>
                            </SelectItem>
                          ) : (
                            categories.map(category => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                <div className='flex items-center gap-2'>
                                  <Tags className='h-4 w-4' />
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className='text-xs text-red-500'>
                          {errors.category}
                        </p>
                      )}
                      {loadingCategories && (
                        <p className='text-xs text-blue-600'>
                          Loading available categories...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Description</CardTitle>
                  <CardDescription>
                    Write a compelling description that explains what students
                    will learn
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='description'
                      className='text-sm font-medium'
                    >
                      Description <span className='text-red-500'>*</span>
                    </Label>
                    <Textarea
                      id='description'
                      value={formData.description}
                      onChange={e =>
                        handleInputChange('description', e.target.value)
                      }
                      placeholder="Describe what students will learn in this course. Include course objectives, prerequisites, and what makes your course unique.

Example:
This comprehensive React course will teach you everything you need to know to build modern web applications. You'll learn React fundamentals, hooks, state management, and much more through hands-on projects.

What you'll learn:
- React fundamentals and JSX
- Component lifecycle and hooks
- State management with Redux
- Building real-world projects

Prerequisites:
- Basic JavaScript knowledge
- HTML/CSS understanding"
                      className={`min-h-[200px] ${errors.description ? 'border-red-500' : ''}`}
                      maxLength={2000}
                    />
                    <div className='flex justify-between text-xs'>
                      <span
                        className={
                          errors.description
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                        }
                      >
                        {errors.description || 'Minimum 20 characters required'}
                      </span>
                      <span
                        className={`${formData.description.length > 1800 ? 'text-orange-500' : 'text-muted-foreground'}`}
                      >
                        {formData.description.length}/2000
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Thumbnail */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <ImageIcon className='h-5 w-5' />
                    Course Thumbnail
                  </CardTitle>
                  <CardDescription>
                    Upload an attractive thumbnail image for your course
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>
                      Upload Thumbnail <span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex items-center gap-4'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => fileInputRef.current?.click()}
                        className='flex items-center gap-2'
                      >
                        <Upload className='h-4 w-4' />
                        Choose File
                      </Button>
                      <span className='text-sm text-muted-foreground'>
                        JPEG, PNG, GIF, WebP (max 5MB)
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleFileUpload}
                      className='hidden'
                    />
                    {errors.thumbnail && (
                      <p className='text-xs text-red-500'>{errors.thumbnail}</p>
                    )}
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Preview</Label>
                      <div className='relative w-full max-w-md'>
                        <img
                          src={imagePreview}
                          alt='Course thumbnail preview'
                          className='w-full h-48 object-cover rounded-lg border'
                          onError={() => {
                            setImagePreview('')
                            setErrors(prev => ({
                              ...prev,
                              thumbnail: 'Failed to load image',
                            }))
                          }}
                        />
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          className='absolute top-2 right-2'
                          onClick={() => {
                            setImagePreview('')
                            setFormData(prev => ({ ...prev, thumbnail: null }))
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className='pt-6'>
                  {submitStatus === 'success' && (
                    <Alert className='mb-4 border-green-500 bg-green-50'>
                      <CheckCircle className='h-4 w-4 text-green-600' />
                      <AlertDescription className='text-green-800'>
                        Course created successfully! You can now add modules and
                        lessons.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitStatus === 'error' && (
                    <Alert className='mb-4 border-red-500 bg-red-50'>
                      <AlertCircle className='h-4 w-4 text-red-600' />
                      <AlertDescription className='text-red-800'>
                        Failed to create course. Please check the form and try
                        again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {(submitStatus === 'creating' ||
                    submitStatus === 'uploading') && (
                    <Alert className='mb-4 border-blue-500 bg-blue-50'>
                      <Info className='h-4 w-4 text-blue-600' />
                      <AlertDescription className='text-blue-800'>
                        {submitStatus === 'creating'
                          ? 'Creating your course...'
                          : 'Uploading thumbnail...'}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className='flex gap-4'>
                    <Button
                      type='button'
                      onClick={handleCreateCourse}
                      disabled={isSubmitting}
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
                    >
                      <X className='h-4 w-4 mr-2' />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content Structure Step */}
          {currentStep === 'content-structure' && createdCourse && (
            <div className='space-y-8'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <BookOpen className='h-5 w-5' />
                    Course Structure
                  </CardTitle>
                  <CardDescription>
                    Organize your course content into modules and lessons. You
                    can always edit this later in the course editor.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Course Summary */}
                  <div className='p-4 bg-muted rounded-lg'>
                    <h3 className='font-semibold mb-2'>
                      {createdCourse.title}
                    </h3>
                    <p className='text-sm text-muted-foreground mb-2'>
                      {createdCourse.description}
                    </p>
                    <div className='flex items-center gap-4 text-sm'>
                      <span>Price: ${createdCourse.finalPrice}</span>
                      <span>Level: {createdCourse.level}</span>
                      <span>Category: {createdCourse.category}</span>
                    </div>
                  </div>

                  {/* Modules Section */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-semibold'>Course Modules</h3>
                      <Button onClick={addModule} size='sm'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Module
                      </Button>
                    </div>

                    {modules.length === 0 ? (
                      <div className='text-center py-8 text-muted-foreground'>
                        <BookOpen className='h-12 w-12 mx-auto mb-4 opacity-50' />
                        <p>
                          No modules yet. Click "Add Module" to get started.
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        {modules.map((module, moduleIndex) => (
                          <Card
                            key={module.id}
                            className='border-l-4 border-l-primary'
                          >
                            <CardHeader className='pb-3'>
                              <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                  {activeModuleId === module.id ? (
                                    <div className='space-y-2'>
                                      <Input
                                        value={module.title}
                                        onChange={e =>
                                          updateModule(module.id, {
                                            title: e.target.value,
                                          })
                                        }
                                        placeholder='Module title'
                                        className='font-semibold'
                                      />
                                      <div className='flex gap-2'>
                                        <Button
                                          size='sm'
                                          onClick={() =>
                                            setActiveModuleId(null)
                                          }
                                        >
                                          <CheckCircle className='h-4 w-4 mr-1' />
                                          Save
                                        </Button>
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          onClick={() =>
                                            setActiveModuleId(null)
                                          }
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <h4 className='font-semibold'>
                                        Module {moduleIndex + 1}: {module.title}
                                      </h4>
                                    </div>
                                  )}
                                </div>
                                <div className='flex items-center gap-2 ml-4'>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => setActiveModuleId(module.id)}
                                    disabled={activeModuleId === module.id}
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => deleteModule(module.id)}
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>

                            {/* Lessons */}
                            <CardContent className='pt-0'>
                              <div className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                  <span className='text-sm font-medium'>
                                    Lessons ({module.lessons.length})
                                  </span>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => addLesson(module.id)}
                                  >
                                    <Plus className='h-4 w-4 mr-1' />
                                    Add Lesson
                                  </Button>
                                </div>

                                {module.lessons.length === 0 ? (
                                  <p className='text-sm text-muted-foreground py-4'>
                                    No lessons yet
                                  </p>
                                ) : (
                                  <div className='space-y-2'>
                                    {module.lessons.map(
                                      (lesson, lessonIndex) => {
                                        return (
                                          <div
                                            key={lesson.id}
                                            className='flex items-center gap-3 p-3 border rounded-lg'
                                          >
                                            <Video className='h-4 w-4 text-muted-foreground' />
                                            <div className='flex-1'>
                                              {activeModuleId === module.id ? (
                                                <div className='space-y-2'>
                                                  <Input
                                                    value={lesson.title}
                                                    onChange={e =>
                                                      updateLesson(
                                                        module.id,
                                                        lesson.id,
                                                        {
                                                          title: e.target.value,
                                                        }
                                                      )
                                                    }
                                                    placeholder='Lesson title'
                                                  />
                                                  <div className='space-y-2'>
                                                    <Label>Video File</Label>
                                                    <Input
                                                      type='file'
                                                      accept='video/*'
                                                      onChange={e => {
                                                        const file =
                                                          e.target.files?.[0]
                                                        if (file) {
                                                          handleVideoUpload(
                                                            module.id,
                                                            lesson.id,
                                                            file
                                                          )
                                                        }
                                                      }}
                                                    />
                                                    <p className='text-sm text-muted-foreground'>
                                                      Supported formats: MP4,
                                                      WebM, MOV (max 100MB)
                                                    </p>
                                                    {lesson.videoFile && (
                                                      <>
                                                        <p className='text-sm text-muted-foreground'>
                                                          Selected:{' '}
                                                          {
                                                            lesson.videoFile
                                                              .name
                                                          }{' '}
                                                          (Duration:{' '}
                                                          {formatDuration(
                                                            lesson.duration
                                                          )}
                                                          )
                                                        </p>
                                                        {lessonUploadProgress[
                                                          lesson.id
                                                        ] !== undefined &&
                                                          lessonUploadProgress[
                                                            lesson.id
                                                          ] < 100 && (
                                                            <div className='w-full mt-1'>
                                                              <Progress
                                                                value={
                                                                  lessonUploadProgress[
                                                                    lesson.id
                                                                  ]
                                                                }
                                                                className='h-2'
                                                              />
                                                              <span className='text-xs text-muted-foreground'>
                                                                Uploading:{' '}
                                                                {
                                                                  lessonUploadProgress[
                                                                    lesson.id
                                                                  ]
                                                                }
                                                                %
                                                              </span>
                                                            </div>
                                                          )}
                                                        {lessonUploadProgress[
                                                          lesson.id
                                                        ] === 100 && (
                                                          <span className='text-xs text-green-600'>
                                                            Upload complete!
                                                          </span>
                                                        )}
                                                      </>
                                                    )}
                                                  </div>
                                                  <div className='flex gap-2'>
                                                    <Button
                                                      size='sm'
                                                      onClick={() =>
                                                        setActiveModuleId(null)
                                                      }
                                                    >
                                                      <CheckCircle className='h-4 w-4 mr-1' />
                                                      Save
                                                    </Button>
                                                    <Button
                                                      size='sm'
                                                      variant='outline'
                                                      onClick={() =>
                                                        setActiveModuleId(null)
                                                      }
                                                    >
                                                      Cancel
                                                    </Button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div>
                                                  <span className='font-medium'>
                                                    {lessonIndex + 1}.{' '}
                                                    {lesson.title}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                            <div className='flex items-center gap-1'>
                                              <Button
                                                size='sm'
                                                variant='ghost'
                                                onClick={() =>
                                                  setActiveModuleId(module.id)
                                                }
                                                disabled={
                                                  activeModuleId === module.id
                                                }
                                              >
                                                <Edit className='h-4 w-4' />
                                              </Button>
                                              <Button
                                                size='sm'
                                                variant='ghost'
                                                onClick={() =>
                                                  deleteLesson(
                                                    module.id,
                                                    lesson.id
                                                  )
                                                }
                                              >
                                                <Trash2 className='h-4 w-4' />
                                              </Button>
                                            </div>
                                          </div>
                                        )
                                      }
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex gap-4'>
                    <Button
                      variant='outline'
                      onClick={() => setCurrentStep('basic-info')}
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
                    >
                      Skip & Go to Editor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </TooltipProvider>
    </RoleGuard>
  )
}
