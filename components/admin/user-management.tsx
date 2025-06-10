'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MoreHorizontal,
  Trash2,
  Users,
  GraduationCap,
  Eye,
  Ban,
  CheckCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { Toaster } from '@/components/ui/toaster'
import { User } from '@/types/user'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const BACKEND_URL = 'http://localhost:8080'

// Add form schema
const createManagerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
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
      email: '',
      password: '',
      confirmPassword: '',
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
    { value: 'active', label: 'Active' },
    { value: 'banned', label: 'Banned' },
  ]

  // States
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('learner')
  const [isLoading, setIsLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
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
  const fetchUsersWithStatus = async (status: string) => {
    const response = await fetch(
      `${BACKEND_URL}/api/admin/users?pageSize=1&pageNo=0&role=${activeTab.toUpperCase()}&status=${status}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    )
    if (!response.ok) return 0
    const data = await response.json()
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
        const [activeCount, bannedCount] = await Promise.all([
          fetchUsersWithStatus('active'),
          fetchUsersWithStatus('banned'),
        ])

        setUserStats({
          total: activeCount + bannedCount,
          active: activeCount,
          banned: bannedCount,
        })
      }

      // Fetch current page data
      const queryParams = new URLSearchParams({
        pageSize: pagination.pageSize.toString(),
        pageNo: pagination.currentPage.toString(),
        role: activeTab.toUpperCase(),
        status: selectedStatus !== 'all' ? selectedStatus : '',
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
        setUserStats({ total: 0, active: 0, banned: 0 })
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
    newStatus: 'active' | 'banned'
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

      const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.email.split('@')[0],
          role: 'MANAGER',
        }),
      })

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
        description: responseData.message || 'Manager created successfully',
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
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
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
                  onValueChange={setSelectedStatus}
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
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
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
                            variant={
                              user.status === 'active'
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {user.status === 'active' ? 'Active' : 'Banned'}
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
                        Add a new manager account. They will receive an email
                        with their login credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onCreateManager)}
                        className='space-y-4'
                      >
                        <FormField
                          control={form.control}
                          name='email'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='manager@example.com'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='password'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type='password' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='confirmPassword'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type='password' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
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
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
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
                          <Select
                            value={user.status}
                            onValueChange={newStatus =>
                              handleUpdateUserStatus(
                                user.id,
                                newStatus as 'active' | 'banned'
                              )
                            }
                          >
                            <SelectTrigger className='p-0 h-auto w-auto border-0 bg-transparent hover:bg-accent hover:text-accent-foreground [&>span]:flex [&>span]:items-center'>
                              <SelectValue>
                                <Badge
                                  variant={
                                    user.status === 'active'
                                      ? 'default'
                                      : 'destructive'
                                  }
                                >
                                  {user.status === 'active'
                                    ? 'Active'
                                    : 'Banned'}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='active'>
                                <Badge variant='default'>Active</Badge>
                              </SelectItem>
                              <SelectItem value='banned'>
                                <Badge variant='destructive'>Banned</Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={e => e.preventDefault()}
                                    className='text-red-600 cursor-pointer'
                                  >
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    Delete Manager
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the manager account and
                                      remove all associated data from our
                                      servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className='bg-red-600 hover:bg-red-700'
                                    >
                                      Delete Permanently
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
