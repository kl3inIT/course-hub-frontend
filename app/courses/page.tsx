import { CourseCatalog } from "@/components/courses/course-catalog"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Course Catalog</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover thousands of courses taught by industry experts. From beginner to advanced levels, find the
              perfect course to advance your skills and achieve your goals.
            </p>
          </div>
          <CourseCatalog />
        </div>
      </div>
      <Footer />
    </div>
  )
}
