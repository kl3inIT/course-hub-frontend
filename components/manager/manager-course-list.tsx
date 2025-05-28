"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, MoreVertical, Eye, Edit, Trash2, BookOpen, Users, DollarSign, Star, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  status: "published" | "draft" | "archived"
  level: "beginner" | "intermediate" | "advanced"
  enrollments: number
  revenue: number
  rating: number
  reviews: number
  lastUpdated: string
  category: string
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "React Fundamentals",
    description: "Learn the basics of React including components, state, and props",
    thumbnail: "/placeholder.svg?height=200&width=300",
    status: "published",
    level: "beginner",
    enrollments: 1234,
    revenue: 24680,
    rating: 4.8,
    reviews: 156,
    lastUpdated: "2024-01-15",
    category: "Web Development",
  },
  {
    id: "2",
    title: "Advanced JavaScript",
    description: "Master advanced JavaScript concepts and patterns",
    thumbnail: "/placeholder.svg?height=200&width=300",
    status: "published",
    level: "advanced",
    enrollments: 892,
    revenue: 35640,
    rating: 4.9,
    reviews: 89,
    lastUpdated: "2024-01-10",
    category: "Programming",
  },
  {
    id: "3",
    title: "CSS Mastery",
    description: "Complete guide to modern CSS techniques",
    thumbnail: "/placeholder.svg?height=200&width=300",
    status: "draft",
    level: "intermediate",
    enrollments: 0,
    revenue: 0,
    rating: 0,
    reviews: 0,
    lastUpdated: "2024-01-20",
    category: "Web Development",
  },
  {
    id: "4",
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js",
    thumbnail: "/placeholder.svg?height=200&width=300",
    status: "published",
    level: "intermediate",
    enrollments: 567,
    revenue: 17010,
    rating: 4.7,
    reviews: 67,
    lastUpdated: "2024-01-08",
    category: "Backend",
  },
]

export function ManagerCourseList() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("title")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; course: Course | null }>({
    open: false,
    course: null,
  })
  const [deleting, setDeleting] = useState(false)

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || course.status === statusFilter
      const matchesLevel = levelFilter === "all" || course.level === levelFilter

      return matchesSearch && matchesStatus && matchesLevel
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "enrollments":
          return b.enrollments - a.enrollments
        case "revenue":
          return b.revenue - a.revenue
        case "rating":
          return b.rating - a.rating
        case "lastUpdated":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [courses, searchTerm, statusFilter, levelFilter, sortBy])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleDeleteCourse = async (course: Course) => {
    try {
      setDeleting(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate random failure for demo
      if (Math.random() < 0.1) {
        throw new Error("Failed to delete course. Please try again.")
      }

      // Remove course from list
      setCourses((prev) => prev.filter((c) => c.id !== course.id))

      toast({
        title: "Course Deleted",
        description: `"${course.title}" has been successfully deleted.`,
      })

      setDeleteDialog({ open: false, course: null })
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

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "default",
      draft: "secondary",
      archived: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  const getLevelBadge = (level: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
    }

    return <Badge className={colors[level as keyof typeof colors]}>{level}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage and track your course portfolio</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.filter((c) => c.status === "published").length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + course.enrollments, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${courses.reduce((sum, course) => sum + course.revenue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                courses.filter((c) => c.rating > 0).reduce((sum, course) => sum + course.rating, 0) /
                  courses.filter((c) => c.rating > 0).length || 0
              ).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">From student reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="enrollments">Enrollments</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="lastUpdated">Last Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={course.thumbnail || "/placeholder.svg"} className="object-cover" />
                <AvatarFallback className="rounded-none">{course.title[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/manager/courses/${course.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/courses/${course.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview Course
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/manager/courses/${course.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Course
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteDialog({ open: true, course })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  {getStatusBadge(course.status)}
                  {getLevelBadge(course.level)}
                </div>
              </div>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="line-clamp-3">{course.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    {course.enrollments.toLocaleString()} students
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-1 h-3 w-3" />${course.revenue.toLocaleString()}
                  </div>
                  {course.rating > 0 && (
                    <>
                      <div className="flex items-center">
                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.rating} ({course.reviews})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {new Date(course.lastUpdated).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/manager/courses/${course.id}`}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/manager/courses/${course.id}/edit`}>
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No courses found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search criteria or create a new course.
            </p>
            <Button className="mt-4">Create New Course</Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, course: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {deleteDialog.course && (
                <>
                  <p>This action cannot be undone. This will permanently delete the course:</p>
                  <p className="font-semibold">"{deleteDialog.course.title}"</p>
                  <p>This will also:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Remove all course materials and content</li>
                    <li>Unenroll all {deleteDialog.course.enrollments} students</li>
                    <li>Delete all student progress data</li>
                    <li>Remove all reviews and ratings</li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.course && handleDeleteCourse(deleteDialog.course)}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
