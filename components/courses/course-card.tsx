import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Clock } from "lucide-react"
import { CourseResponseDTO } from "@/types/course"

interface CourseCardProps {
  course: CourseResponseDTO
  variant?: "default" | "compact"
  showInstructor?: boolean
  className?: string
}

export function CourseCard({ 
  course, 
  variant = "default", 
  showInstructor = true,
  className = "" 
}: CourseCardProps) {
  const isFree = course.price === 0 || course.finalPrice === 0
  const hasDiscount = course.discount && course.discount > 0 && course.price > course.finalPrice
  const discountPercentage = hasDiscount 
    ? Math.round(((course.price - course.finalPrice) / course.price) * 100)
    : 0

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className={`hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden ${className}`}>
        {/* Course Thumbnail */}
        <div className="aspect-video relative overflow-hidden">
          <img
            src={course.thumbnailUrl || "/placeholder.svg?height=200&width=300"}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=200&width=300"
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {isFree && (
              <Badge className="bg-green-500 text-white">FREE</Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-red-500 text-white">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
          
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {course.level}
            </Badge>
          </div>
        </div>

        {/* Course Content */}
        <CardHeader className={variant === "compact" ? "p-4" : "p-5"}>
          <div className="space-y-2">
            {/* Category */}
            <Badge variant="secondary" className="w-fit text-xs">
              {course.category}
            </Badge>
            
            {/* Title */}
            <CardTitle className={`line-clamp-2 leading-tight ${
              variant === "compact" ? "text-lg" : "text-lg"
            }`}>
              {course.title}
            </CardTitle>
            
            {/* Instructor */}
            {showInstructor && (
              <p className="text-sm text-muted-foreground">
                by {course.instructorName}
              </p>
            )}
            
            {/* Rating and Reviews */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {course.averageRating ? course.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({course.totalReviews || 0} reviews)
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className={`space-y-3 ${variant === "compact" ? "p-4 pt-0" : "p-5 pt-0"}`}>
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {course.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{(course.totalStudents || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.totalLessons || 0} lessons</span>
            </div>
          </div>
          
          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              {isFree ? (
                <span className="text-lg font-bold text-green-600">Free</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    ${course.finalPrice ? course.finalPrice.toFixed(2) : '0.00'}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${course.price.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
              {hasDiscount && (
                <p className="text-xs text-green-600 font-medium">Limited time offer</p>
              )}
            </div>
            
            <Button 
              size={variant === "compact" ? "sm" : "default"}
              className="shrink-0"
            >
              View Course
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 