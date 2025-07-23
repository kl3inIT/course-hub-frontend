'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import { reportApi } from '@/services/report-api'
import { reviewApi } from '@/services/review-api'
import { ReviewResponseDTO } from '@/types/review'
import { Edit, Flag, MoreVertical, Star, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { WriteReview } from './write-review'

interface CourseReviewsProps {
  courseId: string
  averageRating?: number
  totalReviews: number
  isEnrolled?: boolean
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  const date = d.toLocaleDateString('en-GB') // dd/mm/yyyy
  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }) // HH:mm
  return `${time} ${date}`
}

function WriteReviewWrapper({ courseId, onReviewSubmitted }: { courseId: string, onReviewSubmitted: () => void }) {
  const [hasReviewed, setHasReviewed] = useState<boolean | null>(null)
  const [refreshCheck, setRefreshCheck] = useState(0)

  useEffect(() => {
    let isMounted = true
    const check = async () => {
      try {
        const res = await reviewApi.checkUserReview(Number(courseId))
        if (isMounted) setHasReviewed(res.data)
      } catch (e) {
        if (isMounted) setHasReviewed(false)
      }
    }
    check()
    return () => { isMounted = false }
  }, [courseId, refreshCheck])

  // Khi add hoặc delete xong, gọi hàm này để refresh lại trạng thái
  const handleReviewChange = () => {
    setRefreshCheck(prev => prev + 1)
    onReviewSubmitted()
  }

  if (hasReviewed === null) return null // loading
  if (hasReviewed) {
    return (
      <div className="text-yellow-600 font-medium mt-4">
        You have already reviewed this course.
      </div>
    )
  }
  return <WriteReview courseId={courseId} onReviewSubmitted={handleReviewChange} />
}

export function CourseReviews({
  courseId,
  averageRating,
  totalReviews,
  isEnrolled,
}: CourseReviewsProps) {
  const { toast } = useToast()
  // State cho phân trang FE giống review-management
  const [allReviews, setAllReviews] = useState<ReviewResponseDTO[]>([])
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    size: 5,
    number: 0,
  })
  const pageSize = 5
  const [expandedComments, setExpandedComments] = useState<{
    [id: number]: boolean
  }>({})
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null)
  const { user } = useAuth()
  const userEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')!).email : '')
  const [reviewOwnership, setReviewOwnership] = useState<{ [reviewId: number]: boolean }>({})
  const [showEdit, setShowEdit] = useState(false)
  const [editReview, setEditReview] = useState<ReviewResponseDTO | null>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null)
  const [writeReviewKey, setWriteReviewKey] = useState(0)
  const canReview = user && (user.role === 'manager' || user.role === 'learner')

  // State cho hiển thị review trang hiện tại
  const [displayedReviews, setDisplayedReviews] = useState<ReviewResponseDTO[]>([])

  const reportReasons = [
    { id: 'Spam', label: 'Spam or advertising' },
    { id: 'Inappropriate', label: 'Inappropriate content' },
    { id: 'Harassment', label: 'Harassment or bullying' },
    { id: 'Other', label: 'Other reason' },
  ]

  // Fetch toàn bộ review 1 lần đầu
  const fetchAllReviews = async () => {
    try {
      const res = await reviewApi.getAllReviews({ courseId: Number(courseId), page: 0, size: 1000 })
      const allData = res.data.content || []
      setAllReviews(allData)
      updatePagination(allData, 0, pageSize)
    } catch (err) {
      setAllReviews([])
      updatePagination([], 0, pageSize)
    }
  }

  // Hàm cập nhật phân trang và slice data
  const updatePagination = (data: ReviewResponseDTO[], page: number, size: number) => {
    const totalPages = Math.ceil(data.length / size)
    const paginatedData = data.slice(page * size, (page + 1) * size)
    setDisplayedReviews(paginatedData)
    setPagination({
      totalElements: data.length,
      totalPages,
      size,
      number: page,
    })
  }

  // Khi đổi courseId, fetch lại toàn bộ review
  useEffect(() => {
    fetchAllReviews()
  }, [courseId])

  // Khi chuyển trang
  const goToNextPage = () => {
    const nextPage = pagination.number + 1
    if (nextPage < pagination.totalPages) {
      updatePagination(allReviews, nextPage, pageSize)
    }
  }
  const goToPreviousPage = () => {
    const prevPage = pagination.number - 1
    if (prevPage >= 0) {
      updatePagination(allReviews, prevPage, pageSize)
    }
  }

  // Khi submit review, reload lại toàn bộ
  const handleReviewSubmitted = () => {
    fetchAllReviews()
    setWriteReviewKey(prev => prev + 1)
  }

  // Kiểm tra ownership cho từng review (cache theo reviewId)
  useEffect(() => {
    if (!user) return
    const checkOwnership = async () => {
      const results: { [reviewId: number]: boolean } = {}
      await Promise.all(
        displayedReviews.map(async (review) => {
          if (reviewOwnership[review.id] !== undefined) {
            results[review.id] = reviewOwnership[review.id]
            return
          }
          try {
            const res = await reviewApi.checkReviewOwnership(review.id)
            results[review.id] = res.data === true
          } catch {
            results[review.id] = false
          }
        })
      )
      setReviewOwnership((prev) => ({ ...prev, ...results }))
    }
    if (displayedReviews.length > 0) checkOwnership()
  }, [displayedReviews, user])

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const handleReport = useCallback(
    async (reviewId: number, reason: string, description?: string) => {
      try {
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'

        // Set severity based on reason
        if (reason === 'Spam') severity = 'LOW'
        else if (reason === 'Inappropriate') severity = 'MEDIUM'
        else if (reason === 'Harassment') severity = 'HIGH'

        // Combine reason and description if description exists
        const fullReason = description?.trim()
          ? `${reason}: ${description.trim()}`
          : reason

        await reportApi.createReport({
          resourceType: 'REVIEW',
          resourceId: reviewId,
          reason: fullReason,
          severity,
          description: undefined,
        })
        toast({
          title: 'Success',
          description: 'Report submitted successfully',
        })
        setShowReport(false)
        setReportReason('')
        setReportDescription('')
        setSelectedReviewId(null)
      } catch (error) {
        let errorMessage = 'Failed to submit report'

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as {
            response?: { data?: { message?: string; detail?: string } }
          }
          errorMessage =
            axiosError.response?.data?.message ||
            axiosError.response?.data?.detail ||
            errorMessage
        }

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
        // Close modal even when there's an error
        setShowReport(false)
        setReportReason('')
        setReportDescription('')
        setSelectedReviewId(null)
      }
    },
    [toast]
  )

  const handleOpenReport = (reviewId: number) => {
    setSelectedReviewId(reviewId)
    setShowReport(true)
  }

  const handleCloseReport = () => {
    setShowReport(false)
    setReportReason('')
    setReportDescription('')
    setSelectedReviewId(null)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-2xl font-semibold'>Student Reviews</h3>
        <div className='flex items-center gap-2'>
          <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
          <span className='text-xl font-semibold'>
            {averageRating?.toFixed(1) || '0.0'}
          </span>
          <span className='text-muted-foreground'>
            ({totalReviews} reviews)
          </span>
        </div>
      </div>

      {/* Write Review Component for Enrolled Students */}
      {isEnrolled && canReview && (
        <WriteReviewWrapper
          key={writeReviewKey}
          courseId={courseId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Render reviews theo trang FE */}
      <div className='space-y-4 mt-4'>
        {displayedReviews.length === 0 && (
          <div className='text-gray-500 text-center'>No reviews yet.</div>
        )}
        {displayedReviews.map((review) => {
          const isExpanded = expandedComments[review.id]
          const isMine = reviewOwnership[review.id]
          return (
            <Card key={review.id} className='shadow-sm'>
              <CardContent className='pt-4 pb-4'>
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex items-center gap-4'>
                    <Avatar className='w-12 h-12'>
                      <AvatarImage
                        src={review.userAvatar || '/placeholder.svg'}
                      />
                      <AvatarFallback>
                        {review.userName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-semibold text-base'>
                        {review.userName}
                      </div>
                      <div className='flex mt-1'>
                        {renderStars(review.star)}
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col items-end gap-1 min-w-[110px]'>
                    <span className='text-xs text-gray-500'>
                      {formatDateTime(review.createdDate)}
                    </span>
                    {user && review.isHidden !== 1 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='p-1 h-8 w-8'>
                            <MoreVertical className='h-5 w-5' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          {review.email === userEmail ? (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setEditReview(review)
                                setShowEdit(true)
                              }}>
                                <Edit className='mr-2 h-4 w-4' /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setDeleteReviewId(review.id)
                                setShowDelete(true)
                              }}>
                                <Trash2 className='mr-2 h-4 w-4' /> Delete
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem onClick={() => handleOpenReport(review.id)}>
                              <Flag className='mr-2 h-4 w-4' /> Report
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <div className='mt-2'>
                  {review.isHidden === 1 ? (
                    <p className='text-sm text-muted-foreground italic bg-gray-50 rounded px-3 py-2'>
                      This review has been hidden due to violation of community guidelines.
                    </p>
                  ) : (
                    <p
                      className='text-sm text-gray-700 bg-gray-50 rounded px-3 py-2'
                      style={{ minHeight: 40 }}
                    >
                      {review.comment}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {/* Pagination giống review-management */}
      {pagination.totalElements > 0 && (
        <div className='flex justify-center items-center gap-4 mt-6'>
          <Button
            variant='outline'
            size='sm'
            onClick={goToPreviousPage}
            disabled={pagination.number === 0}
          >
            Previous
          </Button>
          <div className='flex gap-1'>
            {Array.from({ length: pagination.totalPages }).map((_, idx) => (
              <Button
                key={idx}
                variant={pagination.number === idx ? 'default' : 'outline'}
                size='sm'
                onClick={() => updatePagination(allReviews, idx, pageSize)}
                disabled={pagination.number === idx}
              >
                {idx + 1}
              </Button>
            ))}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={goToNextPage}
            disabled={pagination.number >= pagination.totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
            <DialogDescription>
              Please let us know why you want to report this review
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <RadioGroup
              value={reportReason}
              onValueChange={(value: string) => {
                setReportReason(value)
                if (value !== 'Other') {
                  setReportDescription('')
                }
              }}
            >
              {reportReasons.map(reason => (
                <div key={reason.id} className='flex items-center space-x-2'>
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id}>{reason.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='description'>
                  Description{' '}
                  {reportReason === 'Other' ? '(required)' : '(optional)'}
                </Label>
                {reportReason === 'Other' && !reportDescription.trim() && (
                  <span className='text-sm text-destructive'>
                    Please provide a detailed description
                  </span>
                )}
              </div>
              <Textarea
                id='description'
                value={reportDescription}
                onChange={(e: any) => setReportDescription(e.target.value)}
                placeholder={
                  reportReason === 'Other'
                    ? 'Please describe the reason for reporting in detail...'
                    : 'Add more details about the issue...'
                }
                className={
                  reportReason === 'Other' && !reportDescription.trim()
                    ? 'border-destructive'
                    : ''
                }
              />
            </div>
          </div>
          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={handleCloseReport}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedReviewId &&
                handleReport(selectedReviewId, reportReason, reportDescription)
              }
              disabled={
                !reportReason ||
                (reportReason === 'Other' && !reportDescription.trim())
              }
            >
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa review */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this review?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDelete(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteReviewId) {
                  await reviewApi.deleteReview(deleteReviewId)
                  setShowDelete(false)
                  setDeleteReviewId(null)
                  handleReviewSubmitted() // Gọi lại để cập nhật trạng thái add review
                }
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog chỉnh sửa review */}
      {showEdit && editReview && (
        <WriteReview
          courseId={editReview.courseId.toString()}
          onReviewSubmitted={() => {
            setShowEdit(false)
            setEditReview(null)
            fetchAllReviews()
          }}
          initialData={{
            star: editReview.star,
            comment: editReview.comment,
            reviewId: editReview.id,
          }}
          isEdit
          onCancel={() => {
            setShowEdit(false)
            setEditReview(null)
          }}
        />
      )}
    </div>
  )
}
