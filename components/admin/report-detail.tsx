'use client'

import { commentApi } from '@/api/comment-api'
import { reportApi } from '@/api/report-api'
import { reviewApi } from '@/api/review-api'
import { userApi } from '@/api/user-api'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  ReportResponse,
  ReportStatus,
  ResourceLocationDTO,
} from '@/types/report'
import { format } from 'date-fns'
import {
  AlertTriangle,
  Ban,
  Calendar,
  Eye,
  Flag,
  Info,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Shield,
  Tag,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// Custom badge styles
const badgeStyles = {
  PENDING:
    'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-yellow-200',
  APPROVED:
    'bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 hover:bg-red-100/80 border-red-200',
}

// Predefined action notes
const ACTION_NOTE_OPTIONS = {
  APPROVE: [
    'Report is valid and requires action',
    'Clear violation of community guidelines',
    'Repeated offense from reported user',
    'Severe violation requiring immediate action',
  ],
  REJECT: [
    'Report is invalid or insufficient',
    'No clear violation of guidelines',
    'False or misleading report',
    'Misunderstanding of platform rules',
  ],
}

export function ReportDetail() {
  const router = useRouter()
  const params = useParams()
  const reportId = Number(params.id)

  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showNotesError, setShowNotesError] = useState(false)
  const [showDialog, setShowDialog] = useState<
    'ban' | 'unban' | 'warn' | 'hide' | 'show' | null
  >(null)
  const [hasWarned, setHasWarned] = useState(false)
  const [resourceLocation, setResourceLocation] =
    useState<ResourceLocationDTO | null>(null)

  const loadReport = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [reportResponse, locationResponse] = await Promise.all([
        reportApi.getReportById(reportId),
        reportApi.getResourceLocation(reportId),
      ])
      setReport(reportResponse.data)
      setResourceLocation(locationResponse.data)
    } catch (error) {
      setError('Failed to load report details')
      toast.error('Failed to load report details')
    } finally {
      setLoading(false)
    }
  }, [reportId])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    if (!report) return

    // Validate notes before proceeding
    if (!notes.trim()) {
      setShowNotesError(true)
      return
    }

    setShowNotesError(false)
    setIsProcessing(true)
    try {
      await reportApi.updateReportStatus(report.reportId, {
        status: action,
        actionNote: notes,
      })
      toast.success(`Report ${action.toLowerCase()} successfully`)
      await loadReport() // Reload report data
    } catch (error) {
      console.error('Error updating report:', error)
      toast.error('Failed to update report')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSelectNote = (note: string) => {
    setNotes(currentNotes => {
      if (!currentNotes) return note
      return currentNotes + (currentNotes.endsWith('.') ? ' ' : '. ') + note
    })
  }

  const getStatusBadgeStyle = (status: string) => {
    return badgeStyles[status as keyof typeof badgeStyles] || ''
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'PPpp')
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  const handleBanUser = async (userId: number) => {
    setIsProcessing(true)
    try {
      await userApi.admin.updateUserStatus(userId.toString(), 'banned')
      toast.success('User has been banned')
      await loadReport()
    } catch (error) {
      toast.error('Failed to ban user')
    } finally {
      setIsProcessing(false)
      setShowDialog(null)
    }
  }

  const handleUnbanUser = async (userId: number) => {
    setIsProcessing(true)
    try {
      await userApi.admin.updateUserStatus(userId.toString(), 'active')
      toast.success('User has been unbanned')
      await loadReport()
    } catch (error) {
      toast.error('Failed to unban user')
    } finally {
      setIsProcessing(false)
      setShowDialog(null)
    }
  }

  const handleWarnUser = async (userId: number) => {
    setIsProcessing(true)
    try {
      await userApi.admin.warnUser(
        userId,
        report?.type || undefined,
        report?.resourceId || undefined
      )
      console.log(report?.type, report?.resourceId)
      toast.success('Warning has been issued to user')
      setHasWarned(true)
      await loadReport()
    } catch (error) {
      toast.error('Failed to warn user')
    } finally {
      setIsProcessing(false)
      setShowDialog(null)
    }
  }

  const handleContentVisibility = async (
    resourceId: number,
    type: string,
    hide: boolean
  ) => {
    setIsProcessing(true)
    try {
      if (type === 'COMMENT') {
        await commentApi.admin.setCommentVisibility(resourceId, hide)
        toast.success(`Comment has been ${hide ? 'hidden' : 'shown'}`)
      } else {
        await reviewApi.setReviewVisibility(resourceId, hide)
        toast.success(`Review has been ${hide ? 'hidden' : 'shown'}`)
      }
      await loadReport()
    } catch (error) {
      toast.error(`Failed to ${hide ? 'hide' : 'show'} ${type.toLowerCase()}`)
    } finally {
      setIsProcessing(false)
      setShowDialog(null)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-8'>
        <p className='text-sm text-destructive'>
          {error || 'Report not found'}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className='container max-w-4xl mx-auto py-6 space-y-6'>
      {/* Report Information */}
      <Card className='shadow-md'>
        <CardHeader className='border-b bg-muted/20'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='p-2 bg-primary/10 rounded-full'>
                <Flag className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle>Report #{report.reportId}</CardTitle>
                <CardDescription>
                  <div className='flex items-center gap-2 mt-1'>
                    <Calendar className='h-4 w-4' />
                    {formatDate(report.createdAt)}
                  </div>
                </CardDescription>
              </div>
            </div>
            <Badge
              className={cn(
                'px-4 py-1 text-sm font-medium',
                getStatusBadgeStyle(report.status)
              )}
              variant='outline'
            >
              {report.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='pt-6'>
          <div className='grid gap-8'>
            {/* Basic Information */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Basic Information</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Tag className='h-4 w-4' />
                    Type
                  </div>
                  <Badge variant='outline' className='mt-1'>
                    {report.type}
                  </Badge>
                </div>

                <div className='space-y-1'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <AlertTriangle className='h-4 w-4' />
                    Severity
                  </div>
                  <Badge
                    variant={
                      report.severity === 'HIGH' ? 'destructive' : 'default'
                    }
                    className={cn(
                      report.severity === 'HIGH'
                        ? 'bg-red-100 text-red-800 hover:bg-red-100/80 border-red-200'
                        : report.severity === 'MEDIUM'
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-100/80 border-orange-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200'
                    )}
                  >
                    {report.severity}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* User Information */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>User Information</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div className='p-4 rounded-lg border bg-card'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-100 rounded-full'>
                      <User className='h-4 w-4 text-blue-600' />
                    </div>
                    <div>
                      <div className='text-sm font-medium'>
                        {report.reporterName}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Reporter
                      </div>
                    </div>
                  </div>
                </div>

                <div className='p-4 rounded-lg border bg-card'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-red-100 rounded-full'>
                      <User className='h-4 w-4 text-red-600' />
                    </div>
                    <div>
                      <div className='text-sm font-medium'>
                        {report.reportedUserName}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Reported User
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Member since{' '}
                        {formatDate(report.reportedUserMemberSince)}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Warning count: {report.warningCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Report Content */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Report Content</h3>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <MessageSquare className='h-4 w-4' />
                      Reason
                    </div>
                    {resourceLocation && (
                      <Link
                        href={
                          report.type === 'REVIEW'
                            ? `/courses/${resourceLocation.courseId}`
                            : `/learn/${resourceLocation.courseId}/${resourceLocation.lessonId}`
                        }
                        className='text-sm text-blue-600 hover:underline flex items-center gap-1'
                        target='_blank'
                      >
                        <Eye className='h-4 w-4' />
                        View {report.type.toLowerCase()}
                      </Link>
                    )}
                  </div>
                  <div className='p-4 rounded-lg border bg-muted/50'>
                    {report.reason}
                  </div>
                </div>

                {resourceLocation && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Tag className='h-4 w-4' />
                      Location
                    </div>
                    <div className='p-4 rounded-lg border bg-muted/50'>
                      <div className='space-y-1'>
                        <p className='text-sm'>
                          Course: {resourceLocation.courseName}
                        </p>
                        {report.type === 'COMMENT' && (
                          <>
                            <p className='text-sm'>
                              Module: {resourceLocation.moduleName}
                            </p>
                            <p className='text-sm'>
                              Lesson: {resourceLocation.lessonName}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {report.description && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Info className='h-4 w-4' />
                      Additional Description
                    </div>
                    <div className='p-4 rounded-lg border bg-muted/50'>
                      {report.description}
                    </div>
                  </div>
                )}

                {report.actionNote && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Shield className='h-4 w-4' />
                      Admin Notes
                    </div>
                    <div className='p-4 rounded-lg border bg-muted/50'>
                      {report.actionNote}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Notes - Only shown when status is Pending */}
      {report.status === 'PENDING' && (
        <Card className='shadow-md'>
          <CardHeader>
            <CardTitle className='text-lg'>Take Action</CardTitle>
            <CardDescription>
              Review the report and take appropriate action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex gap-2'>
                  <div className='flex-1'>
                    <Textarea
                      placeholder='Enter your notes here...'
                      value={notes}
                      onChange={e => {
                        setNotes(e.target.value)
                        if (showNotesError && e.target.value.trim()) {
                          setShowNotesError(false)
                        }
                      }}
                      className={cn(
                        'min-h-[100px] resize-none',
                        showNotesError &&
                          'border-red-500 focus-visible:ring-red-500'
                      )}
                      required
                    />
                    {showNotesError && (
                      <p className='text-sm text-red-500 mt-2'>
                        Please add notes before taking any action
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-10 w-10 shrink-0'
                      >
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-[280px]'>
                      <DropdownMenuItem
                        className='font-medium text-xs uppercase text-muted-foreground'
                        disabled
                      >
                        Approve Reasons
                      </DropdownMenuItem>
                      {ACTION_NOTE_OPTIONS.APPROVE.map((note, index) => (
                        <DropdownMenuItem
                          key={`approve-${index}`}
                          onClick={() => handleSelectNote(note)}
                        >
                          {note}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        className='font-medium text-xs uppercase text-muted-foreground mt-2'
                        disabled
                      >
                        Reject Reasons
                      </DropdownMenuItem>
                      {ACTION_NOTE_OPTIONS.REJECT.map((note, index) => (
                        <DropdownMenuItem
                          key={`reject-${index}`}
                          onClick={() => handleSelectNote(note)}
                        >
                          {note}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className='flex flex-wrap gap-4'>
                <Button
                  variant='default'
                  onClick={() => handleAction('APPROVED')}
                  disabled={isProcessing}
                  className='min-w-[140px]'
                >
                  <Shield className='mr-2 h-4 w-4' />
                  Approve Report
                </Button>

                <Button
                  variant='destructive'
                  onClick={() => handleAction('REJECTED')}
                  disabled={isProcessing}
                  className='min-w-[140px]'
                >
                  <Ban className='mr-2 h-4 w-4' />
                  Reject Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional actions when report is approved */}
      {(report.status as ReportStatus) === 'APPROVED' && (
        <Card className='shadow-md'>
          <CardHeader>
            <CardTitle className='text-lg'>Additional Actions</CardTitle>
            <CardDescription>
              Take additional actions on the reported content or user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-4'>
              {report.reportedUserStatus === '1' ? (
                <Button
                  variant='outline'
                  className='min-w-[140px] border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
                  onClick={() => setShowDialog('ban')}
                  disabled={isProcessing}
                >
                  <Ban className='mr-2 h-4 w-4' />
                  Ban User
                </Button>
              ) : (
                <Button
                  variant='outline'
                  className='min-w-[140px] border-green-500 text-green-600 hover:bg-green-500 hover:text-white'
                  onClick={() => setShowDialog('unban')}
                  disabled={isProcessing}
                >
                  <User className='mr-2 h-4 w-4' />
                  Unban User
                </Button>
              )}

              {!hasWarned && (
                <Button
                  variant='outline'
                  className='min-w-[140px] border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white'
                  onClick={() => setShowDialog('warn')}
                  disabled={isProcessing}
                >
                  <AlertTriangle className='mr-2 h-4 w-4' />
                  Warn User
                </Button>
              )}

              {report.hidden ? (
                <Button
                  variant='outline'
                  className='min-w-[140px] border-green-500 text-green-600 hover:bg-green-500 hover:text-white'
                  onClick={() => setShowDialog('show')}
                  disabled={isProcessing}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  Show {report.type === 'COMMENT' ? 'Comment' : 'Review'}
                </Button>
              ) : (
                <Button
                  variant='outline'
                  className='min-w-[140px]'
                  onClick={() => setShowDialog('hide')}
                  disabled={isProcessing}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  Hide {report.type === 'COMMENT' ? 'Comment' : 'Review'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={showDialog === 'ban'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban this user? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => handleBanUser(report?.reportedUserId || 0)}
            >
              Ban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDialog === 'unban'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban this user? They will regain access
              to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-green-500 text-white hover:bg-green-600'
              onClick={() => handleUnbanUser(report?.reportedUserId || 0)}
            >
              Unban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDialog === 'warn'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warn User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to issue a warning to this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-yellow-500 text-white hover:bg-yellow-600'
              onClick={() => handleWarnUser(report?.reportedUserId || 0)}
            >
              Warn User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDialog === 'hide'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to hide this {report?.type.toLowerCase()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleContentVisibility(
                  report?.resourceId || 0,
                  report?.type || '',
                  true
                )
              }
            >
              Hide Content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDialog === 'show'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Show Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to show this {report?.type.toLowerCase()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-green-500 text-white hover:bg-green-600'
              onClick={() =>
                handleContentVisibility(
                  report?.resourceId || 0,
                  report?.type || '',
                  false
                )
              }
            >
              Show Content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
