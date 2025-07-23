'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
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
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Download,
  Share2,
  Trophy
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [showShareMenu, setShowShareMenu] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const shareButtonRef = useRef<HTMLButtonElement>(null)
  const shareUrl = selectedCertificate
    ? `https://course.learnhub.academy/verify/CERT-${selectedCertificate.title}-${Date.now()}`
    : ''
  const shareText = selectedCertificate
    ? encodeURIComponent(
        `I just completed the course: ${selectedCertificate.title} on LearnHub! Check out my certificate.`
      )
    : ''

  useEffect(() => {
    if (!showShareMenu) return
    function handleClickOutside(event: MouseEvent) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node) &&
        shareButtonRef.current &&
        !shareButtonRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showShareMenu])

  const handleShareFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${shareText}`
    window.open(url, '_blank', 'width=600,height=600')
    setShowShareMenu(false)
  }, [shareUrl, shareText])

  const handleShareLinkedIn = useCallback(() => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=600')
    setShowShareMenu(false)
  }, [shareUrl])

  useEffect(() => {
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
        try {
          const pdfElement = document.getElementById('certificate-pdf')
          if (pdfElement) {
            const canvas = await html2canvas(pdfElement, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#fff',
            })
            const imgData = canvas.toDataURL('image/jpeg', 1.0)
            // Lấy kích thước thực tế của canvas
            const pdfWidth = canvas.width
            const pdfHeight = canvas.height
            // Chuyển px sang mm (1px = 0.264583mm)
            const mmWidth = pdfWidth * 0.264583
            const mmHeight = pdfHeight * 0.264583
            const pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'mm',
              format: [mmWidth, mmHeight],
            })
            pdf.addImage(imgData, 'JPEG', 0, 0, mmWidth, mmHeight)
            pdf.save(`certificate-${selectedCertificate.title}.pdf`)
            toast.success('Certificate downloaded successfully!')
          } else {
            toast.error('Could not find certificate to export')
          }
        } catch (error) {
          toast.error('Failed to generate PDF. Please try again.')
        }
        setShowHiddenCertificate(false)
      }, 600)
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
            <BookOpen className='h-4 w-4 text-muted-foreground' />
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
              Learning Streak
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{learningStreak} days</div>
            <p className='text-xs text-muted-foreground'>Keep it going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Study Time</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
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

      {/* Certificate Modal */}
      <Dialog
        open={showCertificateModal}
        onOpenChange={setShowCertificateModal}
      >
        <DialogContent className='max-w-[80vw] min-w-[600px] max-h-[95vh] overflow-y-auto'>
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
              <div ref={certificateRef}>
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
                  elementId='certificate-modal'
                  isPdfVersion={false}
                />
              </div>
              <div className='flex justify-center gap-4 mt-0 relative'>
                <div className='relative'>
                  <Button
                    ref={shareButtonRef}
                    variant='outline'
                    className='flex items-center gap-2'
                    onClick={() => setShowShareMenu(v => !v)}
                  >
                    <Share2 className='h-4 w-4' />
                    Share Certificate
                  </Button>
                  {showShareMenu && (
                    <div
                      ref={shareMenuRef}
                      className='absolute left-0 bottom-full mb-2 flex flex-col z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[180px] p-2'
                    >
                      <button
                        onClick={handleShareFacebook}
                        className='flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium transition-colors justify-start'
                        type='button'
                      >
                        <svg
                          width='20'
                          height='20'
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0' />
                        </svg>
                        Share on Facebook
                      </button>
                      <button
                        onClick={handleShareLinkedIn}
                        className='flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-100 text-blue-800 font-medium transition-colors justify-start mt-1'
                        type='button'
                      >
                        <svg
                          width='20'
                          height='20'
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.966 0-1.75-.79-1.75-1.75s.784-1.75 1.75-1.75 1.75.79 1.75 1.75-.784 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.38v4.59h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z' />
                        </svg>
                        Share on LinkedIn
                      </button>
                    </div>
                  )}
                </div>
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
      {showHiddenCertificate && selectedCertificate && user && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -9999,
            width: 1024,
            height: 724,
            background: 'white',
          }}
        >
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
            elementId='certificate-pdf'
            isPdfVersion={true}
          />
        </div>
      )}
    </div>
  )
}
