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
import { enrollmentApi } from "@/api/enrollment-api"
import { certificateApi } from "@/api/certificate-api"
import type { EnrollmentResponseDTO } from "@/types/enrollment"

export function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentResponseDTO[]>([])
  const [completedCourses, setCompletedCourses] = useState<EnrollmentResponseDTO[]>([])
  const [totalEnrolledCourses, setTotalEnrolledCourses] = useState<number>(0)
  const [totalCompletedCourses, setTotalCompletedCourses] = useState<number>(0)
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("user")
        if (!userData) {
          console.error("No user data found in localStorage")
          return
        }
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Fetch total enrolled courses count
        const countResponse = await enrollmentApi.getEnrolledCount()
        console.log("Count response:", countResponse)
        if (countResponse?.data) {
          setTotalEnrolledCourses(Number(countResponse.data))
        }

        // Fetch total completed courses count
        const certificateCountResponse = await certificateApi.getCertificateCount()
        console.log("Certificate count response:", certificateCountResponse)
        if (certificateCountResponse?.data) {
          setTotalCompletedCourses(Number(certificateCountResponse.data))
        }

        // Fetch enrolled courses with pagination
        const enrolledResponse = await enrollmentApi.getEnrolledCourses({
          page: 0,
          size: 10,
          sort: "createdDate,desc"
        })
        console.log("Enrolled courses response:", enrolledResponse)

        if (enrolledResponse?.data?.content) {
          // Separate enrolled and completed courses based on status
          const enrolled = enrolledResponse.data.content.filter(
            enrollment => enrollment.status === "ENROLLED"
          )
          const completed = enrolledResponse.data.content.filter(
            enrollment => enrollment.status === "COMPLETED"
          )

          setEnrolledCourses(enrolled)
          setCompletedCourses(completed)
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalProgress = enrolledCourses.length > 0
    ? enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length
    : 0

  const handleViewCertificate = (course: EnrollmentResponseDTO) => {
    setSelectedCertificate(course)
    setShowCertificateModal(true)
  }

  if (loading) {
    return <div>Loading...</div>
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
            <div className="text-2xl font-bold">{totalEnrolledCourses}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletedCourses}</div>
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
                {enrolledCourses.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted">
                      {enrollment.course && (
                        <img
                          src={enrollment.course.thumbnailUrl || "/placeholder.svg"}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{enrollment.course?.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <span>Course ID: {enrollment.courseId}</span>
                          <span>•</span>
                          <span>{enrollment.course?.level}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          Enrolled: {new Date(enrollment.createdDate || '').toLocaleDateString()}
                        </Badge>
                        <Link href={`/learn/${enrollment.courseId}`}>
                          <Button size="sm">
                            <Play className="w-4 h-4 mr-2" />
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
            <div className="text-center py-10">
              <h3 className="text-lg font-semibold">No active courses</h3>
              <p className="text-muted-foreground">Enroll in a course to start learning</p>
              <Link href="/courses">
                <Button className="mt-4">Browse Courses</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        {/* Completed Courses Tab */}
        <TabsContent value="completed" className="space-y-6">
          {completedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedCourses.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{enrollment.course?.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <span>Completed: {new Date(enrollment.completionDate || '').toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Grade: {enrollment.grade || 'N/A'}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge>Final Grade: {enrollment.grade || 'N/A'}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCertificate(enrollment)}
                      >
                        <Award className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-semibold">No completed courses yet</h3>
              <p className="text-muted-foreground">Keep learning to earn certificates</p>
            </div>
          )}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates">
          {completedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedCourses.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{enrollment.course?.title}</CardTitle>
                    <CardDescription>Completed on: {new Date(enrollment.completionDate || '').toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge>Grade: {enrollment.grade || 'N/A'}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCertificate(enrollment)}
                      >
                        <Award className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-semibold">No certificates yet</h3>
              <p className="text-muted-foreground">Complete courses to earn certificates</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Certificate Modal */}
      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Course Completion Certificate</DialogTitle>
            <DialogDescription>
              Congratulations on completing {selectedCertificate?.course?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <CompletionCertificate
              studentName={user?.name || user?.email}
              courseTitle={selectedCertificate.course?.title || ''}
              instructor={selectedCertificate.course?.instructor || 'Course Instructor'}
              completionDate={new Date(selectedCertificate.completionDate || new Date())}
              certificateId={`CERT-${selectedCertificate.id}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
