import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { announcementApi } from '@/services/announcement-api'
import {
  AnnouncementStatus,
  AnnouncementType,
  CreateAnnouncementRequest,
  TargetGroup,
} from '@/types/announcement'
import { Course } from '@/types/course'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, Save, Send, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function AnnouncementForm({
  onSuccess,
  initialData,
  announcementId,
  testMode = false, // Add test mode parameter
  readOnly = false,
}: {
  onSuccess: () => void
  initialData?: Partial<CreateAnnouncementRequest>
  announcementId?: string
  testMode?: boolean
  readOnly?: boolean
}) {
  const [formData, setFormData] = useState<CreateAnnouncementRequest>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    type: initialData?.type || AnnouncementType.GENERAL,
    targetGroup: initialData?.targetGroup || TargetGroup.ALL_USERS,
    link: initialData?.link || '',
    scheduledTime: initialData?.scheduledTime,
    isScheduled: initialData?.isScheduled || false,
    isPersonalized: initialData?.isPersonalized || false,
    personalizedRecipients: initialData?.personalizedRecipients || [],
    attachments: initialData?.attachments || [],
    courseIds: initialData?.courseIds || [],
    userIds: initialData?.userIds || [],
  })
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<AnnouncementStatus | null>(
    announcementId ? AnnouncementStatus.DRAFT : null
  )
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [targetGroups, setTargetGroups] = useState<
    Array<{ name: string; description: string }>
  >([])
  const [announcementTypes, setAnnouncementTypes] = useState<
    Array<{ value: string; label: string }>
  >([])
  const [loadingEnums, setLoadingEnums] = useState(false)
  const [scheduledHour, setScheduledHour] = useState<number>(
    new Date().getHours()
  )
  const [scheduledMinute, setScheduledMinute] = useState<number>(
    new Date().getMinutes()
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetail, setErrorDetail] = useState<any>(null)

  // Load current announcement status when editing
  useEffect(() => {
    if (announcementId) {
      const loadAnnouncement = async () => {
        try {
          const response =
            await announcementApi.getAnnouncementById(announcementId)
          const announcement = response.data.data as any
          if (announcement && announcement.status) {
            setCurrentStatus(announcement.status)
          }
        } catch (error) {
          console.error('Failed to load announcement status:', error)
        }
      }
      loadAnnouncement()
    }
  }, [announcementId])

  // Load enum values
  useEffect(() => {
    const loadEnums = async () => {
      setLoadingEnums(true)
      try {
        // For now, use hardcoded values to avoid API issues
        setTargetGroups([
          { name: 'ALL_USERS', description: 'All users' },
          { name: 'LEARNERS_ONLY', description: 'Learners only' },
          { name: 'MANAGERS_ONLY', description: 'Managers only' },
        ])
        setAnnouncementTypes([
          { value: 'GENERAL', label: 'General' },
          { value: 'COURSE_UPDATE', label: 'Course Update' },
          { value: 'SYSTEM_MAINTENANCE', label: 'System Maintenance' },
          { value: 'PROMOTION', label: 'Promotion' },
          { value: 'EMERGENCY', label: 'Emergency' },
        ])
      } catch (error) {
        toast.error('Failed to load form data')
      } finally {
        setLoadingEnums(false)
      }
    }
    loadEnums()
  }, [])

  // Update scheduledTime when hour/minute changes
  useEffect(() => {
    if (formData.isScheduled && formData.scheduledTime) {
      const date = new Date(formData.scheduledTime)
      date.setHours(scheduledHour)
      date.setMinutes(scheduledMinute)
      date.setSeconds(0)
      date.setMilliseconds(0)

      // Convert to 'yyyy-MM-ddTHH:mm' format WITHOUT timezone
      const localDateTime =
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0') +
        'T' +
        String(date.getHours()).padStart(2, '0') +
        ':' +
        String(date.getMinutes()).padStart(2, '0')

      setFormData(prev => ({ ...prev, scheduledTime: localDateTime }))
    }
  }, [scheduledHour, scheduledMinute])

  const handleCourseSelection = (courseId: number, checked: boolean) => {
    if (checked) {
      setSelectedCourses(prev => [...prev, courseId])
      setFormData(prev => ({
        ...prev,
        courseIds: [...(prev.courseIds || []), courseId],
      }))
    } else {
      setSelectedCourses(prev => prev.filter(id => id !== courseId))
      setFormData(prev => ({
        ...prev,
        courseIds: prev.courseIds?.filter(id => id !== courseId) || [],
      }))
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    setErrorMessage(null)
    setErrorDetail(null)
    try {
      if (announcementId) {
        // Update existing announcement
        await announcementApi.updateAnnouncement(announcementId, {
          ...formData,
          status: AnnouncementStatus.DRAFT,
        })
        setCurrentStatus(AnnouncementStatus.DRAFT)
        toast.success('Announcement updated and saved as draft')
        onSuccess() // Thoát ra ngoài tab sau khi lưu
      } else {
        await announcementApi.createAnnouncement({
          ...formData,
          status: AnnouncementStatus.DRAFT,
        })
        toast.success('Announcement created and saved as draft')
        onSuccess()
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to save as draft'
      const detail =
        error?.response?.data?.detail || error?.response?.data?.errors
      setErrorMessage(msg)
      setErrorDetail(detail)
      if (detail) {
        if (Array.isArray(detail)) {
          detail.forEach((d: any) =>
            toast.error(typeof d === 'string' ? d : JSON.stringify(d))
          )
        } else {
          toast.error(
            typeof detail === 'string' ? detail : JSON.stringify(detail)
          )
        }
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendNow = async () => {
    setLoading(true)
    setErrorMessage(null)
    setErrorDetail(null)
    try {
      if (announcementId) {
        await announcementApi.sendAnnouncement(announcementId)
        setCurrentStatus(AnnouncementStatus.SENT)
        toast.success('Announcement sent successfully')
      } else {
        await announcementApi.createAnnouncement({
          ...formData,
          status: AnnouncementStatus.SENT,
        })
        toast.success('Announcement created and sent')
        onSuccess()
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || 'Failed to send announcement'
      const detail =
        error?.response?.data?.detail || error?.response?.data?.errors
      setErrorMessage(msg)
      setErrorDetail(detail)
      if (detail) {
        if (Array.isArray(detail)) {
          detail.forEach((d: any) =>
            toast.error(typeof d === 'string' ? d : JSON.stringify(d))
          )
        } else {
          toast.error(
            typeof detail === 'string' ? detail : JSON.stringify(detail)
          )
        }
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async () => {
    if (!formData.scheduledTime) {
      toast.error('Please select a scheduled time')
      return
    }
    setLoading(true)
    setErrorMessage(null)
    setErrorDetail(null)
    try {
      if (announcementId) {
        await announcementApi.scheduleAnnouncement(
          announcementId,
          formData.scheduledTime
        )
        setCurrentStatus(AnnouncementStatus.SCHEDULED)
        toast.success('Announcement scheduled successfully')
        onSuccess() // Thoát ra ngoài tab sau khi schedule
      } else {
        await announcementApi.createAnnouncement({
          ...formData,
          status: AnnouncementStatus.SCHEDULED,
        })
        toast.success('Announcement created and scheduled')
        onSuccess()
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || 'Failed to schedule announcement'
      const detail =
        error?.response?.data?.detail || error?.response?.data?.errors
      setErrorMessage(msg)
      setErrorDetail(detail)
      if (detail) {
        if (Array.isArray(detail)) {
          detail.forEach((d: any) =>
            toast.error(typeof d === 'string' ? d : JSON.stringify(d))
          )
        } else {
          toast.error(
            typeof detail === 'string' ? detail : JSON.stringify(detail)
          )
        }
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!announcementId) {
      onSuccess()
      return
    }
    setLoading(true)
    setErrorMessage(null)
    setErrorDetail(null)
    try {
      await announcementApi.cancelAnnouncement(announcementId)
      setCurrentStatus(AnnouncementStatus.CANCELLED)
      toast.success('Announcement cancelled')
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || 'Failed to cancel announcement'
      const detail =
        error?.response?.data?.detail || error?.response?.data?.errors
      setErrorMessage(msg)
      setErrorDetail(detail)
      if (detail) {
        if (Array.isArray(detail)) {
          detail.forEach((d: any) =>
            toast.error(typeof d === 'string' ? d : JSON.stringify(d))
          )
        } else {
          toast.error(
            typeof detail === 'string' ? detail : JSON.stringify(detail)
          )
        }
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.title.trim() && formData.content.trim()

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

  return (
    <div className='space-y-6'>
      {/* Loading State */}
      {loadingEnums && (
        <div className='flex items-center justify-center py-8'>
          <div className='text-sm text-muted-foreground'>
            Loading form data...
          </div>
        </div>
      )}

      {/* Created By & Sent Time */}
      {initialData?.createdByName && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span>Created by:</span>
          <span className='font-semibold'>{initialData.createdByName}</span>
        </div>
      )}
      {initialData?.sentTime && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span>Sent time:</span>
          <span className='font-semibold'>
            {format(new Date(initialData.sentTime), 'dd/MM/yyyy HH:mm')}
          </span>
        </div>
      )}

      {/* Status Badge */}
      {currentStatus && (
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-muted-foreground'>
            Status:
          </span>
          <Badge
            variant={getStatusBadgeVariant(currentStatus)}
            className='text-sm'
          >
            {currentStatus}
          </Badge>
        </div>
      )}

      <form className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Label htmlFor='title' className='font-medium'>
              Title *
            </Label>
            <Input
              id='title'
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder='Enter announcement title'
              required
              disabled={readOnly}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='type' className='font-medium'>
              Type *
            </Label>
            <Select
              value={formData.type}
              onValueChange={value =>
                setFormData({
                  ...formData,
                  type: value as AnnouncementType,
                })
              }
              disabled={loadingEnums || readOnly}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingEnums ? 'Loading...' : 'Select type'}
                />
              </SelectTrigger>
              <SelectContent>
                {announcementTypes.length > 0
                  ? announcementTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))
                  : Object.values(AnnouncementType).map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='targetGroup' className='font-medium'>
            Target Group *
          </Label>
          <Select
            value={formData.targetGroup}
            onValueChange={value =>
              setFormData({
                ...formData,
                targetGroup: value as TargetGroup,
              })
            }
            disabled={loadingEnums || readOnly}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingEnums ? 'Loading...' : 'Select target group'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {targetGroups.length > 0
                ? targetGroups.map(group => (
                    <SelectItem key={group.name} value={group.name}>
                      {group.description}
                    </SelectItem>
                  ))
                : Object.values(TargetGroup).map(group => (
                    <SelectItem key={group} value={group}>
                      {group.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='content' className='font-medium'>
            Content *
          </Label>
          <Textarea
            id='content'
            value={formData.content}
            onChange={e =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder='Enter announcement content...'
            rows={6}
            required
            disabled={readOnly}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='link' className='font-medium'>
            Link (Optional)
          </Label>
          <Input
            id='link'
            value={formData.link || ''}
            onChange={e => setFormData({ ...formData, link: e.target.value })}
            placeholder='Enter link URL'
            disabled={readOnly}
          />
        </div>

        <div className='flex items-center space-x-2'>
          <Switch
            id='scheduled'
            checked={formData.isScheduled}
            onCheckedChange={checked =>
              setFormData({ ...formData, isScheduled: checked })
            }
            disabled={readOnly}
          />
          <Label htmlFor='scheduled' className='font-medium'>
            Schedule for later
          </Label>
        </div>

        {formData.isScheduled && (
          <div className='space-y-2'>
            <Label className='font-medium'>Scheduled Time</Label>
            <Calendar
              mode='single'
              selected={
                formData.scheduledTime
                  ? new Date(formData.scheduledTime)
                  : undefined
              }
              onSelect={date => {
                if (date) {
                  const selectedDate = new Date(date)
                  selectedDate.setHours(scheduledHour)
                  selectedDate.setMinutes(scheduledMinute)
                  setFormData({
                    ...formData,
                    scheduledTime: selectedDate.toISOString(),
                  })
                }
              }}
              initialFocus
            />
            <div className='flex gap-2 items-center'>
              <Label htmlFor='hour'>Hour</Label>
              <select
                id='hour'
                value={scheduledHour}
                onChange={e => setScheduledHour(Number(e.target.value))}
                className='border rounded px-2 py-1'
                disabled={readOnly}
              >
                {[...Array(24).keys()].map(h => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <Label htmlFor='minute'>Minute</Label>
              <select
                id='minute'
                value={scheduledMinute}
                onChange={e => setScheduledMinute(Number(e.target.value))}
                className='border rounded px-2 py-1'
                disabled={readOnly}
              >
                {[...Array(60).keys()].map(m => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            {formData.scheduledTime && (
              <div className='text-sm text-muted-foreground flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                Scheduled for:{' '}
                {format(new Date(formData.scheduledTime), 'PPP HH:mm', {
                  locale: vi,
                })}
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className='flex flex-wrap gap-3 pt-4'>
          {/* Save as Draft hoặc Save - chỉ hiện khi KHÔNG chọn schedule */}
          {!formData.isScheduled && (
            <Button
              type='button'
              variant='outline'
              onClick={handleSaveDraft}
              disabled={loading || !isFormValid || readOnly}
              className='flex items-center gap-2'
            >
              <Save className='h-4 w-4' />
              {announcementId ? 'Save' : 'Save as Draft'}
            </Button>
          )}

          {/* Schedule */}
          {formData.isScheduled && (
            <Button
              type='button'
              variant='default'
              onClick={handleSchedule}
              disabled={
                loading ||
                !isFormValid ||
                readOnly ||
                !formData.scheduledTime ||
                new Date(formData.scheduledTime) <= new Date()
              }
              className='flex items-center gap-2 font-bold border-2 border-primary shadow-md'
            >
              <CalendarIcon className='h-4 w-4' />
              Schedule
            </Button>
          )}

          {/* Send Now chỉ khi tạo mới */}
          {!announcementId && !formData.isScheduled && (
            <Button
              type='button'
              variant='outline'
              onClick={handleSendNow}
              disabled={loading || !isFormValid || readOnly}
              className='flex items-center gap-2'
            >
              <Send className='h-4 w-4' />
              Send Now
            </Button>
          )}

          {/* Cancel (for existing announcements) */}
          {announcementId && currentStatus === AnnouncementStatus.SCHEDULED && (
            <Button
              type='button'
              variant='destructive'
              onClick={handleCancel}
              disabled={loading || readOnly}
              className='flex items-center gap-2'
            >
              <X className='h-4 w-4' />
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
