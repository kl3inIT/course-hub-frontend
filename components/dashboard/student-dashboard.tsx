"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen, Clock, Award, TrendingUp, Play, Download, Trophy, Calendar, Share2, Eye } from "lucide-react"
import Link from "next/link"
import { CompletionCertificate } from "../learning/completion-certificate"

const enrolledCoursesData = [
  {
    id: 1,
    title: "React.js Fundamentals",
    instructor: "John Doe",
    progress: 65,
    totalLessons: 12,
    completedLessons: 8,
    lastAccessed: "2 hours ago",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    instructor: "Jane Smith",
    progress: 30,
    totalLessons: 15,
    completedLessons: 4,
    lastAccessed: "1 day ago",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
]

const completedCoursesData = [
  {
    id: 3,
    title: "HTML & CSS Mastery",
    instructor: "Sarah Wilson",
    completionDate: "2024-01-15",
    totalLessons: 20,
    duration: "8 hours",
    certificateId: "CERT-3-1705123200000",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "JavaScript Essentials",
    instructor: "Mike Johnson",
    completionDate: "2024-01-10",
    totalLessons: 18,
    duration: "6 hours",
    certificateId: "CERT-4-1704844800000",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
]

export function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [completedCourses, setCompletedCourses] = useState<any[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Load enrolled courses
    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses") || "[]")
    const coursesWithProgress = enrolledCoursesData.filter((course) => enrolled.includes(course.id))
    setEnrolledCourses(coursesWithProgress)

    // Load completed courses from localStorage
    const completed = JSON.parse(localStorage.getItem("completedCourses") || "[]")
    // Merge with sample data for demonstration
    const allCompleted = [...completedCoursesData, ...completed]
    setCompletedCourses(allCompleted)
  }, [])

  const totalProgress =
    enrolledCourses.length > 0
      ? enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length
      : 0

  const totalCompletedLessons = enrolledCourses.reduce((acc, course) => acc + course.completedLessons, 0)

  const handleViewCertificate = (course: any) => {
    setSelectedCertificate(course)
    setShowCertificateModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || user?.email}!</h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCourses.length}</div>
            <p className="text-xs text-muted-foreground">Certificates earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalProgress)}%</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed Courses</TabsTrigger>
          <TabsTrigger value="certificates">My Certificates</TabsTrigger>
        </TabsList>

        {/* Active Courses Tab */}
        <TabsContent value="active" className="space-y-6">
          {enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Continue Learning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                      <CardDescription>by {course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                        <p className="text-xs text-muted-foreground">
                          {course.completedLessons} of {course.totalLessons} lessons completed
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Last accessed {course.lastAccessed}</Badge>
                        <Link href={`/learn/${course.id}`}>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active courses</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start your learning journey by enrolling in a course
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Courses Tab */}
        <TabsContent value="completed" className="space-y-6">
          {completedCourses.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Completed Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Trophy className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                      <CardDescription>by {course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Completed on {formatDate(course.completionDate)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {course.duration} • {course.totalLessons} lessons
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCertificate(course)}
                          className="flex items-center gap-2"
                        >
                          <Award className="h-4 w-4" />
                          View Certificate
                        </Button>
                        <Link href={`/courses/${course.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No completed courses yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Complete your first course to earn a certificate
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          {completedCourses.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">My Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((course) => (
                  <Card key={course.certificateId} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <div className="flex items-center justify-between">
                        <Award className="h-8 w-8" />
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          Certificate
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Completed: {formatDate(course.completionDate)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Certificate ID: {course.certificateId}</div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCertificate(course)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCertificate(course)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Complete courses to earn certificates and showcase your achievements
                </p>
                <Link href="/courses">
                  <Button>Start Learning</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Recommended Courses */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 5, title: "UI/UX Design Principles", instructor: "Mike Johnson", price: 79 },
            { id: 6, title: "Node.js Backend Development", instructor: "Sarah Wilson", price: 129 },
            { id: 7, title: "Python for Beginners", instructor: "Alex Brown", price: 89 },
          ].map((course) => (
            <Card key={course.id}>
              <div className="aspect-video bg-muted">
                <img
                  src="/placeholder.svg?height=200&width=300"
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                <CardDescription>by {course.instructor}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">${course.price}</span>
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="outline" size="sm">
                      View Course
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Certificate Modal */}
      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Certificate of Completion
            </DialogTitle>
            <DialogDescription>
              {selectedCertificate && `Certificate for ${selectedCertificate.title}`}
            </DialogDescription>
          </DialogHeader>

          {selectedCertificate && (
            <div className="space-y-6">
              <CompletionCertificate
                courseTitle={selectedCertificate.title}
                instructor={selectedCertificate.instructor}
                completionDate={new Date(selectedCertificate.completionDate)}
                studentName={user?.name || user?.email || "Student"}
                certificateId={selectedCertificate.certificateId}
              />

              <div className="flex justify-center gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Certificate
                </Button>
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
