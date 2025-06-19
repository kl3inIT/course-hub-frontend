'use client'

import { commentApi } from '@/services/comment-api'
import { reportApi } from '@/services/report-api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { CommentDisplayData, transformComment } from '@/types/comment'
import {
  Crown,
  Flag,
  MessageSquare,
  MoreVertical,
  Pencil,
  Reply,
  ThumbsUp,
  Trash2,
} from 'lucide-react'
import type React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface DiscussionSectionProps {
  courseId: string
  lessonId: string
}

const reportReasons = [
  { id: 'spam', label: 'Spam or advertising' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'other', label: 'Other reason' },
]

interface CommentComponentProps {
  comment: CommentDisplayData
  isReply?: boolean
  parentId?: number
  onReply: (commentId: number | null) => void
  onLike: (commentId: number) => void
  onReport: (commentId: number, reason: string, description?: string) => void
  onDelete: (commentId: number) => void
  onEdit: (commentId: number, newContent: string) => void
  onSubmitReply: (commentId: number, content: string) => Promise<void>
  replyTo: number | null
}

const CommentComponentBase = ({
  comment,
  isReply = false,
  parentId,
  onReply,
  onLike,
  onReport,
  onDelete,
  onEdit,
  replyTo,
  onSubmitReply,
}: CommentComponentProps) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [localReplyContent, setLocalReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const handleReportSubmit = useCallback(() => {
    onReport(comment.id, reportReason, reportDescription)
    setIsReportDialogOpen(false)
    setReportReason('')
    setReportDescription('')
  }, [comment.id, reportReason, reportDescription, onReport])

  const handleLocalReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localReplyContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmitReply(comment.id, localReplyContent)
      setLocalReplyContent('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onEdit(comment.id, editContent)
      setIsEditing(false)
    } catch (error) {
      console.error('Error editing comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (comment.isHidden) {
    return (
      <div
        className={`space-y-3 ${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}
      >
        <div className='flex items-start gap-3'>
          <div className='h-8 w-8'></div>
          <div className='flex-1 space-y-2'>
            <p className='text-sm text-muted-foreground italic'>
              This comment has been hidden due to violation of community
              guidelines.
            </p>
          </div>
        </div>
        {comment.replies.length > 0 && (
          <div className='space-y-3'>
            {comment.replies.map(reply => (
              <CommentComponent
                key={reply.id}
                comment={reply}
                isReply={true}
                parentId={comment.id}
                onReply={onReply}
                onLike={onLike}
                onReport={onReport}
                onDelete={onDelete}
                onEdit={onEdit}
                onSubmitReply={onSubmitReply}
                replyTo={replyTo}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const isDescriptionRequired = reportReason === 'other'
  const isSubmitDisabled =
    !reportReason || (isDescriptionRequired && !reportDescription.trim())

  return (
    <div
      className={`space-y-3 ${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}
    >
      <div className='flex items-start gap-3'>
        <div className='relative'>
          <Avatar
            className={`h-8 w-8 ${comment.isManager ? 'ring-2 ring-red-500/70 ring-offset-2 shadow-sm shadow-red-500/20' : ''}`}
          >
            <AvatarImage
              src={comment.avatar || `/placeholder.svg?height=32&width=32`}
            />
            <AvatarFallback>
              {comment.author
                .split(' ')
                .map(n => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          {comment.isManager && (
            <Crown className='h-3.5 w-3.5 text-yellow-500 absolute -top-1.5 -right-1 fill-yellow-500 transform rotate-45 drop-shadow-sm' />
          )}
        </div>
        <div className='flex-1 space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span
                className={`font-medium text-sm ${comment.isManager ? 'text-red-600' : ''}`}
              >
                {comment.author}
              </span>
              {comment.isManager && (
                <Badge
                  variant='secondary'
                  className='text-xs bg-red-100 text-red-700 hover:bg-red-200 transition-colors'
                >
                  Admin
                </Badge>
              )}
              <span className='text-xs text-muted-foreground'>
                {comment.timestamp}
              </span>
            </div>
            <Dialog
              open={isReportDialogOpen}
              onOpenChange={setIsReportDialogOpen}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {comment.owner ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => onDelete(comment.id)}
                        className='text-destructive'
                      >
                        <Trash2 className='h-4 w-4 mr-2' />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Pencil className='h-4 w-4 mr-2' />
                        Edit
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => setIsReportDialogOpen(true)}
                    >
                      <Flag className='h-4 w-4 mr-2' />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Comment</DialogTitle>
                  <DialogDescription>
                    Please let us know why you want to report this comment
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <RadioGroup
                    value={reportReason}
                    onValueChange={value => {
                      setReportReason(value)
                      if (value !== 'other') {
                        setReportDescription('')
                      }
                    }}
                  >
                    {reportReasons.map(reason => (
                      <div
                        key={reason.id}
                        className='flex items-center space-x-2'
                      >
                        <RadioGroupItem value={reason.id} id={reason.id} />
                        <Label htmlFor={reason.id}>{reason.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='description'>
                        Description{' '}
                        {isDescriptionRequired ? '(required)' : '(optional)'}
                      </Label>
                      {isDescriptionRequired && !reportDescription.trim() && (
                        <span className='text-sm text-destructive'>
                          Please provide a detailed description
                        </span>
                      )}
                    </div>
                    <Textarea
                      id='description'
                      value={reportDescription}
                      onChange={e => setReportDescription(e.target.value)}
                      placeholder={
                        isDescriptionRequired
                          ? 'Please describe the reason for reporting in detail...'
                          : 'Add more details about the issue...'
                      }
                      className={
                        isDescriptionRequired && !reportDescription.trim()
                          ? 'border-destructive'
                          : ''
                      }
                    />
                  </div>
                </div>
                <div className='flex justify-end gap-3'>
                  <Button
                    variant='outline'
                    onClick={() => setIsReportDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReportSubmit}
                    disabled={isSubmitDisabled}
                  >
                    Submit Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className='space-y-2'>
              <Textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className='min-h-[100px]'
              />
              <div className='flex justify-end gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  size='sm'
                  disabled={!editContent.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          ) : (
            <p className='text-sm'>{comment.content}</p>
          )}
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onLike(comment.id)}
              className={`h-auto p-0 ${
                comment.likedByCurrentUser
                  ? 'text-blue-500 hover:text-blue-600'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ThumbsUp
                className={`h-3 w-3 mr-1 ${
                  comment.likedByCurrentUser ? 'fill-current' : ''
                }`}
              />
              {comment.likeCount}
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onReply(comment.id)}
              className='h-auto p-0 text-muted-foreground hover:text-foreground'
            >
              <Reply className='h-3 w-3 mr-1' />
              Reply
            </Button>
          </div>

          {replyTo === comment.id && (
            <form onSubmit={handleLocalReplySubmit} className='space-y-2'>
              <Textarea
                value={localReplyContent}
                onChange={e => setLocalReplyContent(e.target.value)}
                placeholder={
                  isReply
                    ? 'Your reply will be added to the main thread'
                    : 'Write your reply...'
                }
              />
              <div className='flex justify-end gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => onReply(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  size='sm'
                  disabled={!localReplyContent.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className='space-y-3'>
          {comment.replies.map(reply => (
            <CommentComponent
              key={reply.id}
              comment={reply}
              isReply={true}
              parentId={comment.id}
              onReply={onReply}
              onLike={onLike}
              onReport={onReport}
              onDelete={onDelete}
              onEdit={onEdit}
              onSubmitReply={onSubmitReply}
              replyTo={replyTo}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const CommentComponent = memo(CommentComponentBase)

export function DiscussionSection({
  courseId,
  lessonId,
}: DiscussionSectionProps) {
  const [comments, setComments] = useState<CommentDisplayData[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewComment(e.target.value)
    },
    []
  )

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await commentApi.getCommentsByLesson(lessonId)
      if (response?.data) {
        const transformedComments = response.data.map(transformComment)
        setComments(transformedComments)
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Failed to load comments')
      } else {
        toast.error('Failed to load comments')
      }
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleSubmitComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newComment.trim()) return

      try {
        setIsLoading(true)
        const response = await commentApi.createComment(lessonId, {
          content: newComment,
        })
        if (response?.data) {
          const newCommentData = transformComment(response.data)
          setComments(prev => [newCommentData, ...prev])
          setNewComment('')
          toast.success('Comment posted successfully')
        }
      } catch (error: any) {
        if (error.response?.status === 400) {
          toast.error(
            error.response.data?.message || 'Comment is too long or invalid'
          )
        } else {
          toast.error('Failed to post comment')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [lessonId, newComment]
  )

  const handleSubmitReply = useCallback(
    async (parentId: number, content: string) => {
      try {
        setIsLoading(true)
        const response = await commentApi.createComment(lessonId, {
          content: content,
          parentId: parentId,
        })

        if (response?.data) {
          const newReply = transformComment(response.data)
          setComments(prev => {
            return prev.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...comment.replies, newReply],
                }
              }

              const hasTargetReply = comment.replies.some(
                reply => reply.id === parentId
              )
              if (hasTargetReply) {
                return {
                  ...comment,
                  replies: [...comment.replies, newReply],
                }
              }

              return comment
            })
          })
          setReplyTo(null)
          toast.success('Reply posted successfully')
        }
      } catch (error: any) {
        if (error.response?.status === 400) {
          toast.error(
            error.response.data?.message || 'Reply is too long or invalid'
          )
        } else {
          toast.error('Failed to post reply')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [lessonId]
  )

  const handleLike = useCallback(async (commentId: number) => {
    try {
      const response = await commentApi.toggleLike(commentId)
      const isLiked = response.data

      setComments(prev =>
        prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likeCount: isLiked
                ? comment.likeCount + 1
                : comment.likeCount - 1,
              likedByCurrentUser: isLiked,
            }
          }
          const updatedReplies = comment.replies.map(reply =>
            reply.id === commentId
              ? {
                  ...reply,
                  likeCount: isLiked
                    ? reply.likeCount + 1
                    : reply.likeCount - 1,
                  likedByCurrentUser: isLiked,
                }
              : reply
          )
          return { ...comment, replies: updatedReplies }
        })
      )
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like status')
    }
  }, [])

  const handleReport = useCallback(
    async (commentId: number, reason: string, description?: string) => {
      try {
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'

        // Set severity based on reason
        if (reason === 'spam') severity = 'LOW'
        else if (reason === 'inappropriate') severity = 'MEDIUM'
        else if (reason === 'harassment') severity = 'HIGH'

        await reportApi.createReport({
          resourceType: 'COMMENT',
          resourceId: commentId,
          reason:
            reason === 'other' ? description?.trim() || 'Other reason' : reason,
          severity,
          description: reason === 'other' ? undefined : description?.trim(),
        })
        toast.success('Report submitted successfully')
      } catch (error) {
        console.error('Error reporting comment:', error)
        toast.error('Failed to submit report')
      }
    },
    []
  )

  const handleDelete = useCallback(async (commentId: number) => {
    try {
      await commentApi.deleteComment(commentId)
      setComments(prev => {
        const withoutDeleted = prev.filter(c => c.id !== commentId)
        if (withoutDeleted.length !== prev.length) return withoutDeleted

        return prev.map(comment => ({
          ...comment,
          replies: comment.replies.filter(reply => reply.id !== commentId),
        }))
      })
      toast.success('Comment deleted successfully')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }, [])

  const handleEdit = useCallback(
    async (commentId: number, newContent: string) => {
      try {
        const response = await commentApi.updateComment(commentId, {
          content: newContent,
        })
        const updatedComment = transformComment(response.data)
        setComments(prev =>
          prev.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, content: newContent }
            }
            const updatedReplies = comment.replies.map(reply =>
              reply.id === commentId ? { ...reply, content: newContent } : reply
            )
            return { ...comment, replies: updatedReplies }
          })
        )
        toast.success('Comment edited successfully')
      } catch (error) {
        console.error('Error editing comment:', error)
        toast.error('Failed to edit comment')
      }
    },
    []
  )

  const handleReplyClick = useCallback((commentId: number | null) => {
    setReplyTo(commentId)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <MessageSquare className='h-5 w-5' />
          Discussion
        </CardTitle>
        <CardDescription>
          Ask questions and discuss this lesson with other students
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <form onSubmit={handleSubmitComment} className='space-y-4'>
          <Textarea
            value={newComment}
            onChange={handleCommentChange}
            placeholder='Ask a question or share your thoughts...'
            className='min-h-[100px]'
          />
          <Button type='submit' disabled={isLoading || !newComment.trim()}>
            Post Comment
          </Button>
        </form>

        <div className='space-y-6'>
          {isLoading && comments.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              No comments yet. Be the first to start the discussion!
            </div>
          ) : (
            comments.map(comment => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                onReply={handleReplyClick}
                onLike={handleLike}
                onReport={handleReport}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onSubmitReply={handleSubmitReply}
                replyTo={replyTo}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
