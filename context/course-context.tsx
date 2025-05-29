"use client"

import React, { createContext, useState, useContext, type ReactNode } from "react"

export interface Course {
  id: number
  title: string
  description: string
  instructor: string
  price: number
  rating: number
  students: number
  category: string
  level: string
  image: string
  duration?: string
  originalPrice?: number
  modules?: any[]
}

interface CourseContextType {
  courses: Course[]
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>
  updateCourse: (courseId: number, updatedCourse: Course) => void
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

interface CourseProviderProps {
  children: ReactNode
}

export const CourseProvider: React.FC<CourseProviderProps> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([])

  const updateCourse = (courseId: number, updatedCourse: Course) => {
    setCourses((prev) =>
      prev.map((course) => (course.id === courseId ? { ...course, ...updatedCourse } : course))
    )
  }

  return (
    <CourseContext.Provider value={{ courses, setCourses, updateCourse }}>
      {children}
    </CourseContext.Provider>
  )
}

export const useCourseContext = () => {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider")
  }
  return context
}
