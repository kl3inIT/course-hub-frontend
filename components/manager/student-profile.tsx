'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  MessageSquare,
  Settings,
  BarChart3,
  GraduationCap,
  Star,
  DollarSign,
} from 'lucide-react'

interface StudentDetails {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  status: 'active' | 'inactive' | 'suspended'
  location: string
  joinDate: string
  lastActive: string
  dateOfBirth: string
  bio: string
  totalSpent: number
  totalCourses: number
  completedCourses: number
  averageRating: number
  totalCertificates: number
  studyStreak: number
}

interface EnrolledCourse {
  id: string
  title: string
  instructor: string
  thumbnail: string
  progress: number
  status: 'in-progress' | 'completed' | 'not-started'
  enrolledDate: string
  completedDate?: string
  lastAccessed: string
  totalLessons: number
  completedLessons: number
  timeSpent: number
  rating?: number
  certificate?: boolean
}

interface AcademicPerformance {
  totalStudyTime: number
  averageSessionTime: number
  completionRate: number
  averageScore: number
  streakDays: number
  monthlyProgress: Array<{
    month: string
    coursesCompleted: number
    hoursStudied: number
    averageScore: number
  }>
}

const mockStudentDetails: StudentDetails = {
  id: '1',
  name: 'Alice Johnson',
  email: 'alice.johnson@email.com',
  phone: '+1 (555) 123-4567',
  avatar: '/placeholder.svg?height=120&width=120',
  status: 'active',
  location: 'New York, USA',
  joinDate: '2024-01-15',
  lastActive: '2024-01-25',
  dateOfBirth: '1995-03-20',
  bio: 'Passionate learner with a focus on web development and digital marketing. Always eager to explore new technologies and improve my skills.',
  totalSpent: 299,
  totalCourses: 3,
  completedCourses: 1,
  averageRating: 4.8,
  totalCertificates: 1,
  studyStreak: 15,
}

const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    instructor: 'John Smith',
    thumbnail: '/placeholder.svg?height=80&width=120',
    progress: 85,
    status: 'in-progress',
    enrolledDate: '2024-01-15',
    lastAccessed: '2024-01-25',
    totalLessons: 45,
    completedLessons: 38,
    timeSpent: 120,
    rating: 5,
  },
  {
    id: '2',
    title: 'Digital Marketing Fundamentals',
    instructor: 'Sarah Wilson',
    thumbnail: '/placeholder.svg?height=80&width=120',
    progress: 100,
    status: 'completed',
    enrolledDate: '2023-12-01',
    completedDate: '2024-01-10',
    lastAccessed: '2024-01-10',
    totalLessons: 30,
    completedLessons: 30,
    timeSpent: 80,
    rating: 4,
    certificate: true,
  },
  {
    id: '3',
    title: 'Advanced React Development',
    instructor: 'Mike Davis',
    thumbnail: '/placeholder.svg?height=80&width=120',
    progress: 0,
    status: 'not-started',
    enrolledDate: '2024-01-20',
    lastAccessed: '2024-01-20',
    totalLessons: 25,
    completedLessons: 0,
    timeSpent: 0,
  },
]

const mockPerformance: AcademicPerformance = {
  totalStudyTime: 200,
  averageSessionTime: 45,
  completionRate: 85,
  averageScore: 88,
  streakDays: 15,
  monthlyProgress: [
    { month: 'Oct', coursesCompleted: 0, hoursStudied: 20, averageScore: 0 },
    { month: 'Nov', coursesCompleted: 0, hoursStudied: 35, averageScore: 82 },
    { month: 'Dec', coursesCompleted: 1, hoursStudied: 45, averageScore: 88 },
    { month: 'Jan', coursesCompleted: 0, hoursStudied: 40, averageScore: 90 },
  ],
}

interface StudentProfileProps {
  studentId: string
}

export function StudentProfile({ studentId }: StudentProfileProps) {
  const router = useRouter()
  const [student, setStudent] = useState<StudentDetails | null>(null)
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [performance, setPerformance] = useState<AcademicPerformance | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStudentData()
  }, [studentId])

  const loadStudentData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate random error (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Failed to load student data')
      }

      // Check if student exists
      if (studentId !== '1') {
        throw new Error('Student not found')
      }

      setStudent(mockStudentDetails)
      setCourses(mockEnrolledCourses)
      setPerformance(mockPerformance)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStudentData()
    setRefreshing(false)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    )
  }

  const getCourseStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />
      case 'in-progress':
        return <Clock className='h-4 w-4 text-blue-500' />
      case 'not-started':
        return <XCircle className='h-4 w-4 text-gray-400' />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-48' />
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          <Skeleton className='h-64' />
          <Skeleton className='h-64 md:col-span-2' />
        </div>
        <Skeleton className='h-96' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back
          </Button>
          <h1 className='text-3xl font-bold'>Student Profile</h1>
        </div>

        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span>{error}</span>
            <Button variant='outline' size='sm' onClick={handleRefresh}>
              <RefreshCw className='h-4 w-4 mr-2' />
              Retry
            </Button>
          </AlertDescription>
        </Alert>

        {error === 'Student not found' && (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <AlertCircle className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Student Not Found</h3>
              <p className='text-muted-foreground text-center mb-4'>
                The student you're looking for doesn't exist or may have been
                removed.
              </p>
              <Button onClick={() => router.push('/manager/students')}>
                Return to Student List
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (!student) return null

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Student Profile</h1>
            <p className='text-muted-foreground'>
              Detailed view of student information and progress
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {/* Student Overview */}
      <div className='grid gap-6 md:grid-cols-3'>
        {/* Profile Card */}
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center text-center space-y-4'>
              <Avatar className='h-24 w-24'>
                <AvatarImage src={student.avatar || '/placeholder.svg'} />
                <AvatarFallback className='text-lg'>
                  {student.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              <div className='space-y-2'>
                <h3 className='text-xl font-semibold'>{student.name}</h3>
                {getStatusBadge(student.status)}
              </div>

              <div className='w-full space-y-3 text-sm'>
                <div className='flex items-center space-x-2'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <span className='truncate'>{student.email}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <span>{student.phone}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                  <span>{student.location}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span>
                    Joined {new Date(student.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className='flex space-x-2 w-full'>
                <Button size='sm' className='flex-1'>
                  <MessageSquare className='h-4 w-4 mr-2' />
                  Message
                </Button>
                <Button variant='outline' size='sm' className='flex-1'>
                  <Settings className='h-4 w-4 mr-2' />
                  Manage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className='md:col-span-2 grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Courses
              </CardTitle>
              <BookOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{student.totalCourses}</div>
              <p className='text-xs text-muted-foreground'>
                {student.completedCourses} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Spent</CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>${student.totalSpent}</div>
              <p className='text-xs text-muted-foreground'>Lifetime value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Average Rating
              </CardTitle>
              <Star className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{student.averageRating}</div>
              <p className='text-xs text-muted-foreground'>
                Course ratings given
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Study Streak
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{student.studyStreak}</div>
              <p className='text-xs text-muted-foreground'>Days consecutive</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue='courses' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='courses'>Enrolled Courses</TabsTrigger>
          <TabsTrigger value='performance'>Academic Performance</TabsTrigger>
          <TabsTrigger value='details'>Personal Details</TabsTrigger>
        </TabsList>

        <TabsContent value='courses' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Courses ({courses.length})</CardTitle>
              <CardDescription>
                Complete overview of student's course enrollment and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {courses.map(course => (
                  <div
                    key={course.id}
                    className='flex items-center space-x-4 p-4 border rounded-lg'
                  >
                    <img
                      src={course.thumbnail || '/placeholder.svg'}
                      alt={course.title}
                      className='w-20 h-12 object-cover rounded'
                    />

                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-medium'>{course.title}</h4>
                        <div className='flex items-center space-x-2'>
                          {getCourseStatusIcon(course.status)}
                          <Badge variant='outline'>{course.status}</Badge>
                        </div>
                      </div>

                      <p className='text-sm text-muted-foreground'>
                        Instructor: {course.instructor}
                      </p>

                      <div className='flex items-center space-x-4 text-sm'>
                        <span>
                          {course.completedLessons}/{course.totalLessons}{' '}
                          lessons
                        </span>
                        <span>{course.timeSpent}h studied</span>
                        <span>
                          Enrolled:{' '}
                          {new Date(course.enrolledDate).toLocaleDateString()}
                        </span>
                        {course.rating && (
                          <div className='flex items-center space-x-1'>
                            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                            <span>{course.rating}</span>
                          </div>
                        )}
                        {course.certificate && (
                          <Badge variant='secondary'>
                            <GraduationCap className='h-3 w-3 mr-1' />
                            Certified
                          </Badge>
                        )}
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Progress value={course.progress} className='flex-1' />
                        <span className='text-sm font-medium'>
                          {course.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='performance' className='space-y-4'>
          {performance && (
            <>
              <div className='grid gap-4 md:grid-cols-4'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Study Time
                    </CardTitle>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {performance.totalStudyTime}h
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Avg {performance.averageSessionTime}min/session
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Completion Rate
                    </CardTitle>
                    <Trophy className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {performance.completionRate}%
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Course completion
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Average Score
                    </CardTitle>
                    <BarChart3 className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {performance.averageScore}%
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Quiz & assignment scores
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Study Streak
                    </CardTitle>
                    <TrendingUp className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {performance.streakDays}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Days consecutive
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Progress</CardTitle>
                  <CardDescription>
                    Student's learning progress over the past months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {performance.monthlyProgress.map((month, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-3 border rounded'
                      >
                        <div className='font-medium'>{month.month}</div>
                        <div className='flex items-center space-x-6 text-sm'>
                          <span>
                            {month.coursesCompleted} courses completed
                          </span>
                          <span>{month.hoursStudied}h studied</span>
                          <span>{month.averageScore}% avg score</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value='details' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Detailed personal and account information
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Full Name
                  </label>
                  <p className='text-sm'>{student.name}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Email Address
                  </label>
                  <p className='text-sm'>{student.email}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Phone Number
                  </label>
                  <p className='text-sm'>{student.phone}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Date of Birth
                  </label>
                  <p className='text-sm'>
                    {new Date(student.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Location
                  </label>
                  <p className='text-sm'>{student.location}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Account Status
                  </label>
                  <div className='mt-1'>{getStatusBadge(student.status)}</div>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Join Date
                  </label>
                  <p className='text-sm'>
                    {new Date(student.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Last Active
                  </label>
                  <p className='text-sm'>
                    {new Date(student.lastActive).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Bio
                </label>
                <p className='text-sm mt-1'>{student.bio}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
