'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  Download,
  Trophy,
  Calendar,
  Share2,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import { CompletionCertificate } from '../learning/completion-certificate'
import { courseApi } from '@/api/course-api'
import { DashboardCourseResponseDTO } from '@/types/course'
import { toast } from 'sonner'
import { CourseCard } from './course-card'

export function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [dashboardCourses, setDashboardCourses] = useState<
    DashboardCourseResponseDTO[]
  >([])
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchDashboardCourses()
  }, [])

  const fetchDashboardCourses = async () => {
    try {
      setIsLoading(true)
      const response = await courseApi.getDashboardCourses()
      setDashboardCourses(response.data)
    } catch (error) {
      console.error('Error fetching dashboard courses:', error)
      toast.error('Failed to load dashboard courses')
    } finally {
      setIsLoading(false)
    }
  }

  const enrolledCourses = dashboardCourses.filter(course => !course.completed)
  const completedCourses = dashboardCourses.filter(course => course.completed)

  const totalProgress =
    enrolledCourses.length > 0
      ? enrolledCourses.reduce((acc, course) => acc + course.progress, 0) /
      enrolledCourses.length
      : 0

  const handleViewCertificate = (course: DashboardCourseResponseDTO) => {
    setSelectedCertificate(course)
    setShowCertificateModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className='text-muted-foreground'>Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Enrolled Courses
            </CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{enrolledCourses.length}</div>
            <p className='text-xs text-muted-foreground'>Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Completed Courses
            </CardTitle>
            <Trophy className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{completedCourses.length}</div>
            <p className='text-xs text-muted-foreground'>Certificates earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Progress
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {Math.round(totalProgress)}%
            </div>
            <p className='text-xs text-muted-foreground'>Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Study Time</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {enrolledCourses.reduce(
                (acc, course) => acc + course.totalDuration,
                0
              )}
              h
            </div>
            <p className='text-xs text-muted-foreground'>Total duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue='active' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='active'>Active Courses</TabsTrigger>
          <TabsTrigger value='completed'>Completed Courses</TabsTrigger>
          <TabsTrigger value='certificates'>My Certificates</TabsTrigger>
        </TabsList>

        {/* Active Courses Tab */}
        <TabsContent value='active' className='space-y-6'>
          {enrolledCourses.length > 0 ? (
            <div className='space-y-4'>
              <h2 className='text-2xl font-bold'>Continue Learning</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {enrolledCourses.map((course, index) => (
                  <CourseCard
                    key={`active-${course.title}-${index}`}
                    course={course}
                    type='active'
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <BookOpen className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>
                  No active courses
                </h3>
                <p className='text-muted-foreground text-center mb-4'>
                  Start your learning journey by enrolling in a course
                </p>
                <Link href='/courses'>
                  <Button>Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Courses Tab */}
        <TabsContent value='completed' className='space-y-6'>
          {completedCourses.length > 0 ? (
            <div className='space-y-4'>
              <h2 className='text-2xl font-bold'>Completed Courses</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {completedCourses.map((course, index) => (
                  <CourseCard
                    key={`completed-${course.title}-${index}`}
                    course={course}
                    type='completed'
                    onViewCertificate={handleViewCertificate}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Trophy className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>
                  No completed courses yet
                </h3>
                <p className='text-muted-foreground text-center mb-4'>
                  Complete your first course to earn a certificate
                </p>
                <Link href='/courses'>
                  <Button>Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value='certificates' className='space-y-6'>
          {completedCourses.length > 0 ? (
            <div className='space-y-4'>
              <h2 className='text-2xl font-bold'>My Certificates</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {completedCourses.map((course, index) => (
                  <CourseCard
                    key={`certificate-${course.title}-${index}`}
                    course={course}
                    type='certificate'
                    onViewCertificate={handleViewCertificate}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Award className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>
                  No certificates yet
                </h3>
                <p className='text-muted-foreground text-center mb-4'>
                  Complete courses to earn certificates and showcase your
                  achievements
                </p>
                <Link href='/courses'>
                  <Button>Start Learning</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Certificate Modal */}
      <Dialog
        open={showCertificateModal}
        onOpenChange={setShowCertificateModal}
      >
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Award className='h-5 w-5 text-yellow-500' />
              Certificate of Completion
            </DialogTitle>
            <DialogDescription>
              {selectedCertificate &&
                `Certificate for ${selectedCertificate.title}`}
            </DialogDescription>
          </DialogHeader>

          {selectedCertificate && (
            <div className='space-y-6'>
              <CompletionCertificate
                courseTitle={selectedCertificate.title}
                instructor={selectedCertificate.instructorName}
                completionDate={
                  new Date(selectedCertificate.completedDate || '')
                }
                studentName={user?.name || user?.email || 'Student'}
                certificateId={`CERT-${selectedCertificate.title}-${Date.now()}`}
              />

              <div className='flex justify-center gap-4'>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Share2 className='h-4 w-4' />
                  Share Certificate
                </Button>
                <Button className='flex items-center gap-2'>
                  <Download className='h-4 w-4' />
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