'use client'

import { CourseCard } from '@/components/course-card'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { TestimonialsSection } from '@/components/testimonials-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useFeedbackDetail } from '@/hooks'
import { courseApi } from '@/services/course-api'
import { CourseResponseDTO } from '@/types/course'
import {
  Award,
  BookOpen,
  CheckCircle,
  Play,
  Search,
  Star,
  Users,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

const Earth3D = dynamic(() => import('@/components/Earth3D'), {
  ssr: false,
  loading: () => (
    <div className='w-[400px] h-[400px] animate-pulse bg-gradient-to-br from-blue-300/20 to-purple-400/20 rounded-full' />
  ),
})

export default function HomePage() {
  const { showFeedback } = useFeedbackDetail()
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredCourses, setFeaturedCourses] = useState<CourseResponseDTO[]>(
    []
  )
  const [loadingFeaturedCourses, setLoadingFeaturedCourses] = useState(false)

  // Fetch featured courses from API
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoadingFeaturedCourses(true)
        const response = await courseApi.getFeaturedCourses({
          page: 0,
          size: 6,
        })
        setFeaturedCourses(response.data)
      } catch (error) {
        console.error('Failed to fetch featured courses:', error)
      } finally {
        setLoadingFeaturedCourses(false)
      }
    }

    fetchFeaturedCourses()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`
    }
  }

  // Trái đất xoay với hiệu ứng vũ trụ
  const starPositions = useMemo(
    () =>
      Array.from({ length: 120 }).map(() => ({
        cx: Math.random() * 400,
        cy: Math.random() * 400,
        r: Math.random() * 2.2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
      })),
    []
  )

  return (
    <div className='min-h-screen bg-background'>
      {/* Header with Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className='relative h-[600px] md:h-[700px] overflow-hidden'>
        <div className='absolute inset-0'>
          <img
            src='/assets/universe.jpg'
            alt='Students learning together'
            className='w-full h-full object-cover'
          />
          <div className='absolute inset-0 bg-black/40'></div>
        </div>

        <div className='relative z-10 container mx-auto px-4 h-full flex items-center'>
          <div className='max-w-2xl text-white space-y-6'>
            <div className='inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium'>
              🚀 Join 50,000+ learners worldwide
            </div>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
              Transform Your
              <span className='block text-yellow-400'>Career Today</span>
            </h1>
            <p className='text-xl leading-relaxed opacity-90'>
              Access thousands of high-quality courses taught by industry
              experts. Learn at your own pace and advance your skills with
              hands-on projects.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
              <Link href='/courses'>
                <Button
                  size='lg'
                  className='text-lg px-8 py-6 bg-primary hover:bg-primary/90'
                >
                  Start Learning Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trái đất xoay với hiệu ứng vũ trụ */}
        <div className='absolute right-40 top-1/2 -translate-y-1/2 w-[400px] h-[400px] hidden md:flex z-20 pointer-events-none items-center justify-center'>
          {/* Vầng sáng và vũ trụ */}
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-blue-300/40 via-indigo-300/30 to-purple-400/40 blur-3xl animate-pulse-glow z-10'></div>
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] z-0 pointer-events-none'>
            <svg
              width='100%'
              height='100%'
              viewBox='0 0 400 400'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='absolute inset-0'
            >
              {/* Starfield */}
            </svg>
          </div>
          {/* Earth 3D: LUÔN để trong div vuông */}
          <div className='relative z-20 w-[400px] h-[400px] flex items-center justify-center'>
            <Earth3D />
          </div>
        </div>
      </section>

      {/* Course Search Bar */}
      <section className='py-12 px-4 bg-muted/50'>
        <div className='container mx-auto'>
          <div className='max-w-2xl mx-auto text-center space-y-6'>
            <h2 className='text-2xl font-bold'>Find Your Perfect Course</h2>
            <form onSubmit={handleSearch} className='relative'>
              <div className='relative'>
                <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5' />
                <Input
                  placeholder='Search for courses, skills, or topics...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-12 pr-24 h-14 text-lg'
                />
                <Button
                  type='submit'
                  className='absolute right-2 top-1/2 transform -translate-y-1/2'
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className='py-16 px-4'>
        <div className='container mx-auto space-y-8'>
          <div className='text-center space-y-4'>
            <h2 className='text-3xl font-bold'>Featured Courses</h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Discover our most popular courses taught by industry experts
            </p>
          </div>

          {loadingFeaturedCourses ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className='animate-pulse'>
                  <div className='aspect-video bg-muted rounded-lg mb-4'></div>
                  <CardHeader>
                    <div className='space-y-2'>
                      <div className='h-4 bg-muted rounded w-3/4'></div>
                      <div className='h-3 bg-muted rounded w-1/2'></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='h-3 bg-muted rounded w-full'></div>
                      <div className='h-3 bg-muted rounded w-2/3'></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {featuredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  variant='default'
                  showInstructor={true}
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>
                No featured courses available at the moment.
              </p>
            </div>
          )}

          <div className='text-center'>
            <Link href='/courses'>
              <Button variant='outline' size='lg'>
                View All Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className='py-16 px-4'>
        <div className='container mx-auto space-y-8'>
          <div className='text-center space-y-4'>
            <h2 className='text-3xl font-bold'>Why Choose LearnHub?</h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              We provide the best learning experience with cutting-edge features
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Card>
              <CardHeader>
                <Play className='h-8 w-8 text-primary mb-2' />
                <CardTitle>Interactive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Engage with interactive video lessons, quizzes, and hands-on
                  projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className='h-8 w-8 text-primary mb-2' />
                <CardTitle>Expert Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Learn from industry professionals with years of real-world
                  experience
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className='h-8 w-8 text-primary mb-2' />
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Monitor your learning progress and earn certificates upon
                  completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className='h-8 w-8 text-primary mb-2' />
                <CardTitle>Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Earn industry-recognized certificates to boost your career
                  prospects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className='h-8 w-8 text-primary mb-2' />
                <CardTitle>Lifetime Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Get lifetime access to course materials and updates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Star className='h-8 w-8 text-primary mb-2' />
                <CardTitle>Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Join a vibrant community of learners and get help when you
                  need it
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <TestimonialsSection />

      {/* Stats Section */}
      <section className='py-16 px-4 bg-muted/50'>
        <div className='container mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8 text-center'>
            <div className='space-y-2'>
              <div className='flex justify-center'>
                <Users className='h-12 w-12 text-primary' />
              </div>
              <h3 className='text-3xl font-bold'>50,000+</h3>
              <p className='text-muted-foreground'>Active Students</p>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-center'>
                <BookOpen className='h-12 w-12 text-primary' />
              </div>
              <h3 className='text-3xl font-bold'>1,000+</h3>
              <p className='text-muted-foreground'>Online Courses</p>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-center'>
                <Award className='h-12 w-12 text-primary' />
              </div>
              <h3 className='text-3xl font-bold'>95%</h3>
              <p className='text-muted-foreground'>Success Rate</p>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-center'>
                <Star className='h-12 w-12 text-primary' />
              </div>
              <h3 className='text-3xl font-bold'>4.8/5</h3>
              <p className='text-muted-foreground'>Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
