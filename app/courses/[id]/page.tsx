import { CourseDetail } from "@/components/courses/course-detail"
import { Navbar } from "@/components/layout/navbar"

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <CourseDetail courseId={params.id} />
      </div>
    </div>
  )
}
