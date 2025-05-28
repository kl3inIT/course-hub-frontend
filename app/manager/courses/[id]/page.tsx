"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Clock,
  Star,
  Download,
  Eye,
  Play,
  FileText,
  Award,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface CourseDetail {
  id: string
  title: string
  description: string
  longDescription: string
  thumbnail: string
  status: "published" | "draft" | "archived"
  level: "beginner" | "intermediate" | "advanced"
  category: string
  price: number
  originalPrice?: number
  instructor: {
    id: string
    name: string
    email: string
    avatar: string
    bio: string
    rating: number
    totalStudents: number
  }
  enrollments: number
  revenue: number
  rating: number
  reviews: number
  totalLessons: number
  totalDuration: string
  completionRate: number
  createdAt: string
  lastUpdated: string
  materials: Array<{
    id: string
    name: string
    type: "pdf" | "video" | "document" | "quiz"
    size?: string
    downloadCount: number
  }>
  modules: Array<{
    id: string
    title: string
    description: string
    lessons: number
    duration: string
    order: number
  }>
  students: Array<{
    id: string
    name: string
    email: string
    avatar: string
    enrolledAt: string
    progress: number
    lastActivity: string
    status: "active" | "completed" | "inactive"
  }>
  analytics: {
    viewsThisMonth: number
    enrollmentsThisMonth: number
    revenueThisMonth: number
    averageRating: number
    completionRate: number
    dropoffRate: number
  }
}

// Mock data for demonstration
const mockCourseData: Record<string, CourseDetail> = {
  "1": {
    id: "1",
    title: "React Fundamentals",
    description: "Learn the basics of React including components, state, and props",
    longDescription:
      "This comprehensive course covers everything you need to know about React.js from the ground up. You'll learn about components, state management, props, hooks, and modern React patterns. Perfect for beginners who want to start their journey in modern web development.",
    thumbnail: "/placeholder.svg?height=300&width=400",
    status: "published",
    level: "beginner",
    category: "Web Development",
    price: 99,
    originalPrice: 149,
    instructor: {
      id: "inst1",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      avatar: "/placeholder.svg?height=100&width=100",
      bio: "Senior Frontend Developer with 8+ years of experience in React and modern web technologies.",
      rating: 4.9,
      totalStudents: 15420,
    },
    enrollments: 1234,
    revenue: 122166,
    rating: 4.8,
    reviews: 156,
    totalLessons: 42,
    totalDuration: "8 hours 30 minutes",
    completionRate: 78,
    createdAt: "2023-10-15",
    lastUpdated: "2024-01-15",
    materials: [
      { id: "1", name: "React Cheat Sheet.pdf", type: "pdf", size: "2.5 MB", downloadCount: 892 },
      { id: "2", name: "Project Source Code.zip", type: "document", size: "15.2 MB", downloadCount: 1156 },
      { id: "3", name: "Final Project Demo", type: "video", size: "45.8 MB", downloadCount: 567 },
      { id: "4", name: "Knowledge Check Quiz", type: "quiz", downloadCount: 1089 },
    ],
    modules: [
      {
        id: "1",
        title: "Introduction to React",
        description: "Getting started with React basics",
        lessons: 8,
        duration: "2h 15m",
        order: 1,
      },
      {
        id: "2",
        title: "Components and Props",
        description: "Understanding React components",
        lessons: 12,
        duration: "3h 30m",
        order: 2,
      },
      {
        id: "3",
        title: "State and Lifecycle",
        description: "Managing component state",
        lessons: 10,
        duration: "2h 45m",
        order: 3,
      },
      {
        id: "4",
        title: "Final Project",
        description: "Build a complete React application",
        lessons: 12,
        duration: "4h 20m",
        order: 4,
      },
    ],
    students: [
      {
        id: "1",
        name: "Alex Chen",
        email: "alex.chen@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        enrolledAt: "2024-01-10",
        progress: 85,
        lastActivity: "2024-01-20",
        status: "active",
      },
      {
        id: "2",
        name: "Maria Rodriguez",
        email: "maria.rodriguez@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        enrolledAt: "2024-01-08",
        progress: 100,
        lastActivity: "2024-01-18",
        status: "completed",
      },
      {
        id: "3",
        name: "David Kim",
        email: "david.kim@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        enrolledAt: "2024-01-05",
        progress: 45,
        lastActivity: "2024-01-15",
        status: "active",
      },
    ],
    analytics: {
      viewsThisMonth: 2456,
      enrollmentsThisMonth: 89,
      revenueThisMonth: 8811,
      averageRating: 4.8,
      completionRate: 78,
      dropoffRate: 12,
    },
  },
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const courseData = mockCourseData[courseId]
        if (!courseData) {
          setError("Course not found")
          return
        }

        setCourse(courseData)
      } catch (err) {
        setError("Failed to load course details")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleDeleteCourse = async () => {
    try {
      setDeleting(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate random failure for demo
      if (Math.random() < 0.1) {
        throw new Error("Failed to delete course. Please try again.")
      }

      toast({
        title: "Course Deleted",
        description: `"${course?.title}" has been successfully deleted.`,
      })

      router.push("/manager/courses")
    } catch (err) {
      toast({
        title: "Deletion Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">{error || "The requested course could not be found."}</p>
            <Button onClick={() => router.push("/manager/courses")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "default",
      draft: "secondary",
      archived: "outline",
    } as const

    const colors = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getLevelBadge = (level: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
    }

    return <Badge className={colors[level as keyof typeof colors]}>{level}</Badge>
  }

  const getStudentStatusBadge = (status: string) => {
    const colors = {
      active: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
    }

    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Play className="h-4 w-4" />
      case "quiz":
        return <Award className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push("/manager/courses")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">Course Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/courses/${course.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Preview Course
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/manager/courses/${course.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Course
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Course
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>This action cannot be undone. This will permanently delete the course:</p>
                  <p className="font-semibold">"{course.title}"</p>
                  <p>This will also:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Remove all course materials and content</li>
                    <li>Unenroll all {course.enrollments} students</li>
                    <li>Delete all student progress data</li>
                    <li>Remove all reviews and ratings</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCourse}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete Course"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Course Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(course.status)}
                    {getLevelBadge(course.level)}
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </div>
                <Avatar className="h-20 w-20">
                  <AvatarImage src={course.thumbnail || "/placeholder.svg"} />
                  <AvatarFallback>{course.title[0]}</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{course.longDescription}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{course.totalLessons} lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.totalDuration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.enrollments} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>
                    {course.rating} ({course.reviews} reviews)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Revenue Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="font-semibold">${course.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-semibold text-green-600">
                      +${course.analytics.revenueThisMonth.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <div className="text-right">
                      <span className="font-semibold">${course.price}</span>
                      {course.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">${course.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructor Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={course.instructor.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{course.instructor.name}</h4>
                  <p className="text-sm text-muted-foreground">{course.instructor.email}</p>
                  <p className="text-sm mt-2">{course.instructor.bio}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span>{course.instructor.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{course.instructor.totalStudents.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Views This Month</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{course.analytics.viewsThisMonth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Enrollments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{course.analytics.enrollmentsThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{course.analytics.completionRate}%</div>
                <Progress value={course.analytics.completionRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Enrolled Students ({course.students.length})</h3>
          </div>
          <div className="space-y-4">
            {course.students.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={student.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{student.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {getStudentStatusBadge(student.status)}
                      <div>
                        <div className="text-sm font-medium">{student.progress}% Complete</div>
                        <Progress value={student.progress} className="w-24" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last active: {new Date(student.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Course Modules ({course.modules.length})</h3>
          </div>
          <div className="space-y-4">
            {course.modules.map((module) => (
              <Card key={module.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{module.title}</h4>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{module.lessons} lessons</div>
                      <div>{module.duration}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Course Materials ({course.materials.length})</h3>
          </div>
          <div className="space-y-4">
            {course.materials.map((material) => (
              <Card key={material.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMaterialIcon(material.type)}
                      <div>
                        <h4 className="font-semibold">{material.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {material.type} {material.size && `• ${material.size}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Download className="h-3 w-3" />
                        <span>{material.downloadCount} downloads</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Course ID</label>
                  <p className="font-mono">{course.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p>{course.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Level</label>
                  <p className="capitalize">{course.level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="capitalize">{course.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p>{new Date(course.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p>{new Date(course.lastUpdated).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
