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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { User, UserStatus } from '@/types/user'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, Eye, MoreHorizontal } from 'lucide-react'

const StatusBadge = ({ status }: { status: UserStatus }) => {
  const statusConfig = {
    [UserStatus.ACTIVE]: {
      className: 'bg-green-100 text-green-800',
      label: 'Active',
    },
    [UserStatus.INACTIVE]: {
      className: 'bg-gray-100 text-black',
      label: 'Inactive',
    },
    [UserStatus.BANNED]: {
      className: 'bg-red-100 text-red-600',
      label: 'Banned',
    },
  }

  const config = statusConfig[status]
  return <Badge className={config.className}>{config.label}</Badge>
}

const UserAvatar = ({ user }: { user: User }) => {
  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
    : user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <Avatar className='h-8 w-8'>
      <AvatarImage src={user.avatar || '/placeholder.svg?height=32&width=32'} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

interface UserActionsProps {
  user: User
  activeTab: 'learner' | 'manager'
  onViewProfile: (id: number) => void
  onUpdateUserStatus: (id: number, status: UserStatus) => void
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  activeTab,
  onViewProfile,
  onUpdateUserStatus,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='ghost' className='h-8 w-8 p-0'>
        <MoreHorizontal className='h-4 w-4' />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align='end'>
      <DropdownMenuItem onClick={() => onViewProfile(user.id)}>
        <Eye className='mr-2 h-4 w-4' />
        View Profile
      </DropdownMenuItem>
      {activeTab === 'manager' && (
        <>
          <DropdownMenuSeparator />
          {user.status === UserStatus.INACTIVE ? (
            <DropdownMenuItem
              onClick={() => onUpdateUserStatus(user.id, UserStatus.ACTIVE)}
              className='text-green-600'
            >
              <CheckCircle className='mr-2 h-4 w-4' />
              Activate
            </DropdownMenuItem>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={e => e.preventDefault()}
                  className='text-red-600'
                >
                  <AlertTriangle className='mr-2 h-4 w-4 text-yellow-500' />
                  Deactivate
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate Manager?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will deactivate the manager account. They will not be
                    able to log in until reactivated.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      onUpdateUserStatus(user.id, UserStatus.INACTIVE)
                    }
                    className='bg-red-600 hover:bg-red-700'
                  >
                    Confirm Deactivate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
)

interface UserTableProps {
  users: User[]
  activeTab: 'learner' | 'manager'
  onViewProfile: (id: number) => void
  onUpdateUserStatus: (id: number, status: UserStatus) => void
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  activeTab,
  onViewProfile,
  onUpdateUserStatus,
}) => {
  const formatDate = (date?: string) => {
    if (!date) return '-'
    try {
      return format(new Date(date), 'dd/MM/yyyy')
    } catch {
      return '-'
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead>
            {activeTab === 'learner' ? 'Enrolled' : 'Managed'} Courses
          </TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>
              <div className='flex items-center space-x-3'>
                <UserAvatar user={user} />
                <div>
                  <div className='font-medium'>{user.name}</div>
                  <div className='text-sm text-muted-foreground'>
                    {user.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={user.status} />
            </TableCell>
            <TableCell>{formatDate(user.joinDate)}</TableCell>
            <TableCell>
              <div className='flex items-center space-x-1'>
                <span className='font-medium'>
                  {activeTab === 'learner'
                    ? user.enrolledCoursesCount
                    : user.managedCoursesCount}
                </span>
                <span className='text-xs text-muted-foreground'>courses</span>
              </div>
            </TableCell>
            <TableCell className='text-right'>
              <UserActions
                user={user}
                activeTab={activeTab}
                onViewProfile={onViewProfile}
                onUpdateUserStatus={onUpdateUserStatus}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
