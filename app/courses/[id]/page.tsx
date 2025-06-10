import { CourseDetail } from '@/components/courses/course-detail'
import { Navbar } from '@/components/layout/navbar'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <CourseDetail courseId={id} />
      </div>
    </div>
  )
}
