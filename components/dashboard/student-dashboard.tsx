'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { courseApi } from '@/services/course-api'
import { DashboardCourseResponseDTO } from '@/types/course'
import {
  Award,
  BookOpen,
  Clock,
  Download,
  Flame,
  Play,
  Share2,
  Trophy
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CompletionCertificate } from './completion-certificate'
import { CourseCard } from './course-card'

export function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [dashboardCourses, setDashboardCourses] = useState<
    DashboardCourseResponseDTO[]
  >([])
  const [recommendedCourses, setRecommendedCourses] = useState<
    DashboardCourseResponseDTO[]
  >([])
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const certificateRef = useRef<HTMLDivElement>(null)
  const [showHiddenCertificate, setShowHiddenCertificate] = useState(false)
  const hiddenCertificateRef = useRef<HTMLDivElement>(null)
  const [learningStreak, setLearningStreak] = useState(0)

  useEffect(() => {
    // Xóa các key không cần thiết trong localStorage
    localStorage.removeItem('lastShownStreakDate');
    localStorage.removeItem('lastShownStreakForToast');
    localStorage.removeItem('lastStreakToastDate');

    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchDashboardCourses()
    fetchRecommendedCourses()
    calculateLearningStreak()
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

  const fetchRecommendedCourses = async () => {
    try {
      const response = await courseApi.getRecommendedCourses()
      setRecommendedCourses(response.data)
    } catch (error) {
      console.error('Error fetching recommended courses:', error)
      toast.error('Failed to load recommended courses')
    }
  }

  const calculateLearningStreak = () => {
    const lastStudyDate = localStorage.getItem('lastStudyDate')
    const currentStreak = parseInt(
      localStorage.getItem('learningStreak') || '0'
    )

    const today = new Date().toDateString()

    if (lastStudyDate === today) {
      setLearningStreak(currentStreak)
    } else {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastStudyDate === yesterday.toDateString()) {
        const newStreak = currentStreak + 1
        localStorage.setItem('learningStreak', newStreak.toString())
        localStorage.setItem('lastStudyDate', today)
        setLearningStreak(newStreak)
      } else {
        localStorage.setItem('learningStreak', '1')
        localStorage.setItem('lastStudyDate', today)
        setLearningStreak(1)
      }
    }
  }

  const enrolledCourses = dashboardCourses
  const activeCourses = dashboardCourses.filter(course => !course.completed)
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

  const handleDownloadPDF = async () => {
    if (user && selectedCertificate) {
      setShowHiddenCertificate(true)
      setTimeout(async () => {
        if (hiddenCertificateRef.current) {
          try {
            // Check if running in browser
            if (typeof window === 'undefined') {
              console.error('PDF generation is only available in the browser')
              toast.error('PDF generation is not available')
              return
            }

            // Dynamic import with proper handling for Next.js
            const html2pdf = (await import('html2pdf.js')) as any
            
            const opt = {
              margin: 0,
              filename: `certificate-${selectedCertificate.title}.pdf`,
              image: { type: 'jpeg', quality: 1 },
              html2canvas: { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                allowTaint: true,
                foreignObjectRendering: true
              },
              jsPDF: { unit: 'px', format: [1024, 724], orientation: 'landscape' as const },
            }
            
            const pdfElement = document.getElementById('certificate-pdf')
            if (pdfElement) {
              await html2pdf().set(opt).from(pdfElement).save()
            }
            toast.success('Certificate downloaded successfully!')
          } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate PDF. Please try again.')
          }
        }
        setShowHiddenCertificate(false)
      }, 200)
    }
  }

  // Debug: log user khi render certificate ẩn
  if (showHiddenCertificate && user) {
    console.log('DEBUG user for certificate:', user)
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
            <BookOpen className='h-5 w-5 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{enrolledCourses.length}</div>
            <p className='text-xs text-muted-foreground'>
              Total enrolled courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Completed Courses
            </CardTitle>
            <Trophy className='h-5 w-5 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{completedCourses.length}</div>
            <p className='text-xs text-muted-foreground'>Certificates earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Learning Streak
            </CardTitle>
            <Flame className='h-5 w-5 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold flex items-center gap-2'>
              {learningStreak} days
            </div>
            <p className='text-xs text-muted-foreground'>
              Keep it going!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Study Time</CardTitle>
            <Clock className='h-5 w-5 text-purple-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(
                enrolledCourses.reduce(
                  (acc, course) => acc + course.totalDuration,
                  0
                ) / 3600
              ).toFixed(1)}
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
          {activeCourses.length > 0 ? (
            <div className='space-y-4'>
              <h2 className='text-2xl font-bold'>Continue Learning</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {activeCourses.map((course, index) => (
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
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
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

      {/* Recommended Courses Section */}
      <div className='mt-12 space-y-6'>
        <div>
          <h2 className='text-2xl font-bold'>Recommended for You</h2>
          <p className='text-muted-foreground'>
            Courses we think you'll love based on your interests
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {recommendedCourses.map((course, index) => (
            <Card
              key={`recommended-${course.title}-${index}`}
              className='overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col'
            >
              <div className='aspect-video bg-muted'>
                <img
                  src={course.thumbnailUrl || '/placeholder.svg'}
                  alt={course.title}
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='flex flex-col flex-1'>
                <CardHeader>
                  <CardTitle className='line-clamp-1'>{course.title}</CardTitle>
                  <CardDescription>by {course.instructorName}</CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col flex-1'>
                  <div className='flex-1'>
                    <p className='text-sm text-muted-foreground line-clamp-2 mb-4'>
                      {course.description}
                    </p>
                  </div>
                  <div className='flex items-center justify-between mb-4 w-full'>
                    <Badge variant='secondary'>{course.category}</Badge>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Clock className='h-4 w-4' />
                      {course.totalDuration}h • {course.totalLessons} lessons
                    </div>
                  </div>
                  <Link href={`/courses/${course.title}`}>
                    <Button className='w-full'>
                      <Play className='h-4 w-4 mr-2' />
                      View Course
                    </Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Certificate Modal */}
      <Dialog
        open={showCertificateModal}
        onOpenChange={setShowCertificateModal}
      >
        <DialogContent className='max-w-6xl w-full max-h-[90vh] overflow-y-auto'>
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

          {selectedCertificate && user && (
            <div className='space-y-6 flex flex-col items-center'>
              <div className="w-full flex justify-center">
                <div ref={certificateRef} className="w-full max-w-5xl">
                  <CompletionCertificate
                    courseTitle={selectedCertificate.title}
                    instructor={selectedCertificate.instructorName}
                    completionDate={
                      selectedCertificate.completedDate
                        ? new Date(selectedCertificate.completedDate)
                        : undefined
                    }
                    studentName={user.name || user.email || 'Student'}
                    certificateId={`CERT-${selectedCertificate.title}-${Date.now()}`}
                    elementId="certificate-modal"
                    isPdfVersion={false}
                  />
                </div>
              </div>
              <div className='flex justify-center gap-4 mt-0'>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Share2 className='h-4 w-4' />
                  Share Certificate
                </Button>
                <Button
                  className='flex items-center gap-2'
                  onClick={handleDownloadPDF}
                >
                  <Download className='h-4 w-4' />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
          {selectedCertificate && !user && (
            <div className='flex justify-center items-center min-h-[200px]'>
              <span>Loading user information...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Render certificate ẩn ngoài modal để export PDF */}
      {showHiddenCertificate && user && selectedCertificate && (
        <div className="fixed left-[-9999px] top-0 w-0 h-0 overflow-hidden">
          <CompletionCertificate
            courseTitle={selectedCertificate.title}
            instructor={selectedCertificate.instructorName}
            completionDate={
              selectedCertificate.completedDate
                ? new Date(selectedCertificate.completedDate)
                : undefined
            }
            studentName={user.name || user.email || 'Student'}
            certificateId={`CERT-${selectedCertificate.title}-${Date.now()}`}
            elementId="certificate-pdf"
            isPdfVersion={true}
          />
        </div>
      )}
    </div>
  )
}
