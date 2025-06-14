'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Save,
  Eye,
  History,
  Globe,
  Lock,
  Users,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreVertical,
  Undo,
  ImageIcon,
  Tag,
  FileText,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CourseVersion {
  id: string
  version: string
  title: string
  description: string
  createdAt: string
  createdBy: string
  changes: string[]
  status: 'draft' | 'published' | 'archived'
}

interface CourseMetadata {
  id: string
  title: string
  description: string
  shortDescription: string
  thumbnail: string
  price: number
  originalPrice?: number
  currency: string
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  tags: string[]
  language: string
  duration: number
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'private' | 'unlisted'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  enrollmentCount: number
  rating: number
  reviewCount: number
  isPublished: boolean
  isFeatured: boolean
  allowComments: boolean
  allowDownloads: boolean
  certificateEnabled: boolean
  prerequisites: string[]
  learningObjectives: string[]
  targetAudience: string[]
  instructor: {
    id: string
    name: string
    avatar: string
  }
}

const mockCourse: CourseMetadata = {
  id: '1',
  title: 'Complete React Development',
  description:
    'Master React from fundamentals to advanced concepts with hands-on projects and real-world applications.',
  shortDescription:
    'Learn React.js from basics to advanced with practical projects',
  thumbnail: '/placeholder.svg?height=400&width=600',
  price: 99.99,
  originalPrice: 149.99,
  currency: 'USD',
  level: 'intermediate',
  category: 'Web Development',
  tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
  language: 'English',
  duration: 1200, // minutes
  status: 'draft',
  visibility: 'public',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  enrollmentCount: 1234,
  rating: 4.8,
  reviewCount: 156,
  isPublished: false,
  isFeatured: false,
  allowComments: true,
  allowDownloads: false,
  certificateEnabled: true,
  prerequisites: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'],
  learningObjectives: [
    'Build modern React applications',
    'Understand React hooks and state management',
    'Create reusable components',
    'Implement routing and navigation',
  ],
  targetAudience: [
    'Frontend developers',
    'JavaScript developers',
    'Web development students',
  ],
  instructor: {
    id: 'instructor1',
    name: 'John Doe',
    avatar: '/placeholder.svg?height=40&width=40',
  },
}

const mockVersions: CourseVersion[] = [
  {
    id: 'v3',
    version: '3.0',
    title: 'Complete React Development',
    description: 'Master React from fundamentals to advanced concepts',
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: 'John Doe',
    changes: [
      'Updated course description',
      'Added new learning objectives',
      'Modified pricing',
    ],
    status: 'draft',
  },
  {
    id: 'v2',
    version: '2.1',
    title: 'React Development Course',
    description: 'Learn React.js from basics to advanced',
    createdAt: '2024-01-10T14:20:00Z',
    createdBy: 'John Doe',
    changes: ['Added module 5', 'Updated lesson content', 'Fixed video links'],
    status: 'published',
  },
  {
    id: 'v1',
    version: '2.0',
    title: 'React Development Course',
    description: 'Learn React.js fundamentals',
    createdAt: '2024-01-05T09:15:00Z',
    createdBy: 'John Doe',
    changes: [
      'Initial course creation',
      'Added basic modules',
      'Set up course structure',
    ],
    status: 'published',
  },
]

interface CourseEditorProps {
  courseId: string
}

export function CourseEditor({ courseId }: CourseEditorProps) {
  const router = useRouter()
  const [course, setCourse] = useState<CourseMetadata>(mockCourse)
  const [versions, setVersions] = useState<CourseVersion[]>(mockVersions)
  const [activeTab, setActiveTab] = useState('details')
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showVersionDialog, setShowVersionDialog] = useState(false)

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'title':
        if (!value || value.trim().length < 5)
          return 'Title must be at least 5 characters'
        if (value.length > 100) return 'Title must be less than 100 characters'
        break
      case 'description':
        if (!value || value.trim().length < 50)
          return 'Description must be at least 50 characters'
        if (value.length > 2000)
          return 'Description must be less than 2000 characters'
        break
      case 'shortDescription':
        if (!value || value.trim().length < 20)
          return 'Short description must be at least 20 characters'
        if (value.length > 160)
          return 'Short description must be less than 160 characters'
        break
      case 'price':
        if (value < 0) return 'Price cannot be negative'
        if (value > 10000) return 'Price cannot exceed $10,000'
        break
      case 'tags':
        if (!value || value.length === 0) return 'At least one tag is required'
        if (value.length > 10) return 'Maximum 10 tags allowed'
        break
      case 'prerequisites':
        if (value && value.length > 5) return 'Maximum 5 prerequisites allowed'
        break
      case 'learningObjectives':
        if (!value || value.length === 0)
          return 'At least one learning objective is required'
        if (value.length > 10) return 'Maximum 10 learning objectives allowed'
        break
    }
    return null
  }

  const updateCourse = (field: keyof CourseMetadata, value: any) => {
    setCourse(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)

    // Real-time validation
    const error = validateField(field, value)
    setValidationErrors(prev => ({
      ...prev,
      [field]: error || '',
    }))
  }

  const addArrayItem = (field: keyof CourseMetadata, item: string) => {
    const currentArray = course[field] as string[]
    if (!currentArray.includes(item)) {
      updateCourse(field, [...currentArray, item])
    }
  }

  const removeArrayItem = (field: keyof CourseMetadata, index: number) => {
    const currentArray = course[field] as string[]
    updateCourse(
      field,
      currentArray.filter((_, i) => i !== index)
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Validate all fields
      const errors: Record<string, string> = {}
      Object.keys(course).forEach(key => {
        const error = validateField(key, course[key as keyof CourseMetadata])
        if (error) errors[key] = error
      })

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        setIsSaving(false)
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create new version
      const newVersion: CourseVersion = {
        id: `v${versions.length + 1}`,
        version: `${Math.floor(versions.length / 2) + 2}.${versions.length % 2}`,
        title: course.title,
        description: course.description,
        createdAt: new Date().toISOString(),
        createdBy: course.instructor.name,
        changes: ['Updated course details', 'Modified metadata'],
        status: course.status,
      }

      setVersions(prev => [newVersion, ...prev])
      setHasUnsavedChanges(false)
      setCourse(prev => ({ ...prev, updatedAt: new Date().toISOString() }))
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (course.status === 'published') {
      updateCourse('status', 'draft')
      updateCourse('isPublished', false)
    } else {
      updateCourse('status', 'published')
      updateCourse('isPublished', true)
      updateCourse('publishedAt', new Date().toISOString())
    }
    setShowPublishDialog(false)
    await handleSave()
  }

  const revertToVersion = (version: CourseVersion) => {
    setCourse(prev => ({
      ...prev,
      title: version.title,
      description: version.description,
      status: version.status,
      updatedAt: new Date().toISOString(),
    }))
    setHasUnsavedChanges(true)
    setShowVersionDialog(false)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: 'secondary' as const, icon: FileText },
      published: { variant: 'default' as const, icon: Globe },
      archived: { variant: 'outline' as const, icon: Lock },
    }
    const config = variants[status as keyof typeof variants]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className='flex items-center gap-1'>
        <Icon className='h-3 w-3' />
        {status}
      </Badge>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <h1 className='text-3xl font-bold'>Edit Course</h1>
            {getStatusBadge(course.status)}
            {course.isFeatured && <Badge variant='outline'>Featured</Badge>}
          </div>
          <p className='text-muted-foreground'>
            Last updated: {new Date(course.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push(`/courses/${courseId}`)}
          >
            <Eye className='mr-2 h-4 w-4' />
            Preview
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => setShowVersionDialog(true)}>
                <History className='mr-2 h-4 w-4' />
                Version History
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className='mr-2 h-4 w-4' />
                Duplicate Course
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-destructive'>
                <Lock className='mr-2 h-4 w-4' />
                Archive Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <Save className='mr-2 h-4 w-4' />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>

          <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
            <DialogTrigger asChild>
              <Button variant={course.isPublished ? 'destructive' : 'default'}>
                {course.isPublished ? (
                  <>
                    <Lock className='mr-2 h-4 w-4' />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className='mr-2 h-4 w-4' />
                    Publish
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {course.isPublished ? 'Unpublish Course' : 'Publish Course'}
                </DialogTitle>
                <DialogDescription>
                  {course.isPublished
                    ? 'This will make the course unavailable to students and hide it from the catalog.'
                    : 'This will make the course available to students and visible in the catalog.'}
                </DialogDescription>
              </DialogHeader>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setShowPublishDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant={course.isPublished ? 'destructive' : 'default'}
                  onClick={handlePublish}
                >
                  {course.isPublished ? 'Unpublish' : 'Publish'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your work before
            leaving this page.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='details'>Course Details</TabsTrigger>
          <TabsTrigger value='content'>Content & Structure</TabsTrigger>
          <TabsTrigger value='settings'>Settings & Visibility</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics & Performance</TabsTrigger>
        </TabsList>

        {/* Course Details Tab */}
        <TabsContent value='details' className='space-y-6'>
          <div className='grid gap-6 lg:grid-cols-3'>
            <div className='lg:col-span-2 space-y-6'>
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <Label htmlFor='title'>Course Title *</Label>
                    <Input
                      id='title'
                      value={course.title}
                      onChange={e => updateCourse('title', e.target.value)}
                      className={validationErrors.title ? 'border-red-500' : ''}
                    />
                    {validationErrors.title && (
                      <p className='text-sm text-red-500 mt-1'>
                        {validationErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor='shortDescription'>
                      Short Description *
                    </Label>
                    <Input
                      id='shortDescription'
                      value={course.shortDescription}
                      onChange={e =>
                        updateCourse('shortDescription', e.target.value)
                      }
                      placeholder='Brief description for course cards and search results'
                      className={
                        validationErrors.shortDescription
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      {course.shortDescription.length}/160 characters
                    </p>
                    {validationErrors.shortDescription && (
                      <p className='text-sm text-red-500 mt-1'>
                        {validationErrors.shortDescription}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor='description'>Full Description *</Label>
                    <Textarea
                      id='description'
                      value={course.description}
                      onChange={e =>
                        updateCourse('description', e.target.value)
                      }
                      rows={6}
                      className={
                        validationErrors.description ? 'border-red-500' : ''
                      }
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      {course.description.length}/2000 characters
                    </p>
                    {validationErrors.description && (
                      <p className='text-sm text-red-500 mt-1'>
                        {validationErrors.description}
                      </p>
                    )}
                  </div>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <div>
                      <Label htmlFor='category'>Category</Label>
                      <Select
                        value={course.category}
                        onValueChange={value => updateCourse('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Web Development'>
                            Web Development
                          </SelectItem>
                          <SelectItem value='Mobile Development'>
                            Mobile Development
                          </SelectItem>
                          <SelectItem value='Data Science'>
                            Data Science
                          </SelectItem>
                          <SelectItem value='Design'>Design</SelectItem>
                          <SelectItem value='Business'>Business</SelectItem>
                          <SelectItem value='Marketing'>Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='level'>Difficulty Level</Label>
                      <Select
                        value={course.level}
                        onValueChange={value => updateCourse('level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='beginner'>Beginner</SelectItem>
                          <SelectItem value='intermediate'>
                            Intermediate
                          </SelectItem>
                          <SelectItem value='advanced'>Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='language'>Language</Label>
                    <Select
                      value={course.language}
                      onValueChange={value => updateCourse('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='English'>English</SelectItem>
                        <SelectItem value='Spanish'>Spanish</SelectItem>
                        <SelectItem value='French'>French</SelectItem>
                        <SelectItem value='German'>German</SelectItem>
                        <SelectItem value='Chinese'>Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div>
                      <Label htmlFor='price'>Current Price *</Label>
                      <div className='relative'>
                        <DollarSign className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                        <Input
                          id='price'
                          type='number'
                          step='0.01'
                          value={course.price}
                          onChange={e =>
                            updateCourse(
                              'price',
                              Number.parseFloat(e.target.value)
                            )
                          }
                          className={`pl-10 ${validationErrors.price ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {validationErrors.price && (
                        <p className='text-sm text-red-500 mt-1'>
                          {validationErrors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor='originalPrice'>
                        Original Price (Optional)
                      </Label>
                      <div className='relative'>
                        <DollarSign className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                        <Input
                          id='originalPrice'
                          type='number'
                          step='0.01'
                          value={course.originalPrice || ''}
                          onChange={e =>
                            updateCourse(
                              'originalPrice',
                              e.target.value
                                ? Number.parseFloat(e.target.value)
                                : undefined
                            )
                          }
                          className='pl-10'
                        />
                      </div>
                    </div>
                  </div>

                  {course.originalPrice &&
                    course.originalPrice > course.price && (
                      <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                        <p className='text-sm text-green-800'>
                          Discount:{' '}
                          {Math.round(
                            ((course.originalPrice - course.price) /
                              course.originalPrice) *
                              100
                          )}
                          % off (Save $
                          {(course.originalPrice - course.price).toFixed(2)})
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Tags and Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags and Keywords</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <Label>Tags *</Label>
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {course.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='flex items-center gap-1'
                        >
                          <Tag className='h-3 w-3' />
                          {tag}
                          <button
                            type='button'
                            onClick={() => removeArrayItem('tags', index)}
                            className='ml-1 text-muted-foreground hover:text-foreground'
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className='flex gap-2 mt-2'>
                      <Input
                        placeholder='Add a tag'
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const input = e.target as HTMLInputElement
                            if (input.value.trim()) {
                              addArrayItem('tags', input.value.trim())
                              input.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                    {validationErrors.tags && (
                      <p className='text-sm text-red-500 mt-1'>
                        {validationErrors.tags}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Course Thumbnail */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='aspect-video bg-muted rounded-lg flex items-center justify-center'>
                    <ImageIcon className='h-8 w-8 text-muted-foreground' />
                  </div>
                  <Button variant='outline' className='w-full mt-4'>
                    Upload New Image
                  </Button>
                </CardContent>
              </Card>

              {/* Course Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Statistics</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Enrollments
                    </span>
                    <div className='flex items-center gap-1'>
                      <Users className='h-4 w-4' />
                      <span className='font-medium'>
                        {course.enrollmentCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Rating
                    </span>
                    <div className='flex items-center gap-1'>
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <span className='font-medium'>{course.rating}</span>
                      <span className='text-sm text-muted-foreground'>
                        ({course.reviewCount})
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Duration
                    </span>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      <span className='font-medium'>
                        {Math.floor(course.duration / 60)}h{' '}
                        {course.duration % 60}m
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Content & Structure Tab */}
        <TabsContent value='content'>
          <CourseBuilder courseId={courseId} />
        </TabsContent>

        {/* Settings & Visibility Tab */}
        <TabsContent value='settings' className='space-y-6'>
          <div className='grid gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Visibility Settings</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='visibility'>Course Visibility</Label>
                  <Select
                    value={course.visibility}
                    onValueChange={value => updateCourse('visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='public'>
                        Public - Visible to everyone
                      </SelectItem>
                      <SelectItem value='unlisted'>
                        Unlisted - Only accessible via direct link
                      </SelectItem>
                      <SelectItem value='private'>
                        Private - Only visible to you
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='featured'>Featured Course</Label>
                    <p className='text-sm text-muted-foreground'>
                      Display in featured section
                    </p>
                  </div>
                  <Switch
                    id='featured'
                    checked={course.isFeatured}
                    onCheckedChange={checked =>
                      updateCourse('isFeatured', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='comments'>Allow Comments</Label>
                    <p className='text-sm text-muted-foreground'>
                      Students can leave comments
                    </p>
                  </div>
                  <Switch
                    id='comments'
                    checked={course.allowComments}
                    onCheckedChange={checked =>
                      updateCourse('allowComments', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='downloads'>Allow Downloads</Label>
                    <p className='text-sm text-muted-foreground'>
                      Students can download resources
                    </p>
                  </div>
                  <Switch
                    id='downloads'
                    checked={course.allowDownloads}
                    onCheckedChange={checked =>
                      updateCourse('allowDownloads', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='certificate'>Certificate Enabled</Label>
                    <p className='text-sm text-muted-foreground'>
                      Issue completion certificates
                    </p>
                  </div>
                  <Switch
                    id='certificate'
                    checked={course.certificateEnabled}
                    onCheckedChange={checked =>
                      updateCourse('certificateEnabled', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Requirements</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label>Prerequisites</Label>
                  <div className='space-y-2 mt-2'>
                    {course.prerequisites.map((prereq, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <Input
                          value={prereq}
                          onChange={e => {
                            const newPrereqs = [...course.prerequisites]
                            newPrereqs[index] = e.target.value
                            updateCourse('prerequisites', newPrereqs)
                          }}
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            removeArrayItem('prerequisites', index)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant='outline'
                      onClick={() => addArrayItem('prerequisites', '')}
                      className='w-full'
                    >
                      Add Prerequisite
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Learning Objectives</Label>
                  <div className='space-y-2 mt-2'>
                    {course.learningObjectives.map((objective, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <Input
                          value={objective}
                          onChange={e => {
                            const newObjectives = [...course.learningObjectives]
                            newObjectives[index] = e.target.value
                            updateCourse('learningObjectives', newObjectives)
                          }}
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            removeArrayItem('learningObjectives', index)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant='outline'
                      onClick={() => addArrayItem('learningObjectives', '')}
                      className='w-full'
                    >
                      Add Learning Objective
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Target Audience</Label>
                  <div className='space-y-2 mt-2'>
                    {course.targetAudience.map((audience, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <Input
                          value={audience}
                          onChange={e => {
                            const newAudience = [...course.targetAudience]
                            newAudience[index] = e.target.value
                            updateCourse('targetAudience', newAudience)
                          }}
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            removeArrayItem('targetAudience', index)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant='outline'
                      onClick={() => addArrayItem('targetAudience', '')}
                      className='w-full'
                    >
                      Add Target Audience
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value='analytics' className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Enrollments
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {course.enrollmentCount.toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground'>
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Revenue</CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ${(course.enrollmentCount * course.price).toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground'>
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Average Rating
                </CardTitle>
                <Star className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{course.rating}</div>
                <p className='text-xs text-muted-foreground'>
                  {course.reviewCount} reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Completion Rate
                </CardTitle>
                <CheckCircle className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>78%</div>
                <p className='text-xs text-muted-foreground'>
                  +5% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                Detailed analytics and performance metrics would be displayed
                here, including enrollment trends, completion rates, student
                feedback, and revenue analytics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Version History Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View and manage different versions of your course
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 max-h-96 overflow-y-auto'>
            {versions.map(version => (
              <Card key={version.id}>
                <CardContent className='pt-4'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>v{version.version}</Badge>
                        {getStatusBadge(version.status)}
                        <span className='text-sm text-muted-foreground'>
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className='font-medium'>{version.title}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {version.description}
                      </p>
                      <div className='text-xs text-muted-foreground'>
                        Created by {version.createdBy}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => revertToVersion(version)}
                      >
                        <Undo className='mr-2 h-4 w-4' />
                        Revert
                      </Button>
                    </div>
                  </div>
                  <div className='mt-3'>
                    <p className='text-sm font-medium'>Changes:</p>
                    <ul className='text-sm text-muted-foreground list-disc list-inside'>
                      {version.changes.map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
