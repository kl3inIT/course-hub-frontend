"use client"

import { useState } from "react"
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
} from "lucide-react"
import { PaymentModal } from "./payment-modal"

interface CourseDetailProps {
  courseId: string
}

const courseData = {
  1: {
    id: 1,
    title: "Complete React.js Development Course",
    description:
      "Master React.js from fundamentals to advanced concepts. Build real-world projects and learn industry best practices with hands-on coding exercises.",
    instructor: {
      name: "Sarah Johnson",
      bio: "Senior Frontend Developer at Google with 10+ years of experience. Specialized in React, TypeScript, and modern web development.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.9,
      students: 15420,
      courses: 8,
    },
    price: 129,
    originalPrice: 199,
    rating: 4.8,
    students: 12340,
    duration: "42 hours",
    category: "Web Development",
    level: "Beginner to Advanced",
    language: "English",
    lastUpdated: "December 2024",
    image: "/placeholder.svg?height=400&width=600",
    enrolled: false,
    completionRate: 0,
    modules: [
      {
        id: 1,
        title: "Getting Started with React",
        description: "Learn the fundamentals of React and set up your development environment",
        duration: "3 hours",
        videoCount: 8,
        completed: false,
        videos: [
          { id: 1, title: "What is React?", duration: "12:30", type: "video", preview: true, completed: false },
          {
            id: 2,
            title: "Setting up Development Environment",
            duration: "18:45",
            type: "video",
            preview: false,
            completed: false,
          },
          {
            id: 3,
            title: "Your First React Component",
            duration: "25:20",
            type: "video",
            preview: false,
            completed: false,
          },
          { id: 4, title: "Understanding JSX", duration: "22:15", type: "video", preview: false, completed: false },
          { id: 5, title: "Props and Components", duration: "28:30", type: "video", preview: false, completed: false },
          { id: 6, title: "Handling Events", duration: "20:45", type: "video", preview: false, completed: false },
          {
            id: 7,
            title: "State Management Basics",
            duration: "32:10",
            type: "video",
            preview: false,
            completed: false,
          },
          { id: 8, title: "Module 1 Project", duration: "45:30", type: "project", preview: false, completed: false },
        ],
      },
      {
        id: 2,
        title: "Advanced React Concepts",
        description: "Dive deeper into React with hooks, context, and advanced patterns",
        duration: "8 hours",
        videoCount: 12,
        completed: false,
        videos: [
          { id: 9, title: "Introduction to Hooks", duration: "35:20", type: "video", preview: false, completed: false },
          {
            id: 10,
            title: "useState and useEffect",
            duration: "42:15",
            type: "video",
            preview: false,
            completed: false,
          },
          { id: 11, title: "Custom Hooks", duration: "38:45", type: "video", preview: false, completed: false },
          { id: 12, title: "Context API", duration: "45:30", type: "video", preview: false, completed: false },
          { id: 13, title: "useReducer Hook", duration: "40:20", type: "video", preview: false, completed: false },
          {
            id: 14,
            title: "Performance Optimization",
            duration: "50:15",
            type: "video",
            preview: false,
            completed: false,
          },
          { id: 15, title: "Error Boundaries", duration: "25:30", type: "video", preview: false, completed: false },
          {
            id: 16,
            title: "Testing React Components",
            duration: "55:45",
            type: "video",
            preview: false,
            completed: false,
          },
          { id: 17, title: "Advanced Patterns", duration: "48:20", type: "video", preview: false, completed: false },
          { id: 18, title: "Code Splitting", duration: "35:15", type: "video", preview: false, completed: false },
          { id: 19, title: "Module 2 Quiz", duration: "15:00", type: "quiz", preview: false, completed: false },
          { id: 20, title: "Advanced Project", duration: "90:30", type: "project", preview: false, completed: false },
        ],
      },
      {
        id: 3,
        title: "Building Real-World Applications",
        description: "Create production-ready applications with modern tools and best practices",
        duration: "12 hours",
        videoCount: 15,
        completed: false,
        videos: [
          { id: 21, title: "Project Planning", duration: "30:20", type: "video", preview: false, completed: false },
          { id: 22, title: "Setting up Next.js", duration: "25:15", type: "video", preview: false, completed: false },
          {
            id: 23,
            title: "Routing and Navigation",
            duration: "40:30",
            type: "video",
            preview: false,
            completed: false,
          },
          { id: 24, title: "API Integration", duration: "45:45", type: "video", preview: false, completed: false },
          { id: 25, title: "Authentication", duration: "55:20", type: "video", preview: false, completed: false },
          { id: 26, title: "Database Integration", duration: "50:15", type: "video", preview: false, completed: false },
          {
            id: 27,
            title: "State Management with Redux",
            duration: "60:30",
            type: "video",
            preview: false,
            completed: false,
          },
          {
            id: 28,
            title: "Styling with Tailwind CSS",
            duration: "35:45",
            type: "video",
            preview: false,
            completed: false,
          },
          { id: 29, title: "Form Handling", duration: "40:20", type: "video", preview: false, completed: false },
          { id: 30, title: "File Upload", duration: "30:15", type: "video", preview: false, completed: false },
          { id: 31, title: "Testing Strategies", duration: "45:30", type: "video", preview: false, completed: false },
          { id: 32, title: "Deployment", duration: "35:45", type: "video", preview: false, completed: false },
          {
            id: 33,
            title: "Performance Monitoring",
            duration: "25:20",
            type: "video",
            preview: false,
            completed: false,
          },
          { id: 34, title: "Final Quiz", duration: "20:00", type: "quiz", preview: false, completed: false },
          { id: 35, title: "Capstone Project", duration: "120:30", type: "project", preview: false, completed: false },
        ],
      },
    ],
    requirements: [
      "Basic knowledge of HTML and CSS",
      "JavaScript fundamentals (ES6+)",
      "A computer with internet connection",
      "Code editor (VS Code recommended)",
    ],
    whatYouWillLearn: [
      "Build React applications from scratch",
      "Master React hooks and modern patterns",
      "Implement state management solutions",
      "Create responsive and interactive UIs",
      "Deploy applications to production",
      "Write clean, maintainable code",
    ],
    reviews: [
      {
        id: 1,
        name: "Alex Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2 weeks ago",
        comment:
          "Excellent course! Sarah explains complex concepts in a very clear way. The projects are practical and helped me land my first React job.",
      },
      {
        id: 2,
        name: "Maria Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "1 month ago",
        comment:
          "Best React course I've taken. The module structure makes it easy to follow along and the hands-on projects are fantastic.",
      },
      {
        id: 3,
        name: "David Kim",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "3 weeks ago",
        comment:
          "Great content and well-organized. Would love to see more advanced deployment strategies in future updates.",
      },
    ],
  },
}

export function CourseDetail({ courseId }: CourseDetailProps) {
  const [showPayment, setShowPayment] = useState(false)
  const [expandedModules, setExpandedModules] = useState<number[]>([1])
  const course = courseData[courseId as keyof typeof courseData]

  if (!course) {
    return <div>Course not found</div>
  }

  const handleEnroll = () => {
    setShowPayment(true)
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const totalVideos = course.modules.reduce((acc, module) => acc + module.videoCount, 0)
  const completedVideos = course.modules.reduce(
    (acc, module) => acc + module.videos.filter((video) => video.completed).length,
    0,
  )
  const overallProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0

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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden relative group">
            <img
              src="/placeholder.svg?height=400&width=600"
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
                <span className="font-medium">{course.rating}</span>
                <span>({course.students.toLocaleString()} students)</span>
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
                <span className="text-3xl font-bold">${course.price}</span>
                {course.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">${course.originalPrice}</span>
                )}
                {course.originalPrice && (
                  <Badge variant="destructive" className="ml-auto">
                    {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
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
              <span className="text-xl font-semibold">{course.rating}</span>
              <span className="text-muted-foreground">({course.students.toLocaleString()} reviews)</span>
            </div>
          </div>

          <div className="space-y-4">
            {course.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage
                        src="/placeholder.svg?height=40&width=40"
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

      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} course={course} />
    </div>
  )
}
