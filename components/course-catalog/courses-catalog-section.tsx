'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { CourseCard } from '../course-card'

export function CoursesCatalogSection({
  courses,
  loading,
  error,
  onRetry,
  renderPagination,
}: {
  courses: any[]
  loading: boolean
  error: string | null
  onRetry: () => void
  renderPagination?: () => React.ReactNode
}) {
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }
  if (error) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <div className='text-6xl'>⚠️</div>
          <h3 className='text-xl font-semibold'>Error occurred</h3>
          <p className='text-muted-foreground max-w-md mx-auto'>{error}</p>
          <Button onClick={onRetry} variant='outline'>
            Try again
          </Button>
        </div>
      </div>
    )
  }
  if (!courses.length) {
    return (
      <div className='text-center py-12'>
        <div className='space-y-4'>
          <div className='text-6xl'>🔍</div>
          <h3 className='text-xl font-semibold'>No courses found</h3>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        {courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            variant='default'
            showInstructor
          />
        ))}
      </div>
      {renderPagination && renderPagination()}
    </>
  )
}
