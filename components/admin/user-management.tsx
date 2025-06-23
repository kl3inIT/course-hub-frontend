'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import { User, UserStatus } from '@/types/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Eye,
  GraduationCap,
  MoreHorizontal,
  Search,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const BACKEND_URL = 'http://localhost:8080'

// Add form schema
const createManagerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .nonempty('Name is required'),
  email: z
    .string()
    .nonempty('Email is required')
    .email('Invalid email address'),
})

type CreateManagerForm = z.infer<typeof createManagerSchema>

export function UserManagement() {
  const { toast } = useToast()
  const { getToken } = useAuth()
  const router = useRouter()
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false)

  const form = useForm<CreateManagerForm>({
    resolver: zodResolver(createManagerSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  // Constants
  const ITEMS_PER_PAGE_OPTIONS = [
    { value: '5', label: '5 / page' },
    { value: '10', label: '10 / page' },
    { value: '20', label: '20 / page' },
    { value: '50', label: '50 / page' },
  ]

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: UserStatus.ACTIVE, label: 'Active' },
    { value: UserStatus.BANNED, label: 'Banned' },
  ]

  // States
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | UserStatus>(
    'all'
  )
  const [activeTab, setActiveTab] = useState('learner')
  const [isLoading, setIsLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
    inactive: 0,
  })
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  })

  // Effects
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 0 }))
    fetchUsers()
  }, [activeTab, selectedStatus])

  useEffect(() => {
    fetchUsers()
  }, [pagination.currentPage, pagination.pageSize])

  // API Calls
  const fetchUsersWithStatus = async (status: UserStatus | 'all') => {
    const response = await fetch(
      `${BACKEND_URL}/api/admin/users?pageSize=1&pageNo=0&role=${activeTab.toUpperCase()}&status=${status !== 'all' ? status.toUpperCase() : ''}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    )
    if (!response.ok) return 0
    const data = await response.json()
    console.log('API response for status', status, data)
    return data.data?.totalElements || 0
  }

  const fetchUsers = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: 'Error',
          description: 'No auth token',
          variant: 'destructive',
        })
        return
      }

      // Fetch stats on first page
      if (pagination.currentPage === 0) {
        const [activeCount, bannedCount, inactiveCount] = await Promise.all([
          fetchUsersWithStatus(UserStatus.ACTIVE),
          fetchUsersWithStatus(UserStatus.BANNED),
          fetchUsersWithStatus(UserStatus.INACTIVE),
        ])
        console.log('Counts:', { activeCount, bannedCount, inactiveCount })
        setUserStats({
          total: activeCount + bannedCount + inactiveCount,
          active: activeCount,
          banned: bannedCount,
          inactive: inactiveCount,
        })
      }

      // Fetch current page data
      const queryParams = new URLSearchParams({
        pageSize: pagination.pageSize.toString(),
        pageNo: pagination.currentPage.toString(),
        role: activeTab.toUpperCase(),
        status: selectedStatus !== 'all' ? selectedStatus.toUpperCase() : '',
      })

      const response = await fetch(
        `${BACKEND_URL}/api/admin/users?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        throw new Error(
          (await response.json()).message || 'Failed to fetch users'
        )
      }

      const { data } = await response.json()
      if (!data) throw new Error('Failed to fetch users')

      setUsers(data.content || [])
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
      }))
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast({
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
      if (pagination.currentPage === 0) {
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
      const token = getToken()
      if (!token) {
        toast({
          title: 'Error',
          description: 'No auth token',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch(
        `${BACKEND_URL}/api/admin/users/${userId}/status`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: new URLSearchParams({ status: newStatus }),
        }
      )

      if (!response.ok) {
        throw new Error(
          (await response.json()).message || 'Failed to update user status'
        )
      }

      setUsers(
        users.map(u => (u.id === userId ? { ...u, status: newStatus } : u))
      )

      toast({
        description: `User status updated to ${newStatus}`,
      })
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: 'Error',
          description: 'No auth token',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(
          (await response.json()).message || 'Failed to delete user'
        )
      }

      setUsers(users.filter(u => u.id !== userId))
      toast({ description: 'User deleted successfully' })
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleViewProfile = async (userId: string) => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: 'Error',
          description: 'No auth token',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch(
        `${BACKEND_URL}/api/admin/users/${userId}/detail`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        throw new Error(
          (await response.json()).message || 'Failed to access user profile'
        )
      }

      router.push(`/admin/users/${userId}/detail`)
    } catch (error: any) {
      console.error('Error accessing profile:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to access user profile',
        variant: 'destructive',
      })
    }
  }

  // Computed values
  const displayedUsers = users.filter(user => {
    if (!searchTerm) return true
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Render helpers
  const renderStatsCard = (
    title: string,
    value: number,
    icon: React.ReactNode
  ) => (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
      </CardContent>
    </Card>
  )

  const renderPaginationControls = () => (
    <div className='flex items-center justify-between space-x-2 py-4'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {displayedUsers.length > 0
          ? `Showing ${pagination.currentPage * pagination.pageSize + 1} to ${Math.min(
              (pagination.currentPage + 1) * pagination.pageSize,
              pagination.totalElements
            )} of ${pagination.totalElements} ${activeTab}s`
          : `No ${activeTab}s found`}
      </div>
      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={
            pagination.currentPage === 0 || pagination.totalElements === 0
          }
        >
          Previous
        </Button>
        {pagination.totalElements > 0 && (
          <div className='flex items-center justify-center text-sm font-medium'>
            Page {pagination.currentPage + 1} of {pagination.totalPages}
          </div>
        )}
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={
            pagination.currentPage >= pagination.totalPages - 1 ||
            pagination.totalElements === 0
          }
        >
          Next
        </Button>
        <Select
          value={pagination.pageSize.toString()}
          onValueChange={value => handlePageSizeChange(Number(value))}
        >
          <SelectTrigger className='w-[110px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  // Helper functions
  const formatJoinDate = (date: string | undefined) => {
    if (!date) return '-'
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) return '-'
      return format(dateObj, 'dd/MM/yyyy')
    } catch (error) {
      console.error('Invalid date:', date)
      return '-'
    }
  }

  const onCreateManager = async (data: CreateManagerForm) => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: 'Error',
          description: 'No auth token',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch(
        `${BACKEND_URL}/api/admin/users/create-manager`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          (await response.json()).message || 'Failed to create manager'
        )
      }

      const responseData = await response.json()
      if (!responseData.data) {
        throw new Error('Failed to create manager')
      }

      await fetchUsers()
      setIsCreateManagerOpen(false)
      form.reset()

      toast({
        title: 'Manager Created',
        description:
          'An email with login credentials has been sent to the manager.',
      })
    } catch (error: any) {
      console.error('Error creating manager:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create manager',
        variant: 'destructive',
      })
    }
  }

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
      <Toaster />

      {/* Stats Cards */}
      <div
        className={`grid gap-4 md:grid-cols-2 ${activeTab === 'manager' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}
      >
        {renderStatsCard(
          activeTab === 'learner' ? 'Total Learners' : 'Total Managers',
          userStats.total,
          <Users className='h-4 w-4 text-muted-foreground' />
        )}
        {renderStatsCard(
          'Active',
          userStats.active,
          <CheckCircle className='h-4 w-4 text-green-600' />
        )}
        {activeTab === 'manager' &&
          renderStatsCard(
            'Inactive',
            userStats.inactive,
            <AlertTriangle className='h-4 w-4 text-gray-600' />
          )}
        {renderStatsCard(
          'Banned',
          userStats.banned,
          <Ban className='h-4 w-4 text-red-600' />
        )}
        {renderStatsCard(
          activeTab === 'learner' ? 'Enrolled Courses' : 'Managed Courses',
          0,
          <GraduationCap className='h-4 w-4 text-blue-600' />
        )}
      </div>

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
            defaultValue='learner'
            className='space-y-4'
            onValueChange={value => {
              setActiveTab(value)
              setSearchTerm('') // Reset search when changing tabs
              setSelectedStatus('all') // Reset status filter when changing tabs
            }}
          >
            <TabsList>
              <TabsTrigger value='learner'>Learners</TabsTrigger>
              <TabsTrigger value='manager'>Managers</TabsTrigger>
            </TabsList>

            {/* Learner Tab Content */}
            <TabsContent value='learner'>
              <div className='flex items-center space-x-2 mb-4'>
                <div className='relative flex-1'>
                  <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search learners...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-8'
                  />
                </div>
                <Select
                  value={selectedStatus}
                  onValueChange={value =>
                    setSelectedStatus(value as UserStatus | 'all')
                  }
                >
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Enrolled Courses</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedUsers
                    .filter(user => user.role === 'learner')
                    .map(user => (
                      <TableRow key={user.id}>
                        <TableCell className='font-medium'>
                          <div className='flex items-center space-x-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage
                                src={
                                  user.avatar ||
                                  '/placeholder.svg?height=32&width=32'
                                }
                              />
                              <AvatarFallback>
                                {user.name
                                  ? user.name
                                      .split(' ')
                                      .map(n => n[0])
                                      .join('')
                                  : user.email?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{user.name}</div>
                              <div className='text-sm text-muted-foreground'>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.status === UserStatus.ACTIVE
                                ? 'bg-green-100 text-green-800'
                                : user.status === UserStatus.INACTIVE
                                  ? 'bg-gray-100 text-black'
                                  : 'bg-red-100 text-red-600'
                            }
                          >
                            {user.status === UserStatus.ACTIVE
                              ? 'Active'
                              : user.status === UserStatus.INACTIVE
                                ? 'Inactive'
                                : 'Banned'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatJoinDate(user.joinDate)}</TableCell>
                        <TableCell>{user.enrolledcourses || 0}</TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => handleViewProfile(user.id)}
                              >
                                <Eye className='mr-2 h-4 w-4' />
                                View Profile
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              {renderPaginationControls()}
            </TabsContent>

            {/* Manager Tab Content */}
            <TabsContent value='manager' className='space-y-4'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center space-x-2'>
                  <div className='relative flex-1'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Search managers...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='pl-8'
                    />
                  </div>
                </div>
                <Dialog
                  open={isCreateManagerOpen}
                  onOpenChange={setIsCreateManagerOpen}
                >
                  <DialogTrigger asChild>
                    <Button>Create Manager</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Manager</DialogTitle>
                      <DialogDescription>
                        Add a new manager account by entering their information.
                      </DialogDescription>
                      <div className='text-sm text-muted-foreground'>
                        A temporary password will be generated and sent to this
                        email address.
                      </div>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onCreateManager)}
                        className='space-y-4'
                      >
                        <FormField
                          control={form.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Name <span className='text-destructive'>*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Enter manager name'
                                  required
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='email'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Email{' '}
                                <span className='text-destructive'>*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='manager@example.com'
                                  required
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter className='gap-2 sm:gap-0'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                              setIsCreateManagerOpen(false)
                              form.reset()
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type='submit'>Create Manager</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Managed Courses</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedUsers
                    .filter(user => user.role === 'manager')
                    .map(user => (
                      <TableRow key={user.id}>
                        <TableCell className='font-medium'>
                          <div className='flex items-center space-x-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage
                                src={
                                  user.avatar ||
                                  '/placeholder.svg?height=32&width=32'
                                }
                              />
                              <AvatarFallback>
                                {user.name
                                  ? user.name
                                      .split(' ')
                                      .map(n => n[0])
                                      .join('')
                                  : user.email?.charAt(0).toUpperCase() ||
                                    'User'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{user.name}</div>
                              <div className='text-sm text-muted-foreground'>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.status === UserStatus.ACTIVE
                                ? 'bg-green-100 text-green-800'
                                : user.status === UserStatus.INACTIVE
                                  ? 'bg-gray-100 text-black'
                                  : 'bg-red-100 text-red-600'
                            }
                          >
                            {user.status === UserStatus.ACTIVE
                              ? 'Active'
                              : user.status === UserStatus.INACTIVE
                                ? 'Inactive'
                                : 'Banned'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatJoinDate(user.joinDate)}</TableCell>
                        <TableCell>{user.enrolledcourses || 0}</TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => handleViewProfile(user.id)}
                              >
                                <Eye className='mr-2 h-4 w-4' />
                                View Profile
                              </DropdownMenuItem>
                              {user.status === UserStatus.INACTIVE ? (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateUserStatus(
                                        user.id,
                                        UserStatus.ACTIVE
                                      )
                                    }
                                    className='text-green-600 cursor-pointer'
                                  >
                                    <CheckCircle className='mr-2 h-4 w-4' />
                                    Activate
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={e => e.preventDefault()}
                                        className='text-red-600 cursor-pointer'
                                      >
                                        <AlertTriangle className='mr-2 h-4 w-4 text-yellow-500' />
                                        Deactivate
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Deactivate Manager?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will deactivate the manager
                                          account. The manager will not be able
                                          to log in until reactivated. This
                                          action can be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteUser(user.id)
                                          }
                                          className='bg-red-600 hover:bg-red-700'
                                        >
                                          Confirm Deactivate
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              {renderPaginationControls()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
