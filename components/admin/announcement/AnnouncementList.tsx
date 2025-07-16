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
import {
  Archive,
  ArchiveRestore,
  Copy,
  Edit,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Pagination } from './Pagination'

export function AnnouncementList({
  filters,
}: {
  filters: {
    search: string
    type: string
    status: string
    targetGroup?: string
  }
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
    'clone' | 'hide' | 'unhide' | 'delete' | null
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
        isDeleted: 0, // Chỉ lấy những announcement chưa bị ẩn
        mode: 'list',
        sortBy: 'createdDate',
        direction: 'DESC',
      })
      .then(res => {
        const data = res.data.data
        setAnnouncements(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      })
      .catch(() => setError('Failed to load announcements'))
      .finally(() => setLoading(false))
  }, [page, size, filters])

  useEffect(() => {
    console.log('DEBUG PAGINATION:', { page, totalPages })
  }, [page, totalPages])

  const handleSendNow = async (id: string) => {
    try {
      await announcementApi.sendAnnouncement(id)
      toast.success('Announcement sent successfully')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to send announcement')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await announcementApi.cancelAnnouncement(id)
      toast.success('Announcement cancelled')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to cancel announcement')
    }
  }

  const handleClone = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDialog('clone')
  }

  const handleHide = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDialog('hide')
  }

  const handleUnhide = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDialog('unhide')
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
      window.location.reload()
    } catch (error) {
      toast.error('Failed to clone announcement')
    } finally {
      setShowDialog(null)
      setSelectedAnnouncement(null)
    }
  }

  const confirmHide = async () => {
    if (!selectedAnnouncement) return
    try {
      await announcementApi.archiveAnnouncement(selectedAnnouncement.id)
      toast.success('Announcement hidden!')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to hide announcement')
    } finally {
      setShowDialog(null)
      setSelectedAnnouncement(null)
    }
  }

  const confirmUnhide = async () => {
    if (!selectedAnnouncement) return
    try {
      await announcementApi.unarchiveAnnouncement(selectedAnnouncement.id)
      toast.success('Announcement unhidden!')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to unhide announcement')
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

  const renderActionButtons = (announcement: Announcement) => {
    const buttons = []
    // Edit chỉ cho DRAFT/SCHEDULED
    if (
      announcement.status === AnnouncementStatus.DRAFT ||
      announcement.status === AnnouncementStatus.SCHEDULED
    ) {
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
    // Hide cho SENT (chưa bị xóa)
    if (
      announcement.status === AnnouncementStatus.SENT &&
      !announcement.isDeleted
    ) {
      buttons.push(
        <Button
          key='hide'
          variant='destructive'
          size='sm'
          onClick={() => handleHide(announcement)}
          className='mr-1'
        >
          <Archive className='h-4 w-4' />
        </Button>
      )
    }
    // Unhide nếu đã bị xóa (isDeleted)
    if (announcement.isDeleted) {
      buttons.push(
        <Button
          key='unhide'
          variant='default'
          size='sm'
          onClick={() => handleUnhide(announcement)}
          className='mr-1'
        >
          <ArchiveRestore className='h-4 w-4' />
        </Button>
      )
    }
    // Cancel cho SCHEDULED
    if (announcement.status === AnnouncementStatus.SCHEDULED) {
      buttons.push(
        <Button
          key='cancel'
          variant='destructive'
          size='sm'
          onClick={() => {
            if (
              window.confirm(
                'Are you sure you want to cancel this scheduled announcement?'
              )
            )
              handleCancel(announcement.id)
          }}
          className='mr-1'
        >
          <X className='h-4 w-4' />
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
            if (window.confirm('Send this announcement now?'))
              handleSendNow(announcement.id)
          }}
          className='mr-1'
        >
          <Send className='h-4 w-4' />
        </Button>
      )
    }
    // Delete permanently (chỉ cho DRAFT, SCHEDULED - không cho SENT, CANCELLED)
    if (
      announcement.status === 'DRAFT' ||
      announcement.status === 'SCHEDULED'
    ) {
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
                    <TableCell className='px-3 py-2'>{a.type}</TableCell>
                    <TableCell className='px-3 py-2'>{a.targetGroup}</TableCell>
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

      {/* Hide Dialog */}
      <AlertDialog
        open={showDialog === 'hide'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to hide "{selectedAnnouncement?.title}"?
              This will hide the announcement from users but you can restore it
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmHide}
              className='bg-red-600 hover:bg-red-700'
            >
              Hide
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unhide Dialog */}
      <AlertDialog
        open={showDialog === 'unhide'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unhide Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unhide "{selectedAnnouncement?.title}
              "? This will make the announcement visible to users again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnhide}
              className='bg-green-600 hover:bg-green-700'
            >
              Unhide
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
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
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
