import { CourseCard } from './course-card'
import { CourseResponseDTO } from '@/types/course'

export function CoursesList({ courses }: { courses: CourseResponseDTO[] }) {
    if (!courses.length) {
        return <div className="text-center text-muted-foreground py-12">No courses found.</div>
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    )
} 