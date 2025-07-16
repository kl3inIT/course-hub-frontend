import { User, UserStatus } from './user'

// User Management Request Types
export interface CreateManagerRequest {
  email: string
  password?: string
  name: string
  role?: string
}

// User Management Statistics
export interface UserStats {
  total: number
  active: number
  banned: number
  inactive: number
}

export interface CourseStats {
  totalCourses: number
}

// Pagination
export interface PaginationState {
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
}

// Component Props Interfaces
export interface UserStatsCardsProps {
  userStats: UserStats
  courseStats: CourseStats
  activeTab: string
}

export interface UserTableProps {
  users: User[]
  userCourseMap: Map<string, number>
  activeTab: string
  onViewProfile: (userId: string) => void
  onUpdateUserStatus: (userId: string, status: UserStatus) => void
  onDeleteUser: (userId: string) => void
}

export interface CreateManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateManagerRequest) => Promise<void>
}

export interface UserFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedStatus: 'all' | UserStatus
  onStatusChange: (value: 'all' | UserStatus) => void
  activeTab: string
}

export interface UserPaginationProps {
  pagination: PaginationState
  activeTab: string
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

// These interfaces are now replaced with inline const objects

// User Management State
export interface UserManagementState {
  users: User[]
  searchTerm: string
  selectedStatus: 'all' | UserStatus
  activeTab: string
  userStats: UserStats
  courseStats: CourseStats
  userCourseMap: Map<string, number>
  pagination: PaginationState
  isLoading: boolean
  isCreateManagerOpen: boolean
}
