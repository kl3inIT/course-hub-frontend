'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { adminApi } from '@/services/admin-api'
import { UserManagementResponse } from '@/types/admin-api'
import { User, UserStatus } from '@/types/user'
import {
  CourseStats,
  CreateManagerRequest,
  PaginationState,
  UserStats,
} from '@/types/user-management'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// Import sub-components
import {
  CreateManagerDialog,
  UserFilters,
  UserPagination,
  UserStatsCards,
  UserTable,
} from './user-management/'

export function UserManagement() {
  const { toast: showToast } = useToast()
  const router = useRouter()

  // States
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | UserStatus>(
    'all'
  )
  const [activeTab, setActiveTab] = useState('learner')
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    active: 0,
    banned: 0,
    inactive: 0,
  })
  const [courseStats, setCourseStats] = useState<CourseStats>({
    totalCourses: 0,
  })
  const [userCourseMap, setUserCourseMap] = useState<Map<string, number>>(
    new Map()
  )
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  })

  // Effects
  useEffect(() => {
    const fetchData = async () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }))
      await Promise.all([fetchUsers(true), fetchCourseStats()])
    }
    fetchData()
  }, [activeTab, selectedStatus])

  useEffect(() => {
    fetchUsers()
  }, [pagination.currentPage, pagination.pageSize])

  useEffect(() => {
    if (users.length > 0) {
      fetchUserCourseData()
    }
  }, [users, activeTab])

  // API Calls
  const fetchCourseStats = async () => {
    try {
      const totalCourses = await adminApi.getTotalCourseStats(activeTab)
      setCourseStats({ totalCourses: totalCourses || 0 })
    } catch (error) {
      setCourseStats({ totalCourses: 0 })
    }
  }

  const fetchUserCourseData = async () => {
    try {
      const courseMap = new Map<string, number>()
      for (const user of users) {
        if (activeTab === 'learner') {
          courseMap.set(user.id, user.enrolledCoursesCount || 0)
        } else {
          courseMap.set(user.id, user.managedCoursesCount || 0)
        }
      }
      setUserCourseMap(courseMap)
    } catch (error) {
      setUserCourseMap(new Map())
    }
  }

  const fetchUsersWithStatus = async (
    status: UserStatus | 'all'
  ): Promise<number> => {
    try {
      const allUsersResponse = await adminApi.getAllUsers({
        pageSize: 1000,
        pageNo: 0,
        role: activeTab,
        status: 'all',
      })

      if (!allUsersResponse.data?.content) {
        return 0
      }

      const filteredUsers =
        status === 'all'
          ? allUsersResponse.data.content
          : allUsersResponse.data.content.filter(user => user.status === status)

      return filteredUsers.length
    } catch (error) {
      return 0
    }
  }

  const fetchUsers = async (fetchStats = false) => {
    try {
      setIsLoading(true)

      const promises = []

      promises.push(
        adminApi.getAllUsers({
          pageSize: pagination.pageSize,
          pageNo: pagination.currentPage,
          role: activeTab,
          status: selectedStatus,
        })
      )

      if (fetchStats || pagination.currentPage === 0) {
        promises.push(
          Promise.all([
          fetchUsersWithStatus(UserStatus.ACTIVE),
          fetchUsersWithStatus(UserStatus.BANNED),
          fetchUsersWithStatus(UserStatus.INACTIVE),
        ])
        )
      }

      const results = await Promise.all(promises)
      const usersResponse = results[0] as UserManagementResponse

      setUsers(usersResponse.data.content || [])
      setPagination(prev => ({
        ...prev,
        totalElements: usersResponse.data.totalElements || 0,
        totalPages: usersResponse.data.totalPages || 0,
      }))

      if (results.length > 1) {
        const [activeCount, bannedCount, inactiveCount] = results[1] as [
          number,
          number,
          number,
        ]

        const stats = {
          total: (activeCount || 0) + (bannedCount || 0) + (inactiveCount || 0),
          active: activeCount || 0,
          banned: bannedCount || 0,
          inactive: inactiveCount || 0,
        }
        setUserStats(stats)
      }
    } catch (error: any) {
      showToast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
      setUsers([])
      setPagination(prev => ({
        ...prev,
        totalElements: 0,
        totalPages: 0,
      }))
      if (fetchStats || pagination.currentPage === 0) {
        setUserStats({ total: 0, active: 0, banned: 0, inactive: 0 })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 0,
    }))
  }

  const handleUpdateUserStatus = async (
    userId: string,
    newStatus: UserStatus
  ) => {
    try {
      await adminApi.updateUserStatus(userId, newStatus)
      setUsers(
        users.map(u => (u.id === userId ? { ...u, status: newStatus } : u))
      )
      toast.success(`User status updated to ${newStatus}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminApi.deleteManager(userId)
      setUsers(users.filter(u => u.id !== userId))
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const handleViewProfile = async (userId: string) => {
    try {
      await adminApi.getUserDetails(userId)
      router.push(`/admin/users/${userId}/detail`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to access user profile')
    }
  }

  const handleCreateManager = async (data: CreateManagerRequest) => {
    try {
      await adminApi.createManager(data)
      await fetchUsers()
      setIsCreateManagerOpen(false)
      toast.success(
        'An email with login credentials has been sent to the manager.'
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to create manager')
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchTerm('')
    setSelectedStatus('all')
  }

  // Filter users for display
  const displayedUsers = users.filter(user => {
    if (!searchTerm) return true
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-3'>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <UserStatsCards
        userStats={userStats}
        courseStats={courseStats}
        activeTab={activeTab}
      />

      {/* User Management with Tabs */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            className='space-y-4'
            onValueChange={handleTabChange}
          >
            <TabsList>
              <TabsTrigger value='learner'>Learners</TabsTrigger>
              <TabsTrigger value='manager'>Managers</TabsTrigger>
            </TabsList>

            {/* Learner Tab Content */}
            <TabsContent value='learner'>
              <UserFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                activeTab={activeTab}
              />

              <UserTable
                users={displayedUsers}
                userCourseMap={userCourseMap}
                activeTab={activeTab}
                onViewProfile={handleViewProfile}
                onUpdateUserStatus={handleUpdateUserStatus}
                onDeleteUser={handleDeleteUser}
              />

              <UserPagination
                pagination={pagination}
                activeTab={activeTab}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </TabsContent>

            {/* Manager Tab Content */}
            <TabsContent value='manager' className='space-y-4'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center space-x-2'>
                  <UserFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                    activeTab={activeTab}
                  />
                </div>
                <CreateManagerDialog
                  open={isCreateManagerOpen}
                  onOpenChange={setIsCreateManagerOpen}
                  onSubmit={handleCreateManager}
                />
              </div>

              <UserTable
                users={displayedUsers}
                userCourseMap={userCourseMap}
                activeTab={activeTab}
                onViewProfile={handleViewProfile}
                onUpdateUserStatus={handleUpdateUserStatus}
                onDeleteUser={handleDeleteUser}
              />

              <UserPagination
                pagination={pagination}
                activeTab={activeTab}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
