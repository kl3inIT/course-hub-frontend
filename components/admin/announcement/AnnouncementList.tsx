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
import { ArchiveRestore, Copy, Edit, Send, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Pagination } from './Pagination'

export function AnnouncementList({
  filters,
  onStatsChange,
}: {
  filters: {
    search: string
    type: string // string để so sánh với 'ALL'
    status: string
    targetGroup?: string
    startDate?: string
    endDate?: string
  }
  onStatsChange: () => void
}) {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [showDialog, setShowDialog] = useState<
    'clone' | 'delete' | 'send' | 'cancel' | null
  >(null)
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null)

  useEffect(() => {
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
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        mode: 'list',
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
      .catch(() => setError('Failed to load announcements'))
      .finally(() => setLoading(false))
  }, [page, size, filters])

  useEffect(() => {}, [page, totalPages])

  const handleSendNow = async () => {
    if (!selectedAnnouncement) return
    try {
      await announcementApi.sendAnnouncement(selectedAnnouncement.id)
      toast.success('Announcement sent successfully')
      onStatsChange()
      window.location.reload()
    } catch (error) {
      toast.error('Failed to send announcement')
    } finally {
      setShowDialog(null)
      setSelectedAnnouncement(null)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await announcementApi.cancelAnnouncement(id)
      toast.success('Announcement cancelled')
      onStatsChange()
      window.location.reload()
    } catch (error) {
      toast.error('Failed to cancel announcement')
    }
  }

  const handleClone = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDialog('clone')
  }

  const handleDelete = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDialog('delete')
  }

  const confirmClone = async () => {
    if (!selectedAnnouncement) return
    try {
      await announcementApi.cloneAnnouncement(selectedAnnouncement.id)
      toast.success('Cloned to new draft!')
      onStatsChange()
      window.location.reload()
    } catch (error) {
      toast.error('Failed to clone announcement')
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
      window.location.reload()
    } catch (error) {
      toast.error('Failed to delete announcement')
    } finally {
      setShowDialog(null)
      setSelectedAnnouncement(null)
    }
  }

  const getStatusBadgeVariant = (status: AnnouncementStatus) => {
    switch (status) {
      case AnnouncementStatus.DRAFT:
        return 'secondary'
      case AnnouncementStatus.SCHEDULED:
        return 'default'
      case AnnouncementStatus.SENT:
        return 'default'
      case AnnouncementStatus.CANCELLED:
        return 'destructive'
      default:
        return 'secondary'
    }
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

  const renderActionButtons = (announcement: Announcement) => {
    const buttons = []
    // Nếu là SCHEDULED chỉ cho phép Cancel
    if (announcement.status === AnnouncementStatus.SCHEDULED) {
      buttons.push(
        <Button
          key='cancel'
          variant='destructive'
          size='sm'
          onClick={() => {
            setSelectedAnnouncement(announcement)
            setShowDialog('cancel')
          }}
          className='mr-1'
        >
          <X className='h-4 w-4' />
        </Button>
      )
      return buttons
    }
    // Edit chỉ cho DRAFT
    if (announcement.status === AnnouncementStatus.DRAFT) {
      buttons.push(
        <Button
          key='edit'
          variant='outline'
          size='sm'
          onClick={() =>
            router.push(`/admin/announcements/edit/${announcement.id}`)
          }
          className='mr-1'
        >
          <Edit className='h-4 w-4' />
        </Button>
      )
    }
    // Clone cho SENT/CANCELLED
    if (
      announcement.status === AnnouncementStatus.SENT ||
      announcement.status === AnnouncementStatus.CANCELLED
    ) {
      buttons.push(
        <Button
          key='clone'
          variant='outline'
          size='sm'
          onClick={() => handleClone(announcement)}
          className='mr-1'
        >
          <Copy className='h-4 w-4' />
        </Button>
      )
    }
    // Send cho DRAFT
    if (announcement.status === AnnouncementStatus.DRAFT) {
      buttons.push(
        <Button
          key='send'
          variant='default'
          size='sm'
          onClick={() => {
            setSelectedAnnouncement(announcement)
            setShowDialog('send')
          }}
          className='mr-1'
        >
          <Send className='h-4 w-4' />
        </Button>
      )
    }
    // Delete permanently (chỉ cho DRAFT - không cho SCHEDULED, SENT, CANCELLED)
    if (announcement.status === 'DRAFT') {
      buttons.push(
        <Button
          key='delete'
          variant='destructive'
          size='sm'
          onClick={() => handleDelete(announcement)}
          className='mr-1'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      )
    }
    return buttons
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
                    No announcements found
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
                      <Badge variant={getStatusBadgeVariant(a.status)}>
                        {a.status}
                      </Badge>
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
                      <div className='flex gap-1'>{renderActionButtons(a)}</div>
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

      {/* Send Now Dialog */}
      <AlertDialog
        open={showDialog === 'send'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Announcement Now</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send "{selectedAnnouncement?.title}" now?
              This will immediately send the announcement to all target users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendNow}>
              Send Now
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

      {/* Cancel Dialog */}
      <AlertDialog
        open={showDialog === 'cancel'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{selectedAnnouncement?.title}"?
              This will stop the scheduled announcement from being sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedAnnouncement && handleCancel(selectedAnnouncement.id)
              }
              disabled={!selectedAnnouncement}
            >
              Confirm Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function HiddenAnnouncementList({
  filters,
}: {
  filters: {
    search: string
    type: string
  }
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    announcementApi
      .getAnnouncements({
        page,
        size,
        isDeleted: 1, // Chỉ lấy những announcement đã bị ẩn
        type:
          filters.type && filters.type !== 'ALL'
            ? (filters.type as AnnouncementType)
            : undefined,
        search: filters.search || undefined,
        mode: 'list',
        sortBy: 'createdDate',
        direction: 'DESC',
      })
      .then(res => {
        const data = res.data.data
        setAnnouncements(data.content)
        setTotalPages(
          typeof data.totalPages === 'number' && data.totalPages > 0
            ? data.totalPages
            : 1
        )
        setTotalElements(data.totalElements || 0)
      })
      .catch(() => setError('Failed to load archived announcements'))
      .finally(() => setLoading(false))
  }, [page, size, filters])

  const handleRestore = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDialog(true)
  }

  const confirmRestore = async () => {
    if (!selectedAnnouncement) return
    try {
      await announcementApi.unarchiveAnnouncement(selectedAnnouncement.id)
      toast.success('Announcement restored!')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to restore announcement')
    } finally {
      setShowDialog(false)
      setSelectedAnnouncement(null)
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
                    No hidden announcements found
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map(a => (
                  <TableRow key={a.id} className='border-b hover:bg-muted/50'>
                    <TableCell className='px-3 py-2'>{a.title}</TableCell>
                    <TableCell className='px-3 py-2'>{a.type}</TableCell>
                    <TableCell className='px-3 py-2'>{a.targetGroup}</TableCell>
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
                      <Button
                        variant='default'
                        size='sm'
                        onClick={() => handleRestore(a)}
                        className='mr-1'
                      >
                        <ArchiveRestore className='h-4 w-4' />
                        Restore
                      </Button>
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

      {/* Restore Dialog */}
      {selectedAnnouncement && (
        <div>
          <div
            className={`fixed inset-0 bg-black/40 z-50 ${showDialog ? '' : 'hidden'}`}
            onClick={() => setShowDialog(false)}
          />
          <div
            className={`fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md ${showDialog ? '' : 'hidden'}`}
          >
            <div className='mb-4'>
              <div className='font-bold text-lg mb-2'>Restore Announcement</div>
              <div className='text-muted-foreground mb-2'>
                Are you sure you want to restore "{selectedAnnouncement.title}"?
                This will make the announcement visible to users again.
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                variant='default'
                onClick={confirmRestore}
                className='bg-green-600 hover:bg-green-700'
              >
                Restore
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
