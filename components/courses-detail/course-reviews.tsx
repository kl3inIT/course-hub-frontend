'use client'

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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { reportApi } from '@/services/report-api'
import { reviewApi } from '@/services/review-api'
import { ReviewResponseDTO } from '@/types/review'
import { WriteReview } from './write-review'
import { Flag, Star } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

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

export function CourseReviews({
  courseId,
  averageRating,
  totalReviews,
  isEnrolled,
}: CourseReviewsProps) {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([])
  const [reviewPage, setReviewPage] = useState(0)
  const [reviewTotalPages, setReviewTotalPages] = useState(1)
  const [expandedComments, setExpandedComments] = useState<{
    [id: number]: boolean
  }>({})
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null)

  const reportReasons = [
    { id: 'Spam', label: 'Spam or advertising' },
    { id: 'Inappropriate', label: 'Inappropriate content' },
    { id: 'Harassment', label: 'Harassment or bullying' },
    { id: 'Other', label: 'Other reason' },
  ]

  // Fetch reviews for this course
  const fetchReviews = useCallback(async () => {
    try {
      const res = await reviewApi.getAllReviews({
        courseId: Number(courseId),
        page: reviewPage,
        size: 6,
        sortBy: 'createdDate',
        direction: 'DESC',
      })
      setReviews(res.data.content)
      setReviewTotalPages(res.data.totalPages)
    } catch (err) {
      setReviews([])
    }
  }, [courseId, reviewPage])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleReviewSubmitted = () => {
    // Reset to first page and fetch reviews again
    setReviewPage(0)
    fetchReviews()
  }

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
      {isEnrolled && (
        <WriteReview
          courseId={courseId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <div className='space-y-4'>
        {reviews.length === 0 && (
          <Card>
            <CardContent className='p-6 text-center text-muted-foreground'>
              No reviews yet. Be the first to review this course!
            </CardContent>
          </Card>
        )}
        {reviews.map(review => {
          const isExpanded = expandedComments[review.id]
          return (
            <Card
              key={review.id}
              className='border border-gray-200 rounded-xl shadow-sm'
            >
              <CardContent className='p-5'>
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
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-gray-500 hover:text-red-500 p-0 h-auto'
                      onClick={() => {
                        handleOpenReport(review.id)
                      }}
                    >
                      <Flag className='mr-1 h-4 w-4' />
                      Report
                    </Button>
                  </div>
                </div>
                <div className='mt-2'>
                  {review.isHidden === 1 ? (
                    <p className='text-sm text-muted-foreground italic bg-gray-50 rounded px-3 py-2'>
                      This review has been hidden due to violation of community
                      guidelines.
                    </p>
                  ) : (
                    <p
                      className={`text-sm text-gray-700 bg-gray-50 rounded px-3 py-2${isExpanded ? '' : ' line-clamp-2 overflow-hidden break-all max-h-[3.2rem]'}`}
                      style={{ minHeight: 40 }}
                    >
                      {review.comment}
                    </p>
                  )}
                  {review.isHidden !== 1 &&
                    review.comment &&
                    review.comment.length > 120 && (
                      <Button
                        variant='link'
                        className='text-blue-600 text-xs mt-1 font-medium underline cursor-pointer hover:text-blue-800 transition-colors p-0 h-auto'
                        onClick={() =>
                          setExpandedComments(prev => ({
                            ...prev,
                            [review.id]: !isExpanded,
                          }))
                        }
                      >
                        {isExpanded ? 'See less' : 'See more'}
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination for reviews */}
      {reviewTotalPages > 1 && (
        <div className='flex justify-center items-center gap-4 mt-6'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setReviewPage(p => Math.max(0, p - 1))}
            disabled={reviewPage === 0}
          >
            Previous
          </Button>
          <span>
            Page {reviewPage + 1} of {reviewTotalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              setReviewPage(p => Math.min(reviewTotalPages - 1, p + 1))
            }
            disabled={reviewPage === reviewTotalPages - 1}
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
    </div>
  )
}
