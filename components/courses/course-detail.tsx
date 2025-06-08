"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Star,
  Clock,
  Play,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react"
import { PaymentModal } from "./payment-modal"
import { courseApi } from "@/api/course-api"
import { lessonApi } from "@/api/lesson-api"
import { useToast } from "@/hooks/use-toast"
import { CourseDetailsResponseDTO } from "@/types/course"
import { ModuleResponseDTO } from "@/types/module"
import { LessonResponseDTO } from "@/types/lesson"
import Image from "next/image"

interface CourseDetailProps {
  courseId: string
}

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function CourseDetail({ courseId }: CourseDetailProps) {
  const [course, setCourse] = useState<CourseDetailsResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [expandedModules, setExpandedModules] = useState<number[]>([])
  const [moduleLessons, setModuleLessons] = useState<Record<number, LessonResponseDTO[]>>({})
  const [loadingLessons, setLoadingLessons] = useState<Record<number, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await courseApi.getCourseDetails(courseId)
        console.log('API Response:', response)
        
        if (response) {
          console.log('Course Data:', response.data)
          setCourse(response.data)
          if (response.data.modules && response.data.modules.length > 0) {
            setExpandedModules([response.data.modules[0].id])
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err)
        setError(err instanceof Error ? err.message : 'Failed to load course details')
        toast({
          title: "Error",
          description: "Failed to load course details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId, toast])

  const fetchModuleLessons = async (moduleId: number) => {
    if (moduleLessons[moduleId]) return // Don't fetch if already loaded

    try {
      setLoadingLessons(prev => ({ ...prev, [moduleId]: true }))
      const response = await lessonApi.getLessonsByModuleId(moduleId.toString())
      if (response.data) {
        setModuleLessons(prev => ({ ...prev, [moduleId]: response.data }))
      }
    } catch (err) {
      console.error('Error fetching lessons:', err)
      toast({
        title: "Error",
        description: "Failed to load lessons. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingLessons(prev => ({ ...prev, [moduleId]: false }))
    }
  }

  const handleEnroll = () => {
    setShowPayment(true)
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const newExpanded = prev.includes(moduleId) 
        ? prev.filter((id) => id !== moduleId) 
        : [...prev, moduleId]
      
      // Fetch lessons when module is expanded
      if (newExpanded.includes(moduleId)) {
        fetchModuleLessons(moduleId)
      }
      
      return newExpanded
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h3 className="text-xl font-semibold">Course Not Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {error || "The course you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  console.log('Current Course State:', course) // Debug log

  const totalLessons = course?.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0;
  const totalVideos = course?.modules?.reduce((total, module) => 
    total + (module.lessons?.filter((lesson: LessonResponseDTO) => lesson.type === 'VIDEO').length || 0), 0) || 0;
  const totalDocuments = course?.modules?.reduce((total, module) => 
    total + (module.lessons?.filter((lesson: LessonResponseDTO) => lesson.type === 'DOCUMENT').length || 0), 0) || 0;
  const totalAssignments = course?.modules?.reduce((total, module) => 
    total + (module.lessons?.filter((lesson: LessonResponseDTO) => lesson.type === 'ASSIGNMENT').length || 0), 0) || 0;

  // Calculate total duration in minutes
  const totalDuration = course?.modules?.reduce((total, module) => 
    total + (module.lessons?.reduce((moduleTotal: number, lesson: LessonResponseDTO) => 
      moduleTotal + (lesson.duration || 0), 0) || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Course Header */}
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={course?.thumbnail || '/placeholder-course.jpg'}
              alt={course?.title || 'Course thumbnail'}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold">{course?.title}</h1>
            <p className="mt-2 text-sm text-gray-200">{course?.description}</p>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Lessons</p>
            <p className="text-2xl font-bold">{totalLessons}</p>
          </div>
          <div className="bg-card p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Videos</p>
            <p className="text-2xl font-bold">{totalVideos}</p>
          </div>
          <div className="bg-card p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Documents</p>
            <p className="text-2xl font-bold">{totalDocuments}</p>
          </div>
          <div className="bg-card p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Assignments</p>
            <p className="text-2xl font-bold">{totalAssignments}</p>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Description */}
            <div className="bg-card p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">About This Course</h2>
              <div className="prose prose-sm max-w-none">
                <p>{course?.description}</p>
              </div>
            </div>

            {/* Course Modules */}
            <div className="bg-card p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Course Content</h2>
              <div className="space-y-4">
                {course?.modules?.map((module) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    <div className="mt-4 space-y-2">
                      {module.lessons?.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{lesson.title}</span>
                            {lesson.type === 'VIDEO' && <span className="text-xs text-muted-foreground">({lesson.duration} min)</span>}
                          </div>
                          <span className="text-xs text-muted-foreground">{lesson.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <div className="bg-card p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">${course?.price || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg">{totalDuration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="text-lg capitalize">{course?.level?.toLowerCase()}</p>
                </div>
                <Button className="w-full" onClick={handleEnroll}>
                  {/* Replace with actual enrollment logic */}
                  Enroll Now
                </Button>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="bg-card p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Instructor</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div>
                  <p className="font-medium">{course?.instructor?.name}</p>
                  <p className="text-sm text-muted-foreground">{course?.instructor?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        course={{
          id: course.id,
          title: course.title,
          price: course.price,
          discountedPrice: course.finalPrice,
          thumbnail: course.thumbnailUrl,
          duration: parseInt(course.duration), // Convert "X hours" to number
          totalVideos: totalVideos,
          rating: course.averageRating,
          totalStudents: course.totalStudents
        }} 
      />
    </div>
  )
}
