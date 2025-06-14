'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  UserCheck,
  Users,
  TrendingUp,
  DollarSign,
  RefreshCw,
} from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  avatar: string
  status: 'active' | 'inactive' | 'suspended'
  enrolledCourses: number
  completedCourses: number
  totalProgress: number
  totalSpent: number
  joinDate: string
  lastActive: string
  location: string
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    status: 'active',
    enrolledCourses: 3,
    completedCourses: 1,
    totalProgress: 67,
    totalSpent: 299,
    joinDate: '2024-01-15',
    lastActive: '2024-01-25',
    location: 'New York, USA',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    status: 'active',
    enrolledCourses: 2,
    completedCourses: 2,
    totalProgress: 100,
    totalSpent: 198,
    joinDate: '2023-12-10',
    lastActive: '2024-01-24',
    location: 'London, UK',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol.davis@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    status: 'inactive',
    enrolledCourses: 1,
    completedCourses: 0,
    totalProgress: 23,
    totalSpent: 99,
    joinDate: '2024-01-20',
    lastActive: '2024-01-22',
    location: 'Toronto, Canada',
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    status: 'active',
    enrolledCourses: 4,
    completedCourses: 3,
    totalProgress: 85,
    totalSpent: 497,
    joinDate: '2023-11-05',
    lastActive: '2024-01-25',
    location: 'Sydney, Australia',
  },
]

export function StudentManagement() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredAndSortedStudents = useMemo(() => {
    const filtered = students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || student.status === statusFilter

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'progress':
          return b.totalProgress - a.totalProgress
        case 'courses':
          return b.enrolledCourses - a.enrolledCourses
        case 'spent':
          return b.totalSpent - a.totalSpent
        case 'joinDate':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [students, searchTerm, statusFilter, sortBy])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    )
  }

  const handleViewProfile = (studentId: string) => {
    router.push(`/manager/students/${studentId}`)
  }

  const totalStudents = students.length
  const activeStudents = students.filter(s => s.status === 'active').length
  const averageProgress =
    students.reduce((sum, student) => sum + student.totalProgress, 0) /
    students.length
  const totalRevenue = students.reduce(
    (sum, student) => sum + student.totalSpent,
    0
  )

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Student Management</h1>
          <p className='text-muted-foreground'>
            Monitor and manage your course students
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Students
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalStudents}</div>
            <p className='text-xs text-muted-foreground'>
              {activeStudents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Progress
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {averageProgress.toFixed(1)}%
            </div>
            <p className='text-xs text-muted-foreground'>Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${totalRevenue.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              From student purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Completion Rate
            </CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(
                (students.reduce((sum, s) => sum + s.completedCourses, 0) /
                  students.reduce((sum, s) => sum + s.enrolledCourses, 0)) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className='text-xs text-muted-foreground'>Course completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search students by name or email...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full md:w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
            <SelectItem value='suspended'>Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className='w-full md:w-[180px]'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='name'>Name</SelectItem>
            <SelectItem value='progress'>Progress</SelectItem>
            <SelectItem value='courses'>Courses</SelectItem>
            <SelectItem value='spent'>Spending</SelectItem>
            <SelectItem value='joinDate'>Join Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredAndSortedStudents.length})</CardTitle>
          <CardDescription>
            Detailed view of your course students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {filteredAndSortedStudents.map(student => (
              <div
                key={student.id}
                className='flex items-center justify-between p-4 border rounded-lg'
              >
                <div className='flex items-center space-x-4'>
                  <Avatar>
                    <AvatarImage src={student.avatar || '/placeholder.svg'} />
                    <AvatarFallback>
                      {student.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className='space-y-1'>
                    <div className='flex items-center space-x-2'>
                      <button
                        className='font-medium hover:underline focus:outline-none focus:underline'
                        onClick={() => handleViewProfile(student.id)}
                      >
                        {student.name}
                      </button>
                      {getStatusBadge(student.status)}
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {student.email}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {student.location}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-8'>
                  <div className='text-center'>
                    <p className='text-sm font-medium'>
                      {student.enrolledCourses}
                    </p>
                    <p className='text-xs text-muted-foreground'>Courses</p>
                  </div>

                  <div className='text-center min-w-[100px]'>
                    <div className='flex items-center space-x-2'>
                      <Progress
                        value={student.totalProgress}
                        className='w-16'
                      />
                      <span className='text-sm font-medium'>
                        {student.totalProgress}%
                      </span>
                    </div>
                    <p className='text-xs text-muted-foreground'>Progress</p>
                  </div>

                  <div className='text-center'>
                    <p className='text-sm font-medium'>${student.totalSpent}</p>
                    <p className='text-xs text-muted-foreground'>Spent</p>
                  </div>

                  <div className='text-center'>
                    <p className='text-sm font-medium'>
                      {new Date(student.lastActive).toLocaleDateString()}
                    </p>
                    <p className='text-xs text-muted-foreground'>Last Active</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() => handleViewProfile(student.id)}
                      >
                        <UserCheck className='mr-2 h-4 w-4' />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className='mr-2 h-4 w-4' />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Filter className='mr-2 h-4 w-4' />
                        Manage Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedStudents.length === 0 && (
            <div className='text-center py-8'>
              <Users className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-2 text-sm font-semibold'>No students found</h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
