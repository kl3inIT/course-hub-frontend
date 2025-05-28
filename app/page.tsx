"use client"

import type React from "react"

import { useState } from "react"
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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")

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
              src="https://cdn.tgdd.vn/Files/2021/08/21/1376834/Nhung-cach-giup-ban-hoc-online-hieu-qua-652x367.jpg"
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

        {/* Course Categories */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Explore Categories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose from a wide range of categories to find the perfect course for your goals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Web Development",
                  description: "Build modern websites and web applications",
                  icon: Code,
                  courses: 245,
                  color: "bg-blue-500",
                },
                {
                  name: "Design",
                  description: "UI/UX design and graphic design courses",
                  icon: Palette,
                  courses: 128,
                  color: "bg-purple-500",
                },
                {
                  name: "Data Science",
                  description: "Analytics, machine learning, and AI",
                  icon: Brain,
                  courses: 89,
                  color: "bg-green-500",
                },
                {
                  name: "Mobile Development",
                  description: "iOS and Android app development",
                  icon: Smartphone,
                  courses: 156,
                  color: "bg-orange-500",
                },
                {
                  name: "Backend Development",
                  description: "Server-side programming and databases",
                  icon: Database,
                  courses: 203,
                  color: "bg-red-500",
                },
                {
                  name: "Business",
                  description: "Marketing, entrepreneurship, and management",
                  icon: TrendingUp,
                  courses: 167,
                  color: "bg-indigo-500",
                },
              ].map((category) => {
                const IconComponent = category.icon
                return (
                  <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${category.color} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{category.courses} courses</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
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
