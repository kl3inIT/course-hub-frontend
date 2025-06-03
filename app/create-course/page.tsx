import { CourseCreationForm } from "@/components/manager/course-creation-form"
import { Navbar } from "@/components/layout/navbar"

export default function CreateCoursePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create New Course</h1>
            <p className="text-muted-foreground mt-2">
              Share your knowledge with learners around the world. Fill out the form below to create your course.
            </p>
          </div>
          <CourseCreationForm />
        </div>
      </div>
    </div>
  )
}
