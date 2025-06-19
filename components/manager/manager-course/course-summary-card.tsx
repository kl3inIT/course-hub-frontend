'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageIcon } from 'lucide-react'

interface CourseSummaryCardProps {
  course: {
    title: string
    description: string
    price: number | string
    level: string
    category: string
    thumbnailUrl?: string | null
  }
  className?: string
}

export function CourseSummaryCard({
  course,
  className = '',
}: CourseSummaryCardProps) {
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
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
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
