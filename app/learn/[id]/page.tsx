'use client'

import { use } from 'react'
import LessonViewer from '@/components/learning/lesson-viewer'
import { Navbar } from '@/components/layout/navbar'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ module?: string; lesson?: string }>
}

export default function LearnPage({ params, searchParams }: PageProps) {
  const { id } = use(params)
  const { module: moduleId, lesson: lessonId } = use(searchParams)

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <LessonViewer
          courseId={id}
          moduleId={moduleId || undefined}
          lessonId={lessonId || undefined}
        />
      </div>
    </div>
  )
}
