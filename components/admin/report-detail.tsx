'use client'

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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { adminApi } from '@/services/admin-api'
import { commentApi } from '@/services/comment-api'
import { reportApi } from '@/services/report-api'
import { reviewApi } from '@/services/review-api'
import { AggregatedReportDTO, ResourceLocationDTO } from '@/types/report'
import { UserStatus } from '@/types/user'
import { format } from 'date-fns'
import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Flag,
  Loader2,
  MoreHorizontal,
  Shield,
  Tag,
  User,
  Users,
  XCircle,
} from 'lucide-react'
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

const severityStyles = {
  HIGH: 'bg-red-100 text-red-800 border-red-200',
  MEDIUM: 'bg-orange-100 text-orange-800 border-orange-200',
  LOW: 'bg-blue-100 text-blue-800 border-blue-200',
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
  const resourceId = Number(params.id)

  const [aggregated, setAggregated] = useState<AggregatedReportDTO | null>(null)
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
  const [banReason, setBanReason] = useState('')
  const [showBanReasonError, setShowBanReasonError] = useState(false)

  const loadReport = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [aggResponse, locationResponse] = await Promise.all([
        reportApi.getAggregatedReportByResourceId(resourceId),
        reportApi.getResourceLocationByResourceId(resourceId),
      ])
      setAggregated(aggResponse.data)
      setResourceLocation(locationResponse.data)
    } catch (error) {
      setError('Failed to load report details')
      toast.error('Failed to load report details')
    } finally {
      setLoading(false)
    }
  }, [resourceId])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    if (!aggregated) return

    // Validate notes before proceeding
    if (!notes.trim()) {
      setShowNotesError(true)
      return
    }

    setShowNotesError(false)
    setIsProcessing(true)
    try {
      await reportApi.updateReportStatus(aggregated.resourceId, {
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

  const getSeverityBadgeStyle = (severity: string) => {
    return severityStyles[severity as keyof typeof severityStyles] || ''
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
    if (!banReason.trim()) {
      setShowBanReasonError(true)
      return
    }

    setIsProcessing(true)
    try {
      await adminApi.updateUserStatus(userId, UserStatus.BANNED, banReason)
      toast.success('User has been banned')
      setBanReason('')
      setShowBanReasonError(false)
      await loadReport()
    } catch (error: any) {
      toast.error('Failed to ban user')
    } finally {
      setIsProcessing(false)
      setShowDialog(null)
    }
  }

  const handleUnbanUser = async (userId: number) => {
    if (!banReason.trim()) {
      setShowBanReasonError(true)
      return
    }

    setIsProcessing(true)
    try {
      await adminApi.updateUserStatus(userId, UserStatus.ACTIVE, banReason)
      toast.success('User has been unbanned')
      setBanReason('')
      setShowBanReasonError(false)
      await loadReport()
    } catch (error: any) {
      toast.error('Failed to unban user')
    } finally {
      setIsProcessing(false)
      setShowDialog(null)
    }
  }

  const handleWarnUser = async (userId: number) => {
    setIsProcessing(true)
    try {
      await adminApi.warnUser(
        userId,
        aggregated?.resourceType || undefined,
        aggregated?.resourceId || undefined
      )
      console.log(aggregated?.resourceType, aggregated?.resourceId)
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
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto mb-4' />
          <p className='text-muted-foreground'>Loading report details...</p>
        </div>
      </div>
    )
  }

  if (error || !aggregated) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-12'>
        <div className='text-center'>
          <AlertTriangle className='h-12 w-12 text-destructive mx-auto mb-4' />
          <p className='text-lg font-medium text-destructive mb-2'>
            {error || 'Report not found'}
          </p>
          <p className='text-muted-foreground mb-4'>
            The report you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Header Section - Polished, no double title */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-4'>
        <div className='flex items-center gap-3'>
          <div>
            <div className='text-muted-foreground text-sm mt-0.5'>
              Resource #{aggregated.resourceId} &bull; {aggregated.resourceType}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2 mt-2 sm:mt-0'>
          <Badge
            className={cn(
              'px-3 py-1 text-sm font-medium',
              getStatusBadgeStyle(aggregated.status)
            )}
            variant='outline'
          >
            {aggregated.status === 'PENDING' && (
              <Clock className='h-3 w-3 mr-1' />
            )}
            {aggregated.status === 'APPROVED' && (
              <CheckCircle className='h-3 w-3 mr-1' />
            )}
            {aggregated.status === 'REJECTED' && (
              <XCircle className='h-3 w-3 mr-1' />
            )}
            {aggregated.status}
          </Badge>
          <Badge
            className={cn(
              'px-3 py-1 text-sm font-medium',
              getSeverityBadgeStyle(aggregated.severity)
            )}
            variant='outline'
          >
            <AlertTriangle className='h-3 w-3 mr-1' />
            {aggregated.severity}
          </Badge>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content - Left Column */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Resource Content Card */}
          <Card className='shadow-sm'>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <Flag className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>Reported Content</CardTitle>
                    <CardDescription>
                      {aggregated.resourceType} •{' '}
                      {formatDate(
                        typeof aggregated.createdAt === 'string'
                          ? aggregated.createdAt
                          : ''
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {aggregated.hidden ? (
                    <Badge
                      variant='secondary'
                      className='bg-gray-100 text-gray-600'
                    >
                      <EyeOff className='h-3 w-3 mr-1' />
                      Hidden
                    </Badge>
                  ) : (
                    <Badge
                      variant='secondary'
                      className='bg-green-100 text-green-600'
                    >
                      <Eye className='h-3 w-3 mr-1' />
                      Visible
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='p-4 rounded-lg bg-muted'>
                <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                  Description: {aggregated.resourceContent}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resource Owner Card */}
          <Card className='shadow-sm'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-2'>
                <div className='p-2 bg-blue-500/10 rounded-lg'>
                  <User className='h-5 w-5 text-blue-500' />
                </div>
                <div>
                  <CardTitle className='text-lg'>Content Owner</CardTitle>
                  <CardDescription>
                    User who created this content
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4 p-4 rounded-lg bg-muted/20'>
                <a
                  href={`/admin/users/${aggregated.resourceOwnerId}/detail`}
                  className='group outline-none focus:ring-2 focus:ring-primary rounded-full transition-shadow'
                  tabIndex={0}
                  title={`Go to ${aggregated.resourceOwner}'s profile`}
                >
                  <img
                    src={
                      aggregated.resourceOwnerAvatar || '/placeholder-user.jpg'
                    }
                    alt={aggregated.resourceOwner}
                    className='w-16 h-16 rounded-full border-2 border-primary/20 object-cover group-hover:shadow-lg group-hover:border-primary transition-all duration-150'
                  />
                </a>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold'>
                    {aggregated.resourceOwner}
                  </h3>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground mt-1'>
                    <span className='flex items-center gap-1'>
                      <Shield className='h-3 w-3' />
                      Status: {aggregated.resourceOwnerStatus}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      Member since{' '}
                      {formatDate(
                        typeof aggregated.resourceOwnerMemberSince === 'string'
                          ? aggregated.resourceOwnerMemberSince
                          : ''
                      )}
                    </span>
                  </div>
                  {aggregated.status !== 'REJECTED' && (
                  <div className='flex items-center gap-2 mt-3'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setShowDialog('warn')}
                      disabled={isProcessing || aggregated.status === 'PENDING'}
                      title={
                        aggregated.status === 'PENDING'
                          ? 'Please approve or reject the report first'
                          : 'Warn user about this content'
                      }
                    >
                      <AlertTriangle className='h-3 w-3 mr-1' />
                      Warn User
                    </Button>
                    {aggregated.resourceOwnerStatus === 'ACTIVE' ? (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setShowDialog('ban')}
                        disabled={
                          isProcessing || aggregated.status === 'PENDING'
                        }
                        className='text-red-600 hover:text-red-700'
                        title={
                          aggregated.status === 'PENDING'
                            ? 'Please approve or reject the report first'
                            : 'Ban user from the platform'
                        }
                      >
                        <Ban className='h-3 w-3 mr-1' />
                        Ban User
                      </Button>
                    ) : (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setShowDialog('unban')}
                        disabled={
                          isProcessing || aggregated.status === 'PENDING'
                        }
                        className='text-green-600 hover:text-green-700'
                        title={
                          aggregated.status === 'PENDING'
                            ? 'Please approve or reject the report first'
                            : 'Unban user from the platform'
                        }
                      >
                        <CheckCircle className='h-3 w-3 mr-1' />
                        Unban User
                      </Button>
                    )}
                  </div>
                  )}
                  {aggregated.status === 'PENDING' && (
                    <p className='text-xs text-muted-foreground mt-2'>
                      ⚠️ User actions are available after approving or rejecting
                      this report
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List Card */}
          <Card className='shadow-sm'>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 bg-red-500/10 rounded-lg'>
                    <Users className='h-5 w-5 text-red-500' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>
                      Reports ({aggregated.totalReports})
                    </CardTitle>
                    <CardDescription>
                      All reports submitted for this content
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {aggregated.reports.map((detail, idx) => (
                  <div
                    key={detail.reportId}
                    className='p-4 border rounded-lg bg-white hover:bg-muted/30 transition-colors'
                  >
                    <div className='flex items-start gap-4'>
                      <a
                        href={`/admin/users/${detail.reporterId}/detail`}
                        className='group outline-none focus:ring-2 focus:ring-primary rounded-full transition-shadow'
                        tabIndex={0}
                        title={`Go to ${detail.reporterName}'s profile`}
                      >
                        <img
                          src={detail.reporterAvatar || '/placeholder-user.jpg'}
                          alt={detail.reporterName}
                          className='w-10 h-10 rounded-full border object-cover flex-shrink-0 group-hover:shadow-lg group-hover:border-primary transition-all duration-150'
                        />
                      </a>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-medium text-sm'>
                            {detail.reporterName}
                          </h4>
                          <div className='flex items-center gap-2'>
                            <Badge
                              className={cn(
                                'text-xs',
                                getSeverityBadgeStyle(detail.severity)
                              )}
                              variant='outline'
                            >
                              {detail.severity}
                            </Badge>
                            <span className='text-xs text-muted-foreground'>
                              {formatDate(
                                typeof detail.createdAt === 'string'
                                  ? detail.createdAt
                                  : ''
                              )}
                            </span>
                          </div>
                        </div>
                        <div className='bg-muted/50 p-3 rounded-md'>
                          <p className='text-sm leading-relaxed'>
                            Description: {detail.reason}
                          </p>
                        </div>
                        {aggregated.status === 'REJECTED' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleWarnUser(detail.reporterId)}
                            disabled={isProcessing}
                            title='Warn this reporter'
                          >
                            <AlertTriangle className='h-3 w-3 mr-1' />
                            Warn Reporter
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className='space-y-6'>
          {/* Quick Actions Card */}
          {aggregated.status === 'PENDING' && (
            <Card className='shadow-sm border-l-4 border-l-yellow-500'>
              <CardHeader className='pb-4'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 bg-yellow-500/10 rounded-lg'>
                    <Shield className='h-5 w-5 text-yellow-600' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>Take Action</CardTitle>
                    <CardDescription>
                      Review and decide on this report
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Action Notes
                  </label>
                  <div className='flex gap-2'>
                    <Textarea
                      placeholder='Enter your decision notes...'
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
                  {showNotesError && (
                    <p className='text-sm text-red-500 mt-2'>
                      Please add notes before taking any action
                    </p>
                  )}
                </div>
                <div className='flex gap-2'>
                  <Button
                    onClick={() => handleAction('APPROVED')}
                    disabled={isProcessing}
                    className='flex-1 bg-green-600 hover:bg-green-700'
                  >
                    <CheckCircle className='h-4 w-4 mr-2' />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction('REJECTED')}
                    disabled={isProcessing}
                    variant='destructive'
                    className='flex-1'
                  >
                    <XCircle className='h-4 w-4 mr-2' />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Actions Card */}
          <Card className='shadow-sm'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-2'>
                <div className='p-2 bg-purple-500/10 rounded-lg'>
                  <Eye className='h-5 w-5 text-purple-500' />
                </div>
                <div>
                  <CardTitle className='text-lg'>Content Actions</CardTitle>
                  <CardDescription>Manage content visibility</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() =>
                    handleContentVisibility(
                      aggregated.resourceId,
                      aggregated.resourceType,
                      !aggregated.hidden
                    )
                  }
                  disabled={isProcessing || aggregated.status === 'PENDING'}
                  title={
                    aggregated.status === 'PENDING'
                      ? 'Please approve or reject the report first'
                      : aggregated.hidden
                        ? 'Show this content'
                        : 'Hide this content'
                  }
                >
                  {aggregated.hidden ? (
                    <>
                      <Eye className='h-4 w-4 mr-2' />
                      Show Content
                    </>
                  ) : (
                    <>
                      <EyeOff className='h-4 w-4 mr-2' />
                      Hide Content
                    </>
                  )}
                </Button>
                {aggregated.status === 'PENDING' && (
                  <p className='text-xs text-muted-foreground'>
                    ⚠️ Content actions are available after approving or
                    rejecting this report
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resource Location Card */}
          {resourceLocation && (
            <Card className='shadow-sm'>
              <CardHeader className='pb-4'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 bg-green-500/10 rounded-lg'>
                    <Tag className='h-5 w-5 text-green-500' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>Location</CardTitle>
                    <CardDescription>
                      Where this content is located
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3 text-sm'>
                  {resourceLocation.courseName && (
                    <div className='flex items-center justify-between p-2 bg-muted/30 rounded'>
                      <span className='font-medium'>Course:</span>
                      <span className='text-muted-foreground'>
                        {resourceLocation.courseName}
                      </span>
                    </div>
                  )}
                  {resourceLocation.moduleName && (
                    <div className='flex items-center justify-between p-2 bg-muted/30 rounded'>
                      <span className='font-medium'>Module:</span>
                      <span className='text-muted-foreground'>
                        {resourceLocation.moduleName}
                      </span>
                    </div>
                  )}
                  {resourceLocation.lessonName && (
                    <div className='flex items-center justify-between p-2 bg-muted/30 rounded'>
                      <span className='font-medium'>Lesson:</span>
                      <span className='text-muted-foreground'>
                        {resourceLocation.lessonName}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics Card */}
          <Card className='shadow-sm'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-2'>
                <div className='p-2 bg-blue-500/10 rounded-lg'>
                  <Flag className='h-5 w-5 text-blue-500' />
                </div>
                <div>
                  <CardTitle className='text-lg'>Statistics</CardTitle>
                  <CardDescription>Report summary</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-2 bg-muted/30 rounded'>
                  <span className='text-sm font-medium'>Total Reports:</span>
                  <Badge variant='secondary'>{aggregated.totalReports}</Badge>
                </div>
                <div className='flex items-center justify-between p-2 bg-muted/30 rounded'>
                  <span className='text-sm font-medium'>Type:</span>
                  <Badge variant='outline'>{aggregated.resourceType}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={showDialog === 'ban'}
        onOpenChange={() => setShowDialog(null)}
      >
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban {aggregated.resourceOwner}? This
              action will prevent them from accessing the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='py-4'>
            <label className='text-sm font-medium mb-2 block'>
              Reason for banning *
            </label>
            <Textarea
              placeholder='Enter the reason for banning this user...'
              value={banReason}
              onChange={e => {
                setBanReason(e.target.value)
                if (showBanReasonError && e.target.value.trim()) {
                  setShowBanReasonError(false)
                }
              }}
              className={cn(
                'min-h-[80px] resize-none',
                showBanReasonError &&
                  'border-red-500 focus-visible:ring-red-500'
              )}
              required
            />
            {showBanReasonError && (
              <p className='text-sm text-red-500 mt-2'>
                Please provide a reason for banning this user
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setBanReason('')
                setShowBanReasonError(false)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBanUser(aggregated.resourceOwnerId)}
              className='bg-red-600 hover:bg-red-700'
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
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban {aggregated.resourceOwner}? This
              will restore their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='py-4'>
            <label className='text-sm font-medium mb-2 block'>
              Reason for unbanning *
            </label>
            <Textarea
              placeholder='Enter the reason for unbanning this user...'
              value={banReason}
              onChange={e => {
                setBanReason(e.target.value)
                if (showBanReasonError && e.target.value.trim()) {
                  setShowBanReasonError(false)
                }
              }}
              className={cn(
                'min-h-[80px] resize-none',
                showBanReasonError &&
                  'border-red-500 focus-visible:ring-red-500'
              )}
              required
            />
            {showBanReasonError && (
              <p className='text-sm text-red-500 mt-2'>
                Please provide a reason for unbanning this user
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setBanReason('')
                setShowBanReasonError(false)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleUnbanUser(aggregated.resourceOwnerId)}
              className='bg-green-600 hover:bg-green-700'
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
              Are you sure you want to send a warning to{' '}
              {aggregated.resourceOwner}? This will notify them about the
              reported content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleWarnUser(aggregated.resourceOwnerId)}
              className='bg-yellow-600 hover:bg-yellow-700'
            >
              Send Warning
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
