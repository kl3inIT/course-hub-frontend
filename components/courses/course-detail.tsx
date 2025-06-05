"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Star,
  Clock,
  Play,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Award,
  Download,
  Lock,
  PlayCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { PaymentModal } from "./payment-modal"
import { courseApi } from "@/api/course-api"
import { useToast } from "@/hooks/use-toast"

interface CourseDetailProps {
  courseId: string
}

// Extended interface for detailed course data
interface DetailedCourse {
  id: number
  title: string
  description: string
  category: string
  level: string
  price: number
  finalPrice: number
  discount?: number
  instructorName: string
  totalStudents: number
  totalReviews: number
  averageRating: number
  totalLessons: number
  thumbnailUrl?: string
  instructor: {
    name: string
    bio: string
    avatar: string
    rating: number
    students: number
    courses: number
  }
  originalPrice?: number
  duration: string
  language: string
  lastUpdated: string
  image: string
  enrolled: boolean
  completionRate: number
  modules: Module[]
  requirements: string[]
  whatYouWillLearn: string[]
  reviews: Review[]
}

interface Module {
  id: number
  title: string
  description: string
  duration: string
  videoCount: number
  completed: boolean
  videos: Video[]
}

interface Video {
  id: number
  title: string
  duration: string
  type: "video" | "quiz" | "project"
  preview: boolean
  completed: boolean
}

interface Review {
  id: number
  name: string
  avatar: string
  rating: number
  date: string
  comment: string
}

// Mock data generators for features not yet available in backend
const generateMockModules = (): Module[] => [
  {
    id: 1,
    title: "Getting Started",
    description: "Learn the fundamentals and set up your development environment",
    duration: "3 hours",
    videoCount: 8,
    completed: false,
    videos: [
      { id: 1, title: "Introduction", duration: "12:30", type: "video", preview: true, completed: false },
      { id: 2, title: "Setting up Environment", duration: "18:45", type: "video", preview: false, completed: false },
      { id: 3, title: "Your First Component", duration: "25:20", type: "video", preview: false, completed: false },
      { id: 4, title: "Understanding Concepts", duration: "22:15", type: "video", preview: false, completed: false },
      { id: 5, title: "Hands-on Practice", duration: "28:30", type: "video", preview: false, completed: false },
      { id: 6, title: "Best Practices", duration: "20:45", type: "video", preview: false, completed: false },
      { id: 7, title: "Advanced Techniques", duration: "32:10", type: "video", preview: false, completed: false },
      { id: 8, title: "Module Project", duration: "45:30", type: "project", preview: false, completed: false },
    ],
  },
  {
    id: 2,
    title: "Advanced Concepts",
    description: "Dive deeper with advanced patterns and techniques",
    duration: "8 hours",
    videoCount: 12,
    completed: false,
    videos: [
      { id: 9, title: "Advanced Introduction", duration: "35:20", type: "video", preview: false, completed: false },
      { id: 10, title: "Complex Patterns", duration: "42:15", type: "video", preview: false, completed: false },
      { id: 11, title: "Custom Solutions", duration: "38:45", type: "video", preview: false, completed: false },
      { id: 12, title: "API Integration", duration: "45:30", type: "video", preview: false, completed: false },
      { id: 13, title: "State Management", duration: "40:20", type: "video", preview: false, completed: false },
      { id: 14, title: "Performance Optimization", duration: "50:15", type: "video", preview: false, completed: false },
      { id: 15, title: "Error Handling", duration: "25:30", type: "video", preview: false, completed: false },
      { id: 16, title: "Testing Strategies", duration: "55:45", type: "video", preview: false, completed: false },
      { id: 17, title: "Advanced Patterns", duration: "48:20", type: "video", preview: false, completed: false },
      { id: 18, title: "Code Optimization", duration: "35:15", type: "video", preview: false, completed: false },
      { id: 19, title: "Module Quiz", duration: "15:00", type: "quiz", preview: false, completed: false },
      { id: 20, title: "Capstone Project", duration: "90:30", type: "project", preview: false, completed: false },
    ],
  },
]

const generateMockRequirements = (): string[] => [
  "Basic computer literacy",
  "Internet connection for online content",
  "Willingness to learn and practice",
  "No prior experience required",
]

const generateMockWhatYouWillLearn = (): string[] => [
  "Master the core concepts and fundamentals",
  "Build real-world projects from scratch",
  "Understand industry best practices",
  "Develop problem-solving skills",
  "Create professional-quality work",
  "Gain confidence in your abilities",
]

const generateMockReviews = (): Review[] => [
  {
    id: 1,
    name: "Alex Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    date: "2 weeks ago",
    comment: "Excellent course! Very clear explanations and practical examples. Highly recommended!",
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    date: "1 month ago",
    comment: "Best course I've taken. The structure makes it easy to follow along and learn effectively.",
  },
  {
    id: 3,
    name: "David Kim",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    date: "3 weeks ago",
    comment: "Great content and well-organized. Looking forward to more advanced topics in future updates.",
  },
]

export function CourseDetail({ courseId }: CourseDetailProps) {
  const [course, setCourse] = useState<DetailedCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [expandedModules, setExpandedModules] = useState<number[]>([1])
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await courseApi.getCourseById(courseId.toString())
        
        if (response.data) {
          // Transform API response to detailed course format
          const courseData = response.data
          const detailedCourse: DetailedCourse = {
            id: courseData.id,
            title: courseData.title,
            description: courseData.description,
            category: courseData.category,
            level: courseData.level,
            price: courseData.price,
            finalPrice: courseData.finalPrice,
            discount: courseData.discount ?? undefined,
            instructorName: courseData.instructorName,
            totalStudents: courseData.totalStudents,
            totalReviews: courseData.totalReviews,
            averageRating: courseData.averageRating ?? 0,
            totalLessons: courseData.totalLessons,
            thumbnailUrl: courseData.thumbnailUrl ?? undefined,
            instructor: {
              name: courseData.instructorName || "Unknown Instructor",
              bio: "Experienced instructor with years of practical knowledge and teaching experience.",
              avatar: "/placeholder.svg?height=100&width=100",
              rating: courseData.averageRating ?? 4.5,
              students: courseData.totalStudents,
              courses: 5, // Mock data
            },
            originalPrice: courseData.discount && courseData.discount > 0 
              ? Math.round(courseData.finalPrice / (1 - courseData.discount / 100))
              : undefined,
            duration: `${Math.ceil((courseData.totalLessons || 10) * 0.5)} hours`, // Estimate based on lessons
            language: "English",
            lastUpdated: "Recently updated",
            image: courseData.thumbnailUrl || "/placeholder.svg?height=400&width=600",
            enrolled: false, // TODO: Check enrollment status from backend
            completionRate: 0,
            modules: generateMockModules(),
            requirements: generateMockRequirements(),
            whatYouWillLearn: generateMockWhatYouWillLearn(),
            reviews: generateMockReviews(),
          }
          
          setCourse(detailedCourse)
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

  const handleEnroll = () => {
    setShowPayment(true)
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const getVideoIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4" />
      case "quiz":
        return <BookOpen className="h-4 w-4" />
      case "project":
        return <Award className="h-4 w-4" />
      default:
        return <PlayCircle className="h-4 w-4" />
    }
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

  const totalVideos = course.modules.reduce((acc, module) => acc + module.videoCount, 0)
  const completedVideos = course.modules.reduce(
    (acc, module) => acc + module.videos.filter((video) => video.completed).length,
    0,
  )
  const overallProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden relative group">
            <img
              src={course.image}
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
            <div className="absolute top-4 left-4">
              <Badge className="bg-green-500 text-white">Preview Available</Badge>
            </div>
          </div>

          <div>
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              <Badge variant="outline">{course.language}</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{course.description}</p>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg font-medium">Instructor:</span>
              <span className="text-lg text-primary font-semibold">{course.instructor.name}</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.averageRating?.toFixed(1) || '0.0'}</span>
                <span>({(course.totalStudents || 0).toLocaleString()} students)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <PlayCircle className="h-4 w-4" />
                <span>{totalVideos} videos</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">Last updated: {course.lastUpdated}</div>
          </div>
        </div>

        {/* Enrollment Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold">${course.finalPrice.toFixed(2)}</span>
                {course.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">${course.originalPrice.toFixed(2)}</span>
                )}
                {course.originalPrice && (
                  <Badge variant="destructive" className="ml-auto">
                    {Math.round(((course.originalPrice - course.finalPrice) / course.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>
              <CardDescription>Full lifetime access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.enrolled ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Course Progress</span>
                      <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="w-full" />
                  </div>
                  <Button className="w-full" size="lg">
                    Continue Learning
                  </Button>
                </div>
              ) : (
                <Button onClick={handleEnroll} className="w-full" size="lg">
                  Enroll Now
                </Button>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-500" />
                  <span>Downloadable resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-500" />
                  <span>Certificate of completion</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content Tabs */}
      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Course Content</h3>
            <div className="text-sm text-muted-foreground">
              {course.modules.length} modules • {totalVideos} videos • {course.duration}
            </div>
          </div>

          <div className="space-y-4">
            {course.modules.map((module) => (
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
                            <CardDescription>{module.description}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{module.videoCount} videos</div>
                          <div>{module.duration}</div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {module.videos.map((video, index) => (
                          <div
                            key={video.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                {getVideoIcon(video.type)}
                              </div>
                              <div>
                                <p className="font-medium group-hover:text-primary transition-colors">{video.title}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {video.type} • {video.duration}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {video.preview && (
                                <Badge variant="outline" className="text-xs">
                                  Preview
                                </Badge>
                              )}
                              {!course.enrolled && !video.preview ? (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              ) : video.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Button variant="ghost" size="sm">
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Student Reviews</h3>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-semibold">{course.averageRating?.toFixed(1) || '0.0'}</span>
              <span className="text-muted-foreground">({course.totalReviews || 0} reviews)</span>
            </div>
          </div>

          <div className="space-y-4">
            {course.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage
                        src={review.avatar}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                        }}
                      />
                      <AvatarFallback>
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold">{review.name}</h5>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Requirements</h3>
              <ul className="space-y-3">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">What you'll learn</h3>
              <ul className="space-y-3">
                {course.whatYouWillLearn.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
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
