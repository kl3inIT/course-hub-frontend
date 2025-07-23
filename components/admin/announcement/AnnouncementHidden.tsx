import { Pagination } from '@/components/admin/announcement/Pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { announcementApi } from '@/services/announcement-api'
import { AnnouncementStatus } from '@/types/announcement'
import { format } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Announcement {
  id: number
  title: string
  type: string
  targetGroup: string
  targetGroupDescription?: string
  status: string
  sentTime?: string
  createdAt?: string
  updatedAt?: string // dùng làm hidden time
  createdByName?: string
}

// Helper để lấy màu badge theo status
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-200 text-gray-800'
    case 'SCHEDULED':
      return 'bg-blue-200 text-blue-800'
    case 'SENT':
      return 'bg-black text-white'
    case 'CANCELLED':
      return 'bg-red-200 text-red-800'
    case 'HIDDEN':
      return 'bg-yellow-200 text-yellow-800'
    default:
      return 'bg-gray-200 text-gray-800'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'GENERAL':
      return 'General'
    case 'COURSE_UPDATE':
      return 'Course Update'
    case 'SYSTEM_MAINTENANCE':
      return 'System Maintenance'
    case 'PROMOTION':
      return 'Promotion'
    case 'EMERGENCY':
      return 'Emergency'
    default:
      return type
  }
}

export default function AnnouncementHidden({
  filters,
  onStatsChange,
}: {
  filters?: any
  onStatsChange: () => void
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')

  const fetchHiddenAnnouncements = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        size: pageSize,
        search: search || undefined,
        status: AnnouncementStatus.HIDDEN, // filter đúng enum
      }
      const response = await announcementApi.getAnnouncements(params)
      const data: any = response.data
      const pageData = data.data // Lấy đúng object chứa content, page, ...
      console.log('pageData:', pageData)
      setAnnouncements(pageData.content || [])
      setTotalPages(pageData.totalPages || pageData.page?.totalPages)
      setTotalElements(pageData.totalElements || pageData.page?.totalElements)
    } catch (err) {
      setError('Failed to load hidden announcements')
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    fetchHiddenAnnouncements()
  }, [fetchHiddenAnnouncements])

  const handleUnhide = async (id: number) => {
    try {
      await announcementApi.unarchiveAnnouncement(id.toString())
      toast.success('Announcement unhidden successfully')
      fetchHiddenAnnouncements()
      onStatsChange()
    } catch (err) {
      toast.error('Failed to unhide announcement')
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4 mb-4'>
        <Input
          placeholder='Search hidden announcements...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='w-[300px]'
        />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Target Group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent Time</TableHead>
              <TableHead>Hidden Time</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center text-destructive'>
                  {error}
                </TableCell>
              </TableRow>
            ) : !Array.isArray(announcements) || announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center'>
                  No hidden announcements found
                </TableCell>
              </TableRow>
            ) : (
              announcements.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>{getTypeLabel(a.type)}</TableCell>
                  <TableCell>
                    {a.targetGroupDescription || a.targetGroup}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeVariant(a.status)}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {a.sentTime
                      ? format(new Date(a.sentTime), 'dd/MM/yyyy HH:mm')
                      : ''}
                  </TableCell>
                  <TableCell>
                    {a.updatedAt
                      ? format(new Date(a.updatedAt), 'dd/MM/yyyy HH:mm')
                      : ''}
                  </TableCell>
                  <TableCell>{a.createdByName}</TableCell>
                  <TableCell>
                    <Button size='sm' onClick={() => handleUnhide(a.id)}>
                      Unhide
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          size={pageSize}
          onPageChange={setPage}
          onSizeChange={setPageSize}
        />
      )}
    </div>
  )
}
