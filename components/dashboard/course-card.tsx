import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Clock, Calendar, Award, Eye } from 'lucide-react'
import Link from 'next/link'
import { DashboardCourseResponseDTO } from '@/types/course'

interface CourseCardProps {
  course: DashboardCourseResponseDTO
  type: 'active' | 'completed' | 'certificate'
  onViewCertificate?: (course: DashboardCourseResponseDTO) => void
}

export function CourseCard({
  course,
  type,
  onViewCertificate,
}: CourseCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (type === 'active') {
    return (
      <Card className='overflow-hidden'>
        <div className='aspect-video bg-muted'>
          <img
            src={course.thumbnailUrl || '/placeholder.svg'}
            alt={course.title}
            className='w-full h-full object-cover'
          />
        </div>
        <CardHeader>
          <CardTitle className='line-clamp-1'>{course.title}</CardTitle>
          <CardDescription>by {course.instructorName}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Progress</span>
              <span>{Math.round(course.progress)}%</span>
            </div>
            <Progress value={course.progress} />
            <p className='text-xs text-muted-foreground'>
              {course.totalLessons} lessons
            </p>
          </div>

          <div className='flex items-center justify-between'>
            <Badge variant='secondary'>{course.totalDuration}h total</Badge>
            <Link href={`/learn/${course.id}`}>
              <Button size='sm'>
                <Play className='h-4 w-4 mr-2' />
                Continue
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'completed') {
    return (
      <Card className='overflow-hidden'>
        <div className='aspect-video bg-muted relative'>
          <img
            src={course.thumbnailUrl || '/placeholder.svg'}
            alt={course.title}
            className='w-full h-full object-cover'
          />
          <div className='absolute top-2 right-2'>
            <Badge className='bg-green-500 hover:bg-green-600'>
              <Award className='h-3 w-3 mr-1' />
              Completed
            </Badge>
          </div>
        </div>
        <CardHeader>
          <CardTitle className='line-clamp-1'>{course.title}</CardTitle>
          <CardDescription>by {course.instructorName}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Calendar className='h-4 w-4' />
              Completed on {formatDate(course.completedDate || '')}
            </div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Clock className='h-4 w-4' />
              {course.totalDuration}h • {course.totalLessons} lessons
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onViewCertificate?.(course)}
              className='flex items-center gap-2'
            >
              <Award className='h-4 w-4' />
              View Certificate
            </Button>
            <Link href={`/courses/${course.title}`}>
              <Button variant='ghost' size='sm'>
                <Eye className='h-4 w-4 mr-2' />
                Review
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Certificate card
  return (
    <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
      <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-600 text-white'>
        <div className='flex items-center justify-between'>
          <Award className='h-8 w-8' />
          <Badge variant='secondary' className='bg-white/20 text-white'>
            Certificate
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='p-6 space-y-4'>
        <div>
          <h3 className='font-bold text-lg line-clamp-2'>{course.title}</h3>
          <p className='text-sm text-muted-foreground'>
            by {course.instructorName}
          </p>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <span>Completed: {formatDate(course.completedDate || '')}</span>
          </div>
          <div className='text-xs text-muted-foreground'>
            Category: {course.category}
          </div>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onViewCertificate?.(course)}
            className='flex-1'
          >
            <Eye className='h-4 w-4 mr-2' />
            View
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onViewCertificate?.(course)}
            className='flex-1'
          >
            <Eye className='h-4 w-4 mr-2' />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
