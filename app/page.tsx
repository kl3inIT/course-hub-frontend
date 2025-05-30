"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Users,
  Award,
  Star,
  Play,
  CheckCircle,
  Search,
  Code,
  Palette,
  Database,
  Smartphone,
  Brain,
  TrendingUp,
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { CourseCard } from "@/components/courses/course-card"
import { TestimonialsSection } from "@/components/testimonials/testimonials-section"
import { Footer } from "@/components/layout/footer"
import { CourseProvider } from "@/context/course-context"
import { categoryAPI, CategoryResponseDTO } from "@/api/category"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await categoryAPI.getAllCategories({ page: 0, size: 6 })
        
        // Sort by courseCount descending
        const sortedCategories = response.data.content.sort((a, b) => b.courseCount - a.courseCount)
        setCategories(sortedCategories)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <CourseProvider>
      <div className="min-h-screen bg-background">
        {/* Header with Navigation */}
        <Navbar />

        {/* Hero Section */}
        <section className="relative h-[600px] md:h-[700px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://img.freepik.com/free-photo/elevated-view-laptop-stationeries-blue-backdrop_23-2147880457.jpg?semt=ais_items_boosted&w=740"
              alt="Students learning together"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                🚀 Join 50,000+ learners worldwide
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Transform Your
                <span className="block text-yellow-400">Career Today</span>
              </h1>
              <p className="text-xl leading-relaxed opacity-90">
                Access thousands of high-quality courses taught by industry experts. Learn at your own pace and advance
                your skills with hands-on projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/courses">
                  <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                    Start Learning Now
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-white text-black hover:bg-white hover:text-black"
                  >
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Course Search Bar */}
        <section className="py-12 px-4 bg-muted/50">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-2xl font-bold">Find Your Perfect Course</h2>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Search for courses, skills, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-24 h-14 text-lg"
                  />
                  <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-16 px-4">
          <div className="container mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Featured Courses</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our most popular courses taught by industry experts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((courseId) => (
                <CourseCard key={courseId} courseId={courseId} />
              ))}
            </div>

            <div className="text-center">
              <Link href="/courses">
                <Button variant="outline" size="lg">
                  View All Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Course Categories - Updated with real API data */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Explore Categories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose from a wide range of categories to find the perfect course for your goals
              </p>
            </div>

            {loadingCategories ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-24"></div>
                          <div className="h-3 bg-muted rounded w-16"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link key={category.id} href={`/courses?category=${encodeURIComponent(category.name)}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{category.courseCount} courses</p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{category.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {!loadingCategories && categories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No categories available at the moment.</p>
              </div>
            )}

            <div className="text-center">
              <Link href="/courses">
                <Button variant="outline" size="lg">
                  View All Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 px-4">
          <div className="container mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Why Choose LearnHub?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We provide the best learning experience with cutting-edge features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Play className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Interactive Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Engage with interactive video lessons, quizzes, and hands-on projects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Expert Instructors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn from industry professionals with years of real-world experience
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Monitor your learning progress and earn certificates upon completion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Award className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Earn industry-recognized certificates to boost your career prospects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Lifetime Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Get lifetime access to course materials and updates</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Star className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Community Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Join a vibrant community of learners and get help when you need it
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Student Testimonials */}
        <TestimonialsSection />

        {/* Stats Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-3xl font-bold">50,000+</h3>
                <p className="text-muted-foreground">Active Students</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-3xl font-bold">1,000+</h3>
                <p className="text-muted-foreground">Online Courses</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Award className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-3xl font-bold">95%</h3>
                <p className="text-muted-foreground">Success Rate</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Star className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-3xl font-bold">4.8/5</h3>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">Ready to Start Learning?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of students already learning on LearnHub
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </CourseProvider>
  )
}
