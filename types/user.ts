export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}

export enum UserActivityType {
  COMMENT = 'comment',
  ENROLLMENT = 'enrollment',
  COURSE_CREATION = 'course_creation',
  COURSE_UPDATE = 'course_update',
  LESSON_COMPLETION = 'lesson_completion',
  COURSE_COMPLETION = 'course_completion',
  QUIZ_ATTEMPT = 'quiz_attempt',
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  status: UserStatus
  avatar?: string
  joinDate?: string
  bio?: string
  activities?: UserActivity[]
  enrolledCoursesCount?: number
  managedCoursesCount?: number
}

export interface UserDetail {
  id: number
  name: string
  email: string
  avatar: string
  role: string
  status: string
  joinDate: string
  bio: string | null
  enrolledCourses: Course[] | null
  managedCourses: Course[] | null
  activities: UserActivity[]
}

export interface UserActivity {
  id: number
  type: UserActivityType | string // Support both enum and string for flexibility
  timestamp: string | null
  courseId: number
  courseTitle: string
  courseThumbnail: string
  progressPercentage?: number
  lessonId?: number
  lessonTitle?: string
  commentText?: string
  actionDescription?: string // For course management activities
}

export interface Course {
  id: number
  title: string
  thumbnail: string
  progress?: number
}

export interface ProfileData {
  name: string
  email: string
  bio: string
  phone: string
  address: string
  avatar: string
  dateOfBirth: string
  gender: string
}

export interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}