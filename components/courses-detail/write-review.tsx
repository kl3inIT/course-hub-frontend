'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { reviewApi } from '@/services/review-api'
import { useAuth } from '@/context/auth-context'
import { Star, PenTool, MessageSquare } from 'lucide-react'

interface WriteReviewProps {
  courseId: string
  onReviewSubmitted?: () => void
}

export function WriteReview({ courseId, onReviewSubmitted }: WriteReviewProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to write a review.',
        variant: 'destructive',
      })
      return
    }

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating.',
        variant: 'destructive',
      })
      return
    }

    if (comment.trim().length < 10) {
      toast({
        title: 'Comment Too Short',
        description: 'Please write at least 10 characters in your review.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      await reviewApi.createReview({
        courseId: Number(courseId),
        star: rating,
        comment: comment.trim(),
      })

      toast({
        title: 'Success',
        description: 'Your review has been submitted successfully!',
      })

      // Reset form
      setRating(0)
      setHoveredRating(0)
      setComment('')
      setShowDialog(false)

      // Notify parent component
      onReviewSubmitted?.()
    } catch (error: any) {
      let errorMessage = 'Failed to submit review'
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (interactive = false) => {
    return [...Array(5)].map((_, i) => {
      const starIndex = i + 1
      const filled = interactive
        ? starIndex <= (hoveredRating || rating)
        : starIndex <= rating

      return (
        <Star
          key={i}
          className={`h-6 w-6 cursor-pointer transition-colors ${
            filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={interactive ? () => setRating(starIndex) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(starIndex) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      )
    })
  }

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Share Your Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You've enrolled in this course! Help other students by sharing your thoughts and rating.
          </p>
          <Button onClick={() => setShowDialog(true)} className="w-full sm:w-auto">
            <MessageSquare className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Write Your Review</DialogTitle>
            <DialogDescription>
              Share your experience with this course to help other students make informed decisions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Rating</Label>
              <div className="flex gap-1">
                {renderStars(true)}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment" className="text-sm font-medium">
                Your Review
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this course, what you learned, and what others should know..."
                className="min-h-[100px] resize-none"
                maxLength={1000}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Minimum 10 characters</span>
                <span>{comment.length}/1000</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false)
                setRating(0)
                setHoveredRating(0)
                setComment('')
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={rating === 0 || comment.trim().length < 10 || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 