'use client'
import { use } from 'react'
import LessonViewer from '@/components/learning/lesson-viewer'
import { Navbar } from '@/components/layout/navbar'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>
}

export default function LearnPage({ params }: PageProps) {
  const { courseId, lessonId } = use(params)

  // Validate required parameters
  if (!courseId || !lessonId) {
    notFound()
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <ProtectedRoute>
          <LessonViewer courseId={courseId} lessonId={lessonId} />
        </ProtectedRoute>
      </div>
    </div>
  )
}
