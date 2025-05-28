import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Clock, Play } from "lucide-react"
import { useCourseContext } from "@/context/course-context"

interface CourseCardProps {
  courseId: number
}

export function CourseCard({ courseId }: CourseCardProps) {
  const { courses, updateCourse } = useCourseContext()
  const course = courses.find((c) => c.id === courseId)

  if (!course) {
    return <div>Course not found</div>
  }

  const discountPercentage = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
      {/* Image Section - Commented due to hydration issues */}
      {/* <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        <img
          src={course.image || "/placeholder.svg?height=200&width=320"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=200&width=320"
          }}
        />

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-6 w-6 text-blue-600 fill-blue-600" />
          </div>
        </div>

        <div className="absolute top-3 left-3 flex gap-2">
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {discountPercentage}% OFF
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full"
          >
            {course.level}
          </Badge>
        </div>

        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className="bg-white/90 backdrop-blur-sm border-white/50 text-gray-700 text-xs font-medium px-2 py-1 rounded-full"
          >
            {course.category}
          </Badge>
        </div>
      </div> */}

      {/* Simplified Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={course.image || "/placeholder.svg?height=200&width=320"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {discountPercentage}% OFF
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs font-medium px-2 py-1 rounded-full">
            {course.level}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="text-xs font-medium px-2 py-1 rounded-full">
            {course.category}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-5 space-y-4">
        {/* Title and Description */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{course.description}</p>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {course.instructor.charAt(0)}
          </div>
          <span className="text-sm text-gray-700 font-medium">{course.instructor}</span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-700">{course.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{course.students.toLocaleString()}</span>
            </div>
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{course.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price and Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="space-y-1">
            {course.originalPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">${course.price}</span>
                <span className="text-sm text-gray-400 line-through">${course.originalPrice}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">${course.price}</span>
            )}
            {discountPercentage > 0 && <p className="text-xs text-green-600 font-medium">Limited time offer</p>}
          </div>

          <Link href={`/courses/${course.id}`}>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              View Course
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
