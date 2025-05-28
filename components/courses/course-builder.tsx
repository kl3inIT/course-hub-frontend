"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { BookOpen, Plus, Trash2, Video, FileText, Clock, GripVertical, Settings, Save, Eye, Upload } from "lucide-react"
import { VideoUploadManager } from "./video-upload-manager"

interface Lesson {
  id: string
  title: string
  description: string
  type: "video" | "text" | "quiz"
  duration: number
  videoUrl?: string
  content?: string
  order: number
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  order: number
}

interface Course {
  id: string
  title: string
  description: string
  modules: Module[]
}

const mockCourse: Course = {
  id: "1",
  title: "Complete React Development",
  description: "Master React from fundamentals to advanced concepts",
  modules: [
    {
      id: "m1",
      title: "Introduction to React",
      description: "Learn the basics of React components and JSX",
      order: 1,
      lessons: [
        {
          id: "l1",
          title: "What is React?",
          description: "Understanding React and its ecosystem",
          type: "video",
          duration: 15,
          videoUrl: "/videos/intro-to-react.mp4",
          order: 1,
        },
        {
          id: "l2",
          title: "Setting up Development Environment",
          description: "Installing Node.js, npm, and create-react-app",
          type: "video",
          duration: 20,
          videoUrl: "/videos/setup-env.mp4",
          order: 2,
        },
      ],
    },
  ],
}

interface CourseBuilderProps {
  courseId: string
}

export function CourseBuilder({ courseId }: CourseBuilderProps) {
  const [course, setCourse] = useState<Course>(mockCourse)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [isAddingModule, setIsAddingModule] = useState(false)
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [draggedVideo, setDraggedVideo] = useState<File | null>(null)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result

    if (source.droppableId.startsWith("module-")) {
      // Reordering lessons within a module
      const moduleId = source.droppableId.replace("module-", "")
      const module = course.modules.find((m) => m.id === moduleId)
      if (!module) return

      const newLessons = Array.from(module.lessons)
      const [reorderedLesson] = newLessons.splice(source.index, 1)
      newLessons.splice(destination.index, 0, reorderedLesson)

      setCourse((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: newLessons.map((lesson, index) => ({
                  ...lesson,
                  order: index + 1,
                })),
              }
            : m,
        ),
      }))
    } else if (source.droppableId === "modules") {
      // Reordering modules
      const newModules = Array.from(course.modules)
      const [reorderedModule] = newModules.splice(source.index, 1)
      newModules.splice(destination.index, 0, reorderedModule)

      setCourse((prev) => ({
        ...prev,
        modules: newModules.map((module, index) => ({
          ...module,
          order: index + 1,
        })),
      }))
    }
  }

  const addModule = () => {
    const newModule: Module = {
      id: `m${Date.now()}`,
      title: "New Module",
      description: "Module description",
      lessons: [],
      order: course.modules.length + 1,
    }

    setCourse((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }))
    setSelectedModule(newModule.id)
    setIsAddingModule(false)
  }

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: `l${Date.now()}`,
      title: "New Lesson",
      description: "Lesson description",
      type: "video",
      duration: 10,
      order: course.modules.find((m) => m.id === moduleId)?.lessons.length || 0 + 1,
    }

    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [...m.lessons, newLesson],
            }
          : m,
      ),
    }))
    setSelectedLesson(newLesson.id)
    setIsAddingLesson(false)
  }

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, ...updates } : m)),
    }))
  }

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)),
            }
          : m,
      ),
    }))
  }

  const deleteModule = (moduleId: string) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId),
    }))
    if (selectedModule === moduleId) {
      setSelectedModule(null)
    }
  }

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.filter((l) => l.id !== lessonId),
            }
          : m,
      ),
    }))
    if (selectedLesson === lessonId) {
      setSelectedLesson(null)
    }
  }

  const handleVideoUpload = (moduleId: string, lessonId: string, file: File) => {
    // Simulate video upload
    const videoUrl = URL.createObjectURL(file)
    updateLesson(moduleId, lessonId, { videoUrl })
  }

  const getSelectedModule = () => course.modules.find((m) => m.id === selectedModule)
  const getSelectedLesson = () => {
    const module = getSelectedModule()
    return module?.lessons.find((l) => l.id === selectedLesson)
  }

  const getTotalDuration = () => {
    return course.modules.reduce(
      (total, module) => total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + lesson.duration, 0),
      0,
    )
  }

  const getTotalLessons = () => {
    return course.modules.reduce((total, module) => total + module.lessons.length, 0)
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Course
          </Button>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.modules.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalLessons()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Draft</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Structure */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Course Structure</CardTitle>
                <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Module
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Module</DialogTitle>
                      <DialogDescription>Create a new module for your course</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Module Title</label>
                        <Input placeholder="Enter module title" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea placeholder="Enter module description" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddingModule(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addModule}>Create Module</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="modules">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {course.modules.map((module, index) => (
                        <Draggable key={module.id} draggableId={module.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border rounded-lg p-3 ${
                                selectedModule === module.id ? "border-primary bg-primary/5" : "border-border"
                              } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 flex-1">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedModule(module.id)}>
                                    <div className="font-medium">{module.title}</div>
                                    <div className="text-xs text-muted-foreground">{module.lessons.length} lessons</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAddingLesson(true)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteModule(module.id)}
                                    className="h-6 w-6 p-0 text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Enhanced Lessons with Video Upload Support */}
                              <Droppable droppableId={`module-${module.id}`}>
                                {(provided) => (
                                  <div {...provided.droppableProps} ref={provided.innerRef} className="mt-2 space-y-1">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                      <Draggable key={lesson.id} draggableId={lesson.id} index={lessonIndex}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`ml-4 p-2 border rounded text-sm ${
                                              selectedLesson === lesson.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border"
                                            } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                                            onClick={() => setSelectedLesson(lesson.id)}
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                {lesson.type === "video" ? (
                                                  <div className="flex items-center space-x-1">
                                                    <Video className="h-3 w-3" />
                                                    {lesson.videoUrl && (
                                                      <div
                                                        className="w-2 h-2 bg-green-500 rounded-full"
                                                        title="Video uploaded"
                                                      />
                                                    )}
                                                  </div>
                                                ) : (
                                                  <FileText className="h-3 w-3" />
                                                )}
                                                <span className="cursor-pointer">{lesson.title}</span>
                                              </div>
                                              <div className="flex items-center space-x-1">
                                                <span className="text-xs text-muted-foreground">
                                                  {lesson.duration}m
                                                </span>
                                                {lesson.type === "video" && !lesson.videoUrl && (
                                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                                    No Video
                                                  </Badge>
                                                )}
                                                {lesson.type === "video" && lesson.videoUrl && (
                                                  <Badge variant="secondary" className="text-xs px-1 py-0">
                                                    Ready
                                                  </Badge>
                                                )}
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteLesson(module.id, lesson.id)
                                                  }}
                                                  className="h-4 w-4 p-0 text-destructive"
                                                >
                                                  <Trash2 className="h-2 w-2" />
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Video Upload Drop Zone for Individual Lessons */}
                                            {lesson.type === "video" &&
                                              !lesson.videoUrl &&
                                              selectedLesson === lesson.id && (
                                                <div className="mt-2 p-2 border-2 border-dashed border-muted-foreground/25 rounded text-center">
                                                  <div className="flex flex-col items-center space-y-1">
                                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">
                                                      Drop video here
                                                    </span>
                                                    <input
                                                      type="file"
                                                      accept="video/*"
                                                      className="hidden"
                                                      id={`video-upload-${lesson.id}`}
                                                      onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                          handleVideoUpload(module.id, lesson.id, file)
                                                        }
                                                      }}
                                                    />
                                                    <label
                                                      htmlFor={`video-upload-${lesson.id}`}
                                                      className="text-xs text-primary cursor-pointer hover:underline"
                                                    >
                                                      Browse files
                                                    </label>
                                                  </div>
                                                </div>
                                              )}

                                            {/* Video Preview for Uploaded Videos */}
                                            {lesson.type === "video" &&
                                              lesson.videoUrl &&
                                              selectedLesson === lesson.id && (
                                                <div className="mt-2 p-2 bg-muted/50 rounded">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                      <div className="w-8 h-6 bg-black rounded overflow-hidden">
                                                        <video
                                                          src={lesson.videoUrl}
                                                          className="w-full h-full object-cover"
                                                          muted
                                                        />
                                                      </div>
                                                      <div>
                                                        <p className="text-xs font-medium">Video uploaded</p>
                                                        <p className="text-xs text-muted-foreground">
                                                          {lesson.duration} minutes
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        title="Preview video"
                                                      >
                                                        <Eye className="h-3 w-3" />
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        title="Replace video"
                                                        onClick={() => {
                                                          const input = document.getElementById(
                                                            `video-upload-${lesson.id}`,
                                                          ) as HTMLInputElement
                                                          input?.click()
                                                        }}
                                                      >
                                                        <Upload className="h-3 w-3" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* Add Lesson Dialog with Video Type Selection */}
              <Dialog open={isAddingLesson} onOpenChange={setIsAddingLesson}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Lesson</DialogTitle>
                    <DialogDescription>Create a new lesson for the selected module</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Lesson Title</label>
                      <Input placeholder="Enter lesson title" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Lesson Type</label>
                      <div className="flex space-x-2 mt-2">
                        <Button variant="outline" size="sm" className="flex items-center space-x-2">
                          <Video className="h-4 w-4" />
                          <span>Video Lesson</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Text Lesson</span>
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea placeholder="Enter lesson description" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration (minutes)</label>
                      <Input type="number" placeholder="10" />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingLesson(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => selectedModule && addLesson(selectedModule)}>Create Lesson</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Content Editor */}
        <div className="lg:col-span-2">
          {selectedModule && (
            <Tabs defaultValue="module" className="space-y-4">
              <TabsList>
                <TabsTrigger value="module">Module Settings</TabsTrigger>
                {selectedLesson && <TabsTrigger value="lesson">Lesson Content</TabsTrigger>}
              </TabsList>

              <TabsContent value="module">
                <Card>
                  <CardHeader>
                    <CardTitle>Module: {getSelectedModule()?.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Module Title</label>
                      <Input
                        value={getSelectedModule()?.title}
                        onChange={(e) => selectedModule && updateModule(selectedModule, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={getSelectedModule()?.description}
                        onChange={(e) =>
                          selectedModule && updateModule(selectedModule, { description: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {selectedLesson && (
                <TabsContent value="lesson">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lesson: {getSelectedLesson()?.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Lesson Basic Info */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">Lesson Title</label>
                          <Input
                            value={getSelectedLesson()?.title}
                            onChange={(e) =>
                              selectedModule &&
                              selectedLesson &&
                              updateLesson(selectedModule, selectedLesson, { title: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Duration (minutes)</label>
                          <Input
                            type="number"
                            value={getSelectedLesson()?.duration}
                            onChange={(e) =>
                              selectedModule &&
                              selectedLesson &&
                              updateLesson(selectedModule, selectedLesson, {
                                duration: Number.parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={getSelectedLesson()?.description}
                          onChange={(e) =>
                            selectedModule &&
                            selectedLesson &&
                            updateLesson(selectedModule, selectedLesson, { description: e.target.value })
                          }
                        />
                      </div>

                      {/* Video Content */}
                      <div>
                        <label className="text-sm font-medium">Video Content</label>
                        <VideoUploadManager
                          lessonId={selectedLesson}
                          onVideoUploaded={(video) => {
                            if (selectedModule && selectedLesson) {
                              updateLesson(selectedModule, selectedLesson, {
                                videoUrl: video.url,
                                duration: Math.ceil((video.duration || 0) / 60), // Convert to minutes
                              })
                            }
                          }}
                          existingVideo={
                            getSelectedLesson()?.videoUrl
                              ? {
                                  id: "existing",
                                  file: new File([], "existing-video"),
                                  name: "Current Video",
                                  size: 0,
                                  url: getSelectedLesson()?.videoUrl,
                                  uploadProgress: 100,
                                  processingStatus: "completed",
                                  processingProgress: 100,
                                  metadata: {
                                    title: getSelectedLesson()?.title || "",
                                    description: getSelectedLesson()?.description || "",
                                    tags: [],
                                    resolution: "1920x1080",
                                    bitrate: "Unknown",
                                    format: "video/mp4",
                                  },
                                  transcoding: {
                                    formats: [
                                      {
                                        quality: "1080p",
                                        size: 0,
                                        url: getSelectedLesson()?.videoUrl,
                                        status: "completed",
                                      },
                                    ],
                                  },
                                }
                              : undefined
                          }
                        />
                      </div>

                      {/* Additional Content */}
                      <div>
                        <label className="text-sm font-medium">Additional Content</label>
                        <Textarea
                          placeholder="Add text content, notes, or resources for this lesson..."
                          value={getSelectedLesson()?.content || ""}
                          onChange={(e) =>
                            selectedModule &&
                            selectedLesson &&
                            updateLesson(selectedModule, selectedLesson, { content: e.target.value })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          )}

          {!selectedModule && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Select a module to get started</h3>
                <p className="text-muted-foreground">Choose a module from the left panel to edit its content</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
