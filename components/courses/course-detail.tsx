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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden relative group">
            <img
              src={course.thumbnailUrl || "/placeholder.svg?height=400&width=600"}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=400&width=600"
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="lg" className="rounded-full h-16 w-16">
                <Play className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <div>
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{course.description}</p>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg font-medium">By:</span>
              <span className="text-lg text-primary font-semibold">{course.instructorName}</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.averageRating?.toFixed(1) || '0.0'}</span>
                <span>({course.totalReviews.toLocaleString()} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(course.totalDuration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <PlayCircle className="h-4 w-4" />
                <span>{course.totalLessons} lessons</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">Last updated: {course.updatedAt}</div>
          </div>
        </div>

        {/* Enrollment Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold">${course.finalPrice.toFixed(2)}</span>
                {course.discount && course.discount > 0 && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${(course.finalPrice / (1 - course.discount / 100)).toFixed(2)}
                  </span>
                )}
                {course.discount && course.discount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {course.discount}% OFF
                  </Badge>
                )}
              </div>
              <CardDescription>Full lifetime access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleEnroll} className="w-full" size="lg">
                Enroll Now
              </Button>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Certificate of completion</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content Tabs */}
      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Course Content</h3>
            <div className="text-sm text-muted-foreground">
              {course?.totalModules} modules • {course?.totalLessons} lessons • {formatDuration(course?.totalDuration || 0)}
            </div>
          </div>

          <div className="space-y-4">
            {course?.modules && course.modules.length > 0 ? (
              course.modules.map((module: ModuleResponseDTO) => {
                return (
                  <Card key={module.id} className="overflow-hidden">
                    <Collapsible open={expandedModules.includes(module.id)} onOpenChange={() => toggleModule(module.id)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {expandedModules.includes(module.id) ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                              <div>
                                <CardTitle className="text-lg">{module.title}</CardTitle>
                                <CardDescription>Module {module.orderNumber}</CardDescription>
                              </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <div>{module.totalLessons} lessons</div>
                              <div>{formatDuration(module.totalDuration)}</div>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {loadingLessons[module.id] ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span className="text-muted-foreground">Loading lessons...</span>
                            </div>
                          ) : moduleLessons[module.id] ? (
                            <div className="space-y-2">
                              {moduleLessons[module.id].map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                    <span>{lesson.title}</span>
                                    {lesson.isPreview && (
                                      <Badge variant="secondary" className="text-xs">Preview</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {lesson.duration && (
                                      <span>{formatDuration(lesson.duration)}</span>
                                    )}
                                    {!lesson.isPreview && (
                                      <Lock className="h-4 w-4" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center py-4 text-muted-foreground">
                              No lessons available
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )
              })
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No modules available for this course.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Student Reviews</h3>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-semibold">{course.averageRating?.toFixed(1) || '0.0'}</span>
              <span className="text-muted-foreground">({course.totalReviews} reviews)</span>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  No reviews yet. Be the first to review this course!
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
