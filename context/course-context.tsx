"use client"

import type React from "react"

import { createContext, useState, useEffect, useContext, type ReactNode } from "react"

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  price: number
  originalPrice?: number
  rating: number
  students: number
  duration?: string
  category: string
  level: string
  image: string
  modules?: any[]
}

interface CourseContextType {
  courses: Course[]
  updateCourse: (courseId: number, updatedCourse: Course) => void
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

interface CourseProviderProps {
  children: ReactNode
}

export const CourseProvider: React.FC<CourseProviderProps> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    // Initialize from localStorage or default data
    if (typeof window !== 'undefined') {
      const storedCourses = localStorage.getItem("courses")
      return storedCourses
        ? JSON.parse(storedCourses)
        : [
            {
              id: 1,
              title: "React.js Fundamentals",
              description: "Learn the basics of React.js and build modern web applications",
              instructor: "John Doe",
              price: 99,
              originalPrice: 149,
              rating: 4.8,
              students: 1234,
              duration: "8 hours",
              category: "Web Development",
              level: "Beginner",
              image: "/placeholder.svg?height=200&width=300",
            },
            {
              id: 2,
              title: "Advanced JavaScript",
              description: "Master advanced JavaScript concepts and ES6+ features",
              instructor: "Jane Smith",
              price: 149,
              originalPrice: 199,
              rating: 4.9,
              students: 856,
              duration: "12 hours",
              category: "Programming",
              level: "Advanced",
              image: "/placeholder.svg?height=200&width=300",
            },
          ]
    }
    return []
  })

  useEffect(() => {
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem("courses", JSON.stringify(courses))
    }
  }, [courses])

  const updateCourse = (courseId: number, updatedCourse: Course) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => (course.id === courseId ? { ...course, ...updatedCourse } : course)),
    )
  }

  return <CourseContext.Provider value={{ courses, updateCourse }}>{children}</CourseContext.Provider>
}

export const useCourseContext = () => {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider")
  }
  return context
}
