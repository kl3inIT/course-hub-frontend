export interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'banned'
  avatar?: string
  joinDate?: string
  enrolledcourses?: number
  permissions?: string[]
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
  managedCourses: Course[] | null
  activities: UserActivity[]
}

export interface UserActivity {
  id: number
  type: string
  timestamp: string | null
  courseId: number
  courseTitle: string
  courseThumbnail: string
  progressPercentage?: number
  lessonId?: number
  lessonTitle?: string
  commentText?: string
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

export interface UserSearchParams {
  pageSize?: number
  pageNo?: number
  role?: string
  status?: string
  search?: string
}

export interface CreateManagerRequest {
  email: string
  password: string
  name: string
  role: string
}