'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { createPortal } from 'react-dom'

export function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [dashboardCourses, setDashboardCourses] = useState<DashboardCourseResponseDTO[]>([])
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
  const [showFirework, setShowFirework] = useState(false)
  const prevStreak = useRef(0)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchDashboardCourses()
    fetchRecommendedCourses()
    calculateLearningStreak()
  }, [])

  useEffect(() => {
    if (learningStreak > 1) {
      const lastShownStreak = parseInt(
        localStorage.getItem('lastShownStreakForToast') || '0'
      )
      if (learningStreak > lastShownStreak) {
        setShowFirework(true)
        localStorage.setItem('lastShownStreakForToast', learningStreak.toString())
        setTimeout(() => setShowFirework(false), 3500)
      }
    }
  }, [learningStreak])

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
    const today = new Date().toDateString()
    const lastStudyDate = localStorage.getItem('lastStudyDate')
    let currentStreak = parseInt(localStorage.getItem('learningStreak') || '0')

    if (lastStudyDate === today) {
      setLearningStreak(currentStreak)
      return
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (lastStudyDate === yesterday.toDateString()) {
      currentStreak += 1
      localStorage.setItem('learningStreak', currentStreak.toString())
      localStorage.setItem('lastStudyDate', today)
      setLearningStreak(currentStreak)
    } else {
      localStorage.setItem('learningStreak', '1')
      localStorage.setItem('lastStudyDate', today)
      localStorage.setItem('lastShownStreakForToast', '0')
      setLearningStreak(1)
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
          const html2pdf = (await import('html2pdf.js')).default;
          const opt = {
            margin: 0,
            filename: `certificate-${selectedCertificate.title}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' }
          };
          html2pdf().set(opt).from(hiddenCertificateRef.current).save();
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
      {showFirework && (
        <FireworkToast streak={learningStreak} />
      )}
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
            <p className='text-xs text-muted-foreground'>Total enrolled courses</p>
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
          <p className='text-muted-foreground'>Courses we think you'll love based on your interests</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {recommendedCourses.map((course, index) => (
            <Card key={`recommended-${course.title}-${index}`} className='overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col'>
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
                <CardContent className="flex flex-col flex-1">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-4 w-full">
                    <Badge variant="secondary">{course.category}</Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {course.totalDuration}h • {course.totalLessons} lessons
                    </div>
                  </div>
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
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

          {selectedCertificate && user && (
            <div className='space-y-6 flex flex-col items-center'>
              <div ref={certificateRef}>
                <CompletionCertificate
                  courseTitle={selectedCertificate.title || selectedCertificate.courseTitle}
                  instructor={selectedCertificate.instructorName}
                  completionDate={
                    selectedCertificate.completedDate && !isNaN(new Date(selectedCertificate.completedDate).getTime())
                      ? new Date(selectedCertificate.completedDate)
                      : undefined
                  }
                  studentName={user.name || user.email || 'Student'}
                  certificateId={`CERT-${selectedCertificate.title || selectedCertificate.courseTitle}-${Date.now()}`}
                />
              </div>
              <div className='flex justify-center gap-4 mt-0'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' className='flex items-center gap-2'>
                      <Share2 className='h-4 w-4' />
                      Share Certificate
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={() => {
                        if (!selectedCertificate || !user) return;
                        const verifyUrl = `https://learnhub.academy/verify/CERT-${selectedCertificate.title}-${Date.now()}`;
                        const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}`;
                        window.open(fbShareUrl, '_blank');
                      }}
                    >
                      Share to Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (!selectedCertificate || !user) return;
                        const gistContent = `Certificate of Completion\n\nCourse: ${selectedCertificate.title}\nInstructor: ${selectedCertificate.instructorName}\nStudent: ${user.name || user.email || 'Student'}\nCertificate ID: CERT-${selectedCertificate.title}-${Date.now()}\nVerify: https://learnhub.academy/verify/CERT-${selectedCertificate.title}-${Date.now()}`;
                        const url = `https://gist.github.com/?description=${encodeURIComponent('My Certificate of Completion from LearnHub')}&files[certificate.txt]=${encodeURIComponent(gistContent)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      Share to Github (Gist)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button className='flex items-center gap-2' onClick={handleDownloadPDF}>
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
        <div
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: '300px',
            height: '1123px',
            background: 'white',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            ref={hiddenCertificateRef}
            style={{
              width: '100px',
              background: 'white',
              margin: 'auto',
              padding: 0,
              boxSizing: 'border-box',
              boxShadow: '0 0 24px 0 #e0e0e0',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CompletionCertificate
              courseTitle={selectedCertificate.title || selectedCertificate.courseTitle}
              instructor={selectedCertificate.instructorName}
              completionDate={
                selectedCertificate.completedDate && !isNaN(new Date(selectedCertificate.completedDate).getTime())
                  ? new Date(selectedCertificate.completedDate)
                  : undefined
              }
              studentName={user.name || user.email || 'Student'}
              certificateId={`CERT-${selectedCertificate.title || selectedCertificate.courseTitle}-${Date.now()}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function FireworkToast({ streak }: { streak: number }) {
  return createPortal(
    <div style={{
      position: 'fixed',
      top: 40,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 16,
      boxShadow: '0 4px 32px 0 #e0e0e0',
      padding: '32px 48px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      animation: 'fadeInDown 0.7s',
      border: '2px solid #fbbf24',
    }}>
      <div style={{ fontSize: 48, marginBottom: 8, animation: 'fireworkPop 1s infinite alternate' }}>
        🎆🎉✨
      </div>
      <div style={{ fontWeight: 700, fontSize: 22, color: '#f59e42', marginBottom: 6 }}>
        Chúc mừng! Bạn đã học liên tiếp {streak} ngày!
      </div>
      <div style={{ fontSize: 16, color: '#333', fontStyle: 'italic' }}>
        Hãy tiếp tục duy trì thói quen tuyệt vời này nhé! 🚀
      </div>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fireworkPop {
          from { filter: drop-shadow(0 0 0 #fbbf24); }
          to { filter: drop-shadow(0 0 16px #fbbf24); }
        }
      `}</style>
    </div>,
    document.body
  );
}
