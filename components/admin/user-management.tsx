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
import {
  CreateManagerDialog,
  Pagination,
  UserFilters,
  UserStatsCards,
  UserTable,
} from './user-management/'

export function UserManagement() {
  const { toast: showToast } = useToast()
  const router = useRouter()
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | UserStatus>(
    'all'
  )
  const [activeTab, setActiveTab] = useState<'learner' | 'manager'>('learner')
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    active: 0,
    banned: 0,
    inactive: 0,
  })
  const [courseStats, setCourseStats] = useState<CourseStats>({
    totalCourses: 0,
  })
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  })

  useEffect(() => {
    setPagination(prev => {
      const next = { ...prev, currentPage: 0 }
      fetchUsers(next, true)
      return next
    })
    fetchCourseStats()
  }, [activeTab, selectedStatus])

  const fetchCourseStats = async () => {
    try {
      const totalCourses = await adminApi.getTotalCourseStats(activeTab)
      setCourseStats({ totalCourses: totalCourses || 0 })
    } catch {
      setCourseStats({ totalCourses: 0 })
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
      if (!allUsersResponse.data?.content) return 0
      return status === 'all'
        ? allUsersResponse.data.content.length
        : allUsersResponse.data.content.filter(user => user.status === status)
            .length
    } catch {
      return 0
    }
  }

  const fetchUsers = async (
    customPagination?: PaginationState,
    fetchStats = false
  ) => {
    try {
      setIsLoading(true)
      const pag = customPagination || pagination
      const usersApiPromise = adminApi.getAllUsers({
        pageSize: pag.pageSize,
        pageNo: pag.currentPage,
        role: activeTab,
        status: selectedStatus,
      })

      let statsPromise: Promise<[number, number, number]> | undefined
      if (fetchStats || pag.currentPage === 0) {
        statsPromise = Promise.all([
          fetchUsersWithStatus(UserStatus.ACTIVE),
          fetchUsersWithStatus(UserStatus.BANNED),
          fetchUsersWithStatus(UserStatus.INACTIVE),
        ])
      }

      const usersApiResponse = await usersApiPromise
      const statsResponse = statsPromise ? await statsPromise : undefined
      const data = usersApiResponse.data
      setUsers(data.content || [])
      setPagination(prev => ({
        ...prev,
        totalElements: data.page.totalElements ?? 0,
        totalPages: data.page.totalPages ?? 0,
        currentPage: data.page.pageNumber ?? prev.currentPage,
      }))
      if (statsResponse) {
        const [activeCount, bannedCount, inactiveCount] = statsResponse
        setUserStats({
          total: (activeCount || 0) + (bannedCount || 0) + (inactiveCount || 0),
          active: activeCount || 0,
          banned: bannedCount || 0,
          inactive: inactiveCount || 0,
        })
      }
    } catch (error: any) {
      showToast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
      })
      setUsers([])
      setPagination(prev => ({ ...prev, totalElements: 0, totalPages: 0 }))
      setUserStats({ total: 0, active: 0, banned: 0, inactive: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, currentPage: newPage })
    fetchUsers({ ...pagination, currentPage: newPage })
  }
  const handlePageSizeChange = (newSize: number) => {
    setPagination({ ...pagination, pageSize: newSize, currentPage: 0 })
    fetchUsers({ ...pagination, pageSize: newSize, currentPage: 0 })
  }
  const handleUpdateUserStatus = async (userId: number, status: UserStatus) => {
    try {
      await adminApi.updateUserStatus(userId, status)
      showToast({
        title: 'Success',
        description: 'User status updated successfully.',
      })
      fetchUsers()
    } catch (error: any) {
      showToast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to update user status.',
      })
    }
  }
  const handleViewProfile = (userId: number) => {
    router.push(`/admin/users/${userId}/detail`)
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
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to create manager'
      const detail =
        error.response?.data?.detail || error.response?.data?.errors
      if (detail) {
        if (Array.isArray(detail)) {
          detail.forEach((d: any) =>
            toast.error(typeof d === 'string' ? d : JSON.stringify(d))
          )
        } else {
          toast.error(
            typeof detail === 'string' ? detail : JSON.stringify(detail)
          )
        }
      } else {
        toast.error(msg)
      }
    }
  }
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'learner' | 'manager')
    setSearchTerm('')
    setSelectedStatus('all')
  }

  const displayedUsers = users.filter(
    user =>
      !searchTerm ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading)
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-3'>
          <p>Loading...</p>
        </div>
      </div>
    )

  return (
    <div className='space-y-6'>
      <UserStatsCards
        userStats={userStats}
        courseStats={courseStats}
        activeTab={activeTab}
      />
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>List of Users</CardTitle>
              <CardDescription>List of users in the system</CardDescription>
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
            <TabsContent value='learner'>
              <UserFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                activeTab={activeTab}
              />
              {displayedUsers.length > 0 ? (
                <UserTable
                  users={displayedUsers}
                  activeTab='learner'
                  onViewProfile={handleViewProfile}
                  onUpdateUserStatus={handleUpdateUserStatus}
                />
              ) : (
                <div className='text-center p-8 border-t'>
                  No learners found.
                </div>
              )}
              <Pagination
                pagination={pagination}
                activeTab={activeTab}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </TabsContent>
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
              {displayedUsers.length > 0 ? (
                <UserTable
                  users={displayedUsers}
                  activeTab='manager'
                  onViewProfile={handleViewProfile}
                  onUpdateUserStatus={handleUpdateUserStatus}
                />
              ) : (
                <div className='text-center p-8 border-t'>
                  No managers found.
                </div>
              )}
              <Pagination
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
