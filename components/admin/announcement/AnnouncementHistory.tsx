import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { announcementApi } from '@/services/announcement-api'
import {
  Announcement,
  AnnouncementStatus,
  AnnouncementType,
  TargetGroup,
} from '@/types/announcement'
import { format } from 'date-fns'
import { ArchiveRestore, Copy, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Pagination } from './Pagination'

export function AnnouncementHistory({
  filters,
  onStatsChange,
}: {
  filters: {
    search: string
    type: string
    status: string
    targetGroup?: string
  }
  onStatsChange: () => void
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [showDialog, setShowDialog] = useState<
    'clone' | 'archive' | 'restore' | 'delete' | null
  >(null)
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null)

  const router = useRouter()

  const handleClone = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDialog('clone')
  }

  const handleArchive = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDialog('archive')
  }

  const handleRestore = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDialog('restore')
  }

  const handleDelete = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDialog('delete')
  }

  const fetchHistory = useCallback(() => {
    setLoading(true)
    setError(null)
    announcementApi
      .getAnnouncements({
        page,
        size,
        type:
          filters.type && filters.type !== 'ALL'
            ? (filters.type as AnnouncementType)
            : undefined,
        status:
          filters.status && filters.status !== 'ALL'
            ? (filters.status as AnnouncementStatus)
            : undefined,
        targetGroup:
          filters.targetGroup && filters.targetGroup !== 'ALL'
            ? (filters.targetGroup as TargetGroup)
            : undefined,
        search: filters.search || undefined,
        mode: 'history',
        sortBy: 'createdDate',
        direction: 'DESC',
      })
      .then(res => {
        const data: any = res.data.data
        setAnnouncements(data.content)
        // Lấy phân trang từ data.page hoặc root
        const totalPages =
          typeof data.page?.totalPages === 'number'
            ? data.page.totalPages
            : typeof data.totalPages === 'number'
              ? data.totalPages
              : 1
        const totalElements =
          typeof data.page?.totalElements === 'number'
            ? data.page.totalElements
            : typeof data.totalElements === 'number'
              ? data.totalElements
              : 0
        setTotalPages(totalPages > 0 ? totalPages : 1)
        setTotalElements(totalElements)
      })
      .catch(() => setError('Failed to load announcement history'))
      .finally(() => setLoading(false))
  }, [page, size, filters])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const confirmClone = async () => {
    if (!selectedAnnouncement) return
    try {
      await announcementApi.cloneAnnouncement(selectedAnnouncement.id)
      toast.success('Cloned to new draft!')
      onStatsChange()
      fetchHistory()
    } catch (error) {
      toast.error('Failed to clone announcement')
    } finally {
      setShowDialog(null)
      setSelectedAnnouncement(null)
    }
  }

  const confirmArchive = async () => {
    if (!selectedAnnouncement) return
    try {
      await announcementApi.archiveAnnouncement(selectedAnnouncement.id)
      toast.success('Announcement archived!')
      onStatsChange()
      fetchHistory()
    } catch (error) {
      toast.error('Failed to archive announcement')
    } finally {
      setShowDialog(null)
      setSelectedAnnouncement(null)
    }
  }

  const confirmRestore = async () => {
    if (!selectedAnnouncement) return
    try {
      await announcementApi.unarchiveAnnouncement(selectedAnnouncement.id)
      toast.success('Announcement restored!')
      onStatsChange()
      fetchHistory()
    } catch (error) {
      toast.error('Failed to restore announcement')
    } finally {
      setShowDialog(null)
      setSelectedAnnouncement(null)
    }
  }

  const confirmDelete = async () => {
    if (!selectedAnnouncement) return
    try {
      await announcementApi.permanentlyDeleteAnnouncement(
        selectedAnnouncement.id
      )
      toast.success('Announcement deleted permanently!')
      onStatsChange()
      fetchHistory()
    } catch (error) {
      toast.error('Failed to delete announcement')
    } finally {
      setShowDialog(null)
      setSelectedAnnouncement(null)
    }
  }

  const renderActionButtons = (a: Announcement) => {
    const buttons = []
    if (
      a.status === AnnouncementStatus.SENT ||
      a.status === AnnouncementStatus.CANCELLED
    ) {
      // View (readonly)
      buttons.push(
        <Button
          key='view'
          variant='outline'
          size='sm'
          onClick={() => router.push(`/admin/announcements/view/${a.id}`)}
          className='mr-1'
        >
          <Eye className='h-4 w-4' />
        </Button>
      )
      // Clone
      buttons.push(
        <Button
          key='clone'
          variant='outline'
          size='sm'
          onClick={() => handleClone(a)}
          className='mr-1'
        >
          <Copy className='h-4 w-4' />
        </Button>
      )
    }

    // Archive for SENT announcements (not deleted)
    if (a.status === AnnouncementStatus.SENT && !a.isDeleted) {
      buttons.push(
        <Button
          key='archive'
          variant='destructive'
          size='sm'
          onClick={() => handleArchive(a)}
          className='mr-1'
        >
          <EyeOff className='h-4 w-4' />
        </Button>
      )
    }

    // Restore for archived announcements
    if (a.isDeleted) {
      buttons.push(
        <Button
          key='restore'
          variant='default'
          size='sm'
          onClick={() => handleRestore(a)}
          className='mr-1'
        >
          <ArchiveRestore className='h-4 w-4' />
        </Button>
      )
    }

    // Delete permanently cho CANCELLED
    if (a.status === 'CANCELLED') {
      buttons.push(
        <Button
          key='delete'
          variant='destructive'
          size='sm'
          onClick={() => handleDelete(a)}
          className='mr-1'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      )
    }

    return buttons
  }

  const getTargetGroupLabel = (group: string) => {
    switch (group) {
      case 'ALL_USERS':
        return 'All Users'
      case 'LEARNERS_ONLY':
        return 'Learners Only'
      case 'MANAGERS_ONLY':
        return 'Managers Only'
      case 'SPECIFIC_USERS':
        return 'Specific Users'
      default:
        return group
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

  return (
    <>
      <Card className='shadow-sm border rounded-xl'>
        <div className='overflow-x-auto'>
          <Table className='min-w-full text-sm'>
            <TableHeader>
              <TableRow className='border-b bg-gray-50'>
                <TableHead className='px-3 py-2 text-left font-semibold'>
                  Title
                </TableHead>
                <TableHead className='px-3 py-2 text-left font-semibold'>
                  Type
                </TableHead>
                <TableHead className='px-3 py-2 text-left font-semibold'>
                  Target Group
                </TableHead>
                <TableHead className='px-3 py-2 text-left font-semibold'>
                  Status
                </TableHead>
                <TableHead className='px-3 py-2 text-left font-semibold'>
                  Created By
                </TableHead>
                <TableHead className='px-3 py-2 text-left font-semibold'>
                  Sent Time
                </TableHead>
                <TableHead className='px-3 py-2 text-left font-semibold'>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center py-8 text-muted-foreground'
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center py-8 text-destructive'
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center py-8 text-muted-foreground'
                  >
                    No announcement history found
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map(a => (
                  <TableRow key={a.id} className='border-b hover:bg-muted/50'>
                    <TableCell className='px-3 py-2'>{a.title}</TableCell>
                    <TableCell className='px-3 py-2'>
                      {getTypeLabel(a.type)}
                    </TableCell>
                    <TableCell className='px-3 py-2'>
                      {getTargetGroupLabel(a.targetGroup)}
                    </TableCell>
                    <TableCell className='px-3 py-2'>
                      <Badge>{a.status}</Badge>
                    </TableCell>
                    <TableCell className='px-3 py-2'>
                      {a.createdByName || '-'}
                    </TableCell>
                    <TableCell className='px-3 py-2'>
                      {a.sentTime
                        ? format(new Date(a.sentTime), 'dd/MM/yyyy HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell className='px-3 py-2'>
                      {renderActionButtons(a)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            totalPages={totalPages}
            size={size}
            onPageChange={setPage}
            onSizeChange={newSize => {
              setSize(newSize)
              setPage(0)
            }}
          />
        </div>
      </Card>

      {/* Clone Dialog */}
      <AlertDialog
        open={showDialog === 'clone'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clone Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clone "{selectedAnnouncement?.title}" to
              a new draft? This will create a copy of the announcement that you
              can edit and send.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClone}>Clone</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog
        open={showDialog === 'archive'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to hide "{selectedAnnouncement?.title}"?
              This will hide the announcement from users. You can restore it
              later in the Hidden section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchive}
              className='bg-red-600 hover:bg-red-700'
            >
              Hide
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog
        open={showDialog === 'restore'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{selectedAnnouncement?.title}"?
              This will make the announcement visible to users again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRestore}
              className='bg-green-600 hover:bg-green-700'
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={showDialog === 'delete'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "
              {selectedAnnouncement?.title}"? This action cannot be undone and
              the announcement will be removed from the system forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
