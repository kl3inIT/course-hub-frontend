import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPaginationProps } from '@/types/user-management'

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 / page' },
  { value: '10', label: '10 / page' },
  { value: '20', label: '20 / page' },
  { value: '50', label: '50 / page' },
] as const

export function Pagination({
  pagination,
  activeTab,
  onPageChange,
  onPageSizeChange,
}: UserPaginationProps) {
  const { currentPage, totalPages, totalElements, pageSize } = pagination
  const hasData = totalElements > 0
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements)

  return (
    <div className='flex items-center justify-between space-x-2 py-4'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {hasData
          ? `Showing ${startItem} to ${endItem} of ${totalElements} ${activeTab}s`
          : `No ${activeTab}s found`}
      </div>
      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || !hasData}
        >
          Previous
        </Button>
        {hasData && (
          <div className='text-sm font-medium'>
            Page {currentPage + 1} of {totalPages}
          </div>
        )}
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || !hasData}
        >
          Next
        </Button>
        <Select
          value={pageSize.toString()}
          onValueChange={value => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className='w-[110px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
