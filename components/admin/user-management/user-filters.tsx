import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserStatus } from '@/types/user'
import { UserFiltersProps } from '@/types/user-management'
import { Search } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: UserStatus.ACTIVE, label: 'Active' },
  { value: UserStatus.BANNED, label: 'Banned' },
] as const

export function UserFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  activeTab,
}: UserFiltersProps) {
  return (
    <div className='flex items-center space-x-2 mb-4'>
      <div className='relative flex-1'>
        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder={`Search ${activeTab}s...`}
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className='pl-8'
        />
      </div>
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className='w-[150px]'>
          <SelectValue />
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
  )
}
 