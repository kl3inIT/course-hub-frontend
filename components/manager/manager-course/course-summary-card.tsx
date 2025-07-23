'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CourseSummaryCardProps {
  course: {
    title: string
    description: string
    price: number | string
    level: string
    category: string
    thumbnailUrl?: string | File | null
  }
  className?: string
}

export function CourseSummaryCard({
  course,
  className = '',
}: CourseSummaryCardProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState<string | undefined>(
    typeof course.thumbnailUrl === 'string' ? course.thumbnailUrl || undefined : undefined
  )

  useEffect(() => {
    if (course.thumbnailUrl instanceof File) {
      const objectUrl = URL.createObjectURL(course.thumbnailUrl)
      setThumbnailSrc(objectUrl)
      return () => {
        URL.revokeObjectURL(objectUrl)
      }
    } else if (typeof course.thumbnailUrl === 'string') {
      setThumbnailSrc(course.thumbnailUrl)
    } else {
      setThumbnailSrc(undefined)
    }
  }, [course.thumbnailUrl])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          {course.title}
          <Badge variant='secondary'>{course.level}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='flex gap-4'>
        <div className='w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center'>
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt='Course thumbnail'
              className='object-cover w-full h-full'
            />
          ) : (
            <ImageIcon className='h-8 w-8 text-muted-foreground' />
          )}
        </div>
        <div className='flex-1'>
          <div className='font-semibold text-lg'>{course.title}</div>
          <div className='text-sm text-muted-foreground line-clamp-3'>
            {course.description}
          </div>
          <div className='flex items-center gap-2 mt-2'>
            <span className='text-primary font-bold'>${course.price}</span>
            <span className='text-xs text-muted-foreground'>
              {course.category}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
