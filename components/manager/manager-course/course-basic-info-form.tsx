'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { categoryApi } from '@/services/category-api'
import { CategoryResponseDTO } from '@/types/category'
import { CourseRequestDTO, CourseResponseDTO } from '@/types/course'
import { useCourseMeta } from '@/hooks'
import { toast } from 'sonner'

interface CourseBasicInfoFormProps {
  initialData?: Partial<CourseRequestDTO | CourseResponseDTO>
  onDataChange: (data: CourseRequestDTO) => void
  onValidationChange: (isValid: boolean, errors: Record<string, string>) => void
  isEditing?: boolean
  className?: string
}

export function CourseBasicInfoForm({
  initialData = {},
  onDataChange,
  onValidationChange,
  isEditing = false,
  className = '',
}: CourseBasicInfoFormProps) {
  const [form, setForm] = useState<
    CourseRequestDTO & { categoryCode?: number }
  >({
    title: initialData.title || '',
    description: initialData.description || '',
    price: initialData.price ? Number(initialData.price) : 0,
    level: initialData.level ? initialData.level.toUpperCase() : '',
    categoryCode:
      (initialData as any).categoryCode &&
      (initialData as any).categoryCode !== 0
        ? (initialData as any).categoryCode
        : undefined,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { courseLevels, isLoadingLevels } = useCourseMeta()

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

  // Update form when initialData changes (for editing mode)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm(prev => {
        const newForm = {
          title: initialData.title || '',
          description: initialData.description || '',
          price: initialData.price ? Number(initialData.price) : 0,
          level: initialData.level ? initialData.level.toUpperCase() : '',
          categoryCode:
            (initialData as any)?.categoryCode &&
            (initialData as any)?.categoryCode !== 0
              ? (initialData as any)?.categoryCode
              : undefined,
        }

        // Only update if data actually changed to prevent infinite loops
        if (JSON.stringify(prev) !== JSON.stringify(newForm)) {
          return newForm
        }
        return prev
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialData?.title,
    initialData?.description,
    initialData?.price,
    initialData?.level,
    (initialData as any)?.categoryCode,
  ])

  useEffect(() => {
    // Ensure categoryCode has a valid value before passing to parent
    const formData: CourseRequestDTO = {
      ...form,
      categoryCode: form.categoryCode || 0,
    }
    onDataChange(formData)
  }, [form, onDataChange])

  useEffect(() => {
    // Only validate if user has interacted with the form
    if (Object.keys(touched).length > 0) {
      validateForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const validateField = (
    name: keyof CourseRequestDTO,
    value: any
  ): string | undefined => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Course title is required'
        if (value.length < 5) return 'Title must be at least 5 characters'
        if (value.length > 100) return 'Title must be 100 characters or less'
        break
      case 'price':
        if (value === undefined || value === null || value === '')
          return 'Price is required'
        if (isNaN(Number(value)) || Number(value) < 0)
          return 'Price must be 0 or greater'
        break
      case 'description':
        if (!value.trim()) return 'Course description is required'
        if (value.length < 20)
          return 'Description must be at least 20 characters'
        if (value.length > 2000)
          return 'Description must be 2000 characters or less'
        break
      case 'level':
        if (!value) return 'Course level is required'
        break
      case 'categoryCode':
        if (!value || value === 0) return 'Course category is required'
        break
    }
    return undefined
  }

  const validateForm = (forceValidateAll = false) => {
    if (typeof onValidationChange !== 'function') {
      console.error('onValidationChange is not a function:', onValidationChange)
      return false
    }

    const newErrors: Record<string, string> = {}
    let isValid = true

    const keys = Object.keys(form) as (keyof CourseRequestDTO)[]
    keys.forEach((key: keyof CourseRequestDTO) => {
      // Show error if field has been touched OR if forcing validation (on submit)
      if (touched[key] || forceValidateAll) {
        const error = validateField(key, form[key])
        if (error) {
          newErrors[key] = error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    onValidationChange(isValid, newErrors)
    return isValid
  }

  // Function to validate all fields (for submit)
  const validateAllFields = () => {
    // Mark all fields as touched
    const allTouched = Object.keys(form).reduce(
      (acc, key) => {
        acc[key] = true
        return acc
      },
      {} as Record<string, boolean>
    )
    setTouched(allTouched)

    return validateForm(true)
  }

  const handleChange = (name: keyof CourseRequestDTO, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder='e.g., Complete React.js Development Course'
                className={errors.title ? 'border-red-500' : ''}
                maxLength={100}
              />
              <div className='flex justify-between text-xs'>
                <span
                  className={
                    errors.title ? 'text-red-500' : 'text-muted-foreground'
                  }
                >
                  {errors.title || 'Enter a compelling course title'}
                </span>
                <span
                  className={`${form.title.length > 90 ? 'text-orange-500' : 'text-muted-foreground'}`}
                >
                  {form.title.length}/100
                </span>
              </div>
            </div>
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
                      Set a price for your course. Use 0 for free courses or set
                      a competitive price considering the value you're
                      providing.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id='price'
                type='number'
                step='0.01'
                min='0'
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                placeholder='0 for free, or 99.99'
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className='text-xs text-red-500'>{errors.price}</p>
              )}
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description' className='text-sm font-medium'>
              Description <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='description'
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder='Describe what students will learn in this course. Include course objectives, prerequisites, and what makes your course unique.'
              className={`min-h-[200px] ${errors.description ? 'border-red-500' : ''}`}
              maxLength={2000}
            />
            <div className='flex justify-between text-xs'>
              <span
                className={
                  errors.description ? 'text-red-500' : 'text-muted-foreground'
                }
              >
                {errors.description || 'Minimum 20 characters required'}
              </span>
              <span
                className={`${form.description.length > 1800 ? 'text-orange-500' : 'text-muted-foreground'}`}
              >
                {form.description.length}/2000
              </span>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                      Select the appropriate difficulty level for your target
                      audience
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={form.level || ''}
                onValueChange={value => handleChange('level', value)}
                disabled={isLoadingLevels}
              >
                <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                  <SelectValue
                    placeholder={
                      isLoadingLevels
                        ? 'Loading levels...'
                        : 'Select course level'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(courseLevels).length === 0 &&
                  !isLoadingLevels ? (
                    // Fallback levels if API fails
                    <>
                      <SelectItem value='BEGINNER'>
                        <Badge variant='secondary'>Beginner</Badge>
                      </SelectItem>
                      <SelectItem value='INTERMEDIATE'>
                        <Badge variant='default'>Intermediate</Badge>
                      </SelectItem>
                      <SelectItem value='ADVANCED'>
                        <Badge variant='destructive'>Advanced</Badge>
                      </SelectItem>
                    </>
                  ) : (
                    Object.entries(courseLevels).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        <Badge
                          variant={
                            key === 'BEGINNER'
                              ? 'secondary'
                              : key === 'INTERMEDIATE'
                                ? 'default'
                                : 'destructive'
                          }
                        >
                          {value}
                        </Badge>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.level && (
                <p className='text-xs text-red-500'>{errors.level}</p>
              )}
            </div>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='categoryCode' className='text-sm font-medium'>
                  Course Category <span className='text-red-500'>*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className='h-4 w-4 text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the appropriate category for your course</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={
                  form.categoryCode && form.categoryCode !== 0
                    ? form.categoryCode.toString()
                    : ''
                }
                onValueChange={value =>
                  handleChange('categoryCode', parseInt(value))
                }
                disabled={loadingCategories}
              >
                <SelectTrigger
                  className={errors.categoryCode ? 'border-red-500' : ''}
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
                    <SelectItem value='' disabled>
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
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoryCode && (
                <p className='text-xs text-red-500'>{errors.categoryCode}</p>
              )}
              {loadingCategories && (
                <p className='text-xs text-blue-600'>
                  Loading available categories...
                </p>
              )}
            </div>
          </div>

          {/* Loading indicator for levels */}
          {isLoadingLevels && (
            <div className='text-center'>
              <p className='text-xs text-blue-600'>Loading course levels...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
