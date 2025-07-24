'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { VideoPreviewModal } from '@/components/ui/video-preview-modal'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import {
  BookOpen,
  Plus,
  Trash2,
  Video,
  FileText,
  GripVertical,
  Upload,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { lessonApi } from '@/services/lesson-api'

interface Lesson {
  id: string
  title: string
  duration: number
  lessonId?: string
  videoFile?: File
  needsVideoReplacement?: boolean
  isPreview?: boolean // Thêm thuộc tính này để hỗ trợ set preview
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
  moduleId?: string
}

interface CourseModulesEditorProps {
  modules: Module[]
  onModulesChange: (
    modules: Module[],
    action?: 'create' | 'update' | 'delete',
    data?: any
  ) => void
  isEditing?: boolean
  courseId?: string
}

export function CourseModulesEditor({
  modules,
  onModulesChange,
  isEditing = false,
  courseId,
}: CourseModulesEditorProps) {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [isAddingModule, setIsAddingModule] = useState(false)
  const [isAddingLesson, setIsAddingLesson] = useState(false)

  // Video preview states
  const [showVideoPreview, setShowVideoPreview] = useState(false)
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null)
  const [previewVideoTitle, setPreviewVideoTitle] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const { source, destination } = result

    if (source.droppableId.startsWith('module-')) {
      // Reordering lessons within a module
      const moduleId = source.droppableId.replace('module-', '')
      const module = modules.find(m => m.id === moduleId)
      if (!module || !module.lessons) return

      const newLessons = Array.from(module.lessons)
      const [reorderedLesson] = newLessons.splice(source.index, 1)
      newLessons.splice(destination.index, 0, reorderedLesson)

      onModulesChange(
        modules.map(m =>
          m.id === moduleId ? { ...m, lessons: newLessons } : m
        )
      )
    } else if (source.droppableId === 'modules') {
      // Reordering modules
      const newModules = Array.from(modules)
      const [reorderedModule] = newModules.splice(source.index, 1)
      newModules.splice(destination.index, 0, reorderedModule)
      onModulesChange(newModules)
    }
  }

  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `Module ${modules.length + 1}`,
      lessons: [],
    }
    const newModules = [...modules, newModule]
    onModulesChange(newModules, 'create', {
      type: 'module',
      title: newModule.title,
    })
    setSelectedModule(newModule.id)
    setIsAddingModule(false)
  }

  const addLesson = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const lessons = module.lessons || []
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: `Lesson ${lessons.length + 1}`,
      duration: 0,
    }

    const newModules = modules.map(m =>
      m.id === moduleId ? { ...m, lessons: [...lessons, newLesson] } : m
    )

    onModulesChange(newModules, 'create', {
      type: 'lesson',
      moduleId: module.moduleId || moduleId,
      title: newLesson.title,
    })
    setSelectedLesson(newLesson.id)
    setIsAddingLesson(false)
  }

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    const module = modules.find(m => m.id === moduleId)
    const newModules = modules.map(m =>
      m.id === moduleId ? { ...m, ...updates } : m
    )

    onModulesChange(newModules, 'update', {
      type: 'module',
      moduleId: module?.moduleId || moduleId,
      title: updates.title,
    })
  }

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => {
    const module = modules.find(m => m.id === moduleId)
    const lesson = module?.lessons?.find(l => l.id === lessonId)

    const newModules = modules.map(m =>
      m.id === moduleId
        ? {
            ...m,
            lessons: (m.lessons || []).map(l =>
              l.id === lessonId ? { ...l, ...updates } : l
            ),
          }
        : m
    )

    onModulesChange(newModules, 'update', {
      type: 'lesson',
      lessonId: lesson?.lessonId || lessonId,
      title: updates.title,
      duration: updates.duration,
      order: 0,
      isPreview: false,
    })
  }

  const deleteModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    const newModules = modules.filter(m => m.id !== moduleId)

    onModulesChange(newModules, 'delete', {
      type: 'module',
      moduleId: module?.moduleId || moduleId,
    })

    if (selectedModule === moduleId) {
      setSelectedModule(null)
    }
  }

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const module = modules.find(m => m.id === moduleId)
    const lesson = module?.lessons?.find(l => l.id === lessonId)

    const newModules = modules.map(m =>
      m.id === moduleId
        ? { ...m, lessons: (m.lessons || []).filter(l => l.id !== lessonId) }
        : m
    )

    onModulesChange(newModules, 'delete', {
      type: 'lesson',
      lessonId: lesson?.lessonId || lessonId,
    })

    if (selectedLesson === lessonId) {
      setSelectedLesson(null)
    }
  }

  const handleVideoUpload = (
    moduleId: string,
    lessonId: string,
    file: File
  ) => {
    // Validate file type and size
    const MAX_SIZE_MB = 100
    if (!file.type.startsWith('video/')) {
      toast.error('Only video files are allowed')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error('Video file size must be less than 100MB')
      return
    }

    // Get video duration
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const durationInSeconds = Math.round(video.duration)

      // Check if this is an existing lesson with video (needs replacement)
      const module = modules.find(m => m.id === moduleId)
      const lesson = module?.lessons?.find(l => l.id === lessonId)
      const isExistingLessonWithVideo =
        lesson?.lessonId && (lesson.videoFile || isEditing)

      if (isExistingLessonWithVideo) {
        // Show confirmation dialog for video replacement
        const shouldReplace = window.confirm(
          `This lesson already has a video. Replacing it will permanently delete the old video from storage. Do you want to continue?`
        )

        if (!shouldReplace) {
          URL.revokeObjectURL(video.src)
          return
        }
      }

      updateLesson(moduleId, lessonId, {
        videoFile: file,
        duration: durationInSeconds,
        ...(isExistingLessonWithVideo && { needsVideoReplacement: true }),
      })
      URL.revokeObjectURL(video.src)
    }
    video.src = URL.createObjectURL(file)
  }

  const formatDuration = (seconds: number) => {
    if (!seconds && seconds !== 0) return ''
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handlePreviewVideo = async (lesson: Lesson) => {
    if (lesson.videoFile) {
      // Preview local file
      const localUrl = URL.createObjectURL(lesson.videoFile)
      setPreviewVideoUrl(localUrl)
      setPreviewVideoTitle(`${lesson.title} (Local Preview)`)
      setShowVideoPreview(true)
    } else if (lesson.lessonId && isEditing) {
      // Preview existing video from server
      try {
        setPreviewLoading(true)
        setPreviewVideoTitle(lesson.title)
        setShowVideoPreview(true)

        const url = await lessonApi.getLessonVideoUrl(lesson.lessonId)
        setPreviewVideoUrl(url)
      } catch (error) {
        toast.error('Failed to load video preview')
        setShowVideoPreview(false)
      } finally {
        setPreviewLoading(false)
      }
    } else {
      toast.error('No video available to preview')
    }
  }

  const handleClosePreview = () => {
    setShowVideoPreview(false)
    if (previewVideoUrl && previewVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewVideoUrl)
    }
    setPreviewVideoUrl(null)
    setPreviewVideoTitle('')
    setPreviewLoading(false)
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Course Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId='modules'>
              {provided => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className='space-y-2'
                >
                  {modules.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      <BookOpen className='h-12 w-12 mx-auto mb-4 opacity-50' />
                      <p>No modules yet. Click "Add Module" to get started.</p>
                    </div>
                  ) : (
                    modules.map((module, index) => (
                      <Draggable
                        key={module.id}
                        draggableId={module.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-3 ${
                              selectedModule === module.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border'
                            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center space-x-2 flex-1'>
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className='h-4 w-4 text-muted-foreground' />
                                </div>
                                <div
                                  className='flex-1 cursor-pointer'
                                  onClick={() =>
                                    setSelectedModule(
                                      selectedModule === module.id
                                        ? null
                                        : module.id
                                    )
                                  }
                                >
                                  <div className='font-medium'>
                                    {module.title}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    {module.lessons?.length || 0} lessons
                                  </div>
                                </div>
                              </div>
                              <div className='flex items-center space-x-1'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => {
                                    setSelectedModule(module.id)
                                    addLesson(module.id)
                                  }}
                                  className='h-6 w-6 p-0'
                                >
                                  <Plus className='h-3 w-3' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => deleteModule(module.id)}
                                  className='h-6 w-6 p-0 text-destructive'
                                >
                                  <Trash2 className='h-3 w-3' />
                                </Button>
                              </div>
                            </div>

                            {/* Module Edit Form */}
                            {selectedModule === module.id && (
                              <div className='mt-3 p-3 bg-muted rounded'>
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
                                </div>
                              </div>
                            )}

                            {/* Lessons */}
                            <Droppable droppableId={`module-${module.id}`}>
                              {provided => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className='mt-2 space-y-1'
                                >
                                  {(module.lessons || []).map(
                                    (lesson, lessonIndex) => (
                                      <Draggable
                                        key={lesson.id}
                                        draggableId={lesson.id}
                                        index={lessonIndex}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`ml-4 p-2 border rounded text-sm ${
                                              selectedLesson === lesson.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border'
                                            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                          >
                                            <div className='flex items-center justify-between'>
                                              <div className='flex items-center space-x-2'>
                                                <Video className='h-3 w-3' />
                                                <span
                                                  className='cursor-pointer'
                                                  onClick={() =>
                                                    setSelectedLesson(
                                                      selectedLesson ===
                                                        lesson.id
                                                        ? null
                                                        : lesson.id
                                                    )
                                                  }
                                                >
                                                  {lesson.title}
                                                </span>
                                              </div>
                                              <div className='flex items-center space-x-1'>
                                                <span className='text-xs text-muted-foreground'>
                                                  {formatDuration(
                                                    lesson.duration
                                                  )}
                                                </span>
                                                {(lesson.videoFile ||
                                                  lesson.lessonId) && (
                                                  <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={e => {
                                                      e.stopPropagation()
                                                      handlePreviewVideo(lesson)
                                                    }}
                                                    className='h-4 w-4 p-0 text-blue-600'
                                                    title='Preview video'
                                                  >
                                                    <Eye className='h-2 w-2' />
                                                  </Button>
                                                )}
                                                {/* Nút set preview */}
                                                {isEditing && (
                                                  <Button
                                                    variant={lesson.isPreview ? 'default' : 'outline'}
                                                    size='sm'
                                                    className='h-4 w-4 p-0 text-yellow-600 border-yellow-400'
                                                    title='Set as preview lesson'
                                                    onClick={async e => {
                                                      e.stopPropagation()
                                                      try {
                                                        await lessonApi.setLessonPreview(lesson.lessonId || lesson.id, true)
                                                        toast.success('Set as preview lesson successfully!')
                                                        // Reload lessons from backend
                                                        if (module.moduleId) {
                                                          const res = await lessonApi.getLessonsByModuleId(module.moduleId)
                                                          const newLessons = (res.data || []).map(l => ({
                                                            ...l,
                                                            id: l.id?.toString(),
                                                            lessonId: l.id?.toString(),
                                                            duration: Number(l.duration),
                                                            isPreview: l.isPreview === 1, // convert number to boolean
                                                            // copy các trường khác nếu cần
                                                          }))
                                                          const newModules = modules.map(m =>
                                                            m.id === module.id ? { ...m, lessons: newLessons } : m
                                                          )
                                                          onModulesChange(newModules, 'update', {
                                                            type: 'lesson',
                                                            lessonId: lesson.lessonId || lesson.id,
                                                            isPreview: true,
                                                          })
                                                        }
                                                      } catch (err) {
                                                        toast.error('Failed to set preview lesson!')
                                                      }
                                                    }}
                                                  >
                                                    <span role='img' aria-label='preview'>👁️</span>
                                                  </Button>
                                                )}
                                                {isEditing && lesson.isPreview && (
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 text-gray-600 border-gray-400"
                                                    title="Unset preview lesson"
                                                    onClick={async e => {
                                                      e.stopPropagation()
                                                      try {
                                                        await lessonApi.setLessonPreview(lesson.lessonId || lesson.id, false)
                                                        toast.success('Unset preview lesson successfully!')
                                                        // Reload lessons from backend
                                                        if (module.moduleId) {
                                                          const res = await lessonApi.getLessonsByModuleId(module.moduleId)
                                                          const newLessons = (res.data || []).map(l => ({
                                                            ...l,
                                                            id: l.id?.toString(),
                                                            lessonId: l.id?.toString(),
                                                            duration: Number(l.duration),
                                                            isPreview: l.isPreview === 1,
                                                          }))
                                                          const newModules = modules.map(m =>
                                                            m.id === module.id ? { ...m, lessons: newLessons } : m
                                                          )
                                                          onModulesChange(newModules, 'update', {
                                                            type: 'lesson',
                                                            lessonId: lesson.lessonId || lesson.id,
                                                            isPreview: false,
                                                          })
                                                        }
                                                      } catch (err) {
                                                        toast.error('Failed to unset preview lesson!')
                                                      }
                                                    }}
                                                  >
                                                    <span role="img" aria-label="unset-preview">🚫</span>
                                                  </Button>
                                                )}
                                                <Button
                                                  variant='ghost'
                                                  size='sm'
                                                  onClick={e => {
                                                    e.stopPropagation()
                                                    deleteLesson(
                                                      module.id,
                                                      lesson.id
                                                    )
                                                  }}
                                                  className='h-4 w-4 p-0 text-destructive'
                                                >
                                                  <Trash2 className='h-2 w-2' />
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Lesson Edit Form */}
                                            {selectedLesson === lesson.id && (
                                              <div className='mt-2 space-y-2'>
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
                                                  <label className='text-xs font-medium'>
                                                    Video File
                                                  </label>
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
                                                  <p className='text-xs text-muted-foreground'>
                                                    Supported formats: MP4,
                                                    WebM, MOV (max 100MB)
                                                  </p>
                                                  {lesson.videoFile && (
                                                    <p className='text-xs text-green-600'>
                                                      Selected:{' '}
                                                      {lesson.videoFile.name}
                                                      {lesson.duration > 0 &&
                                                        ` (Duration: ${formatDuration(lesson.duration)})`}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    )
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Module Button */}
          <Button size='sm' onClick={addModule} className='mt-4'>
            <Plus className='mr-2 h-4 w-4' />
            Add Module
          </Button>
        </CardContent>
      </Card>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={showVideoPreview}
        onClose={handleClosePreview}
        title={previewVideoTitle}
        description={
          previewVideoUrl?.startsWith('blob:')
            ? 'Local file preview - this video will be uploaded when you save the course.'
            : 'Preview of the current lesson video.'
        }
        videoUrl={previewVideoUrl}
        isLoading={previewLoading}
        autoPlay={true}
        showControls={true}
      />
    </div>
  )
}
