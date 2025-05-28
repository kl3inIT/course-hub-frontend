"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, Reply } from "lucide-react"

interface DiscussionSectionProps {
  courseId: string
  lessonId: string
}

interface Comment {
  id: number
  author: string
  content: string
  timestamp: string
  likes: number
  isInstructor: boolean
  replies: Comment[]
}

const mockComments: Comment[] = [
  {
    id: 1,
    author: "Alice Johnson",
    content: "Great explanation of React components! The examples really helped me understand the concept better.",
    timestamp: "2 hours ago",
    likes: 5,
    isInstructor: false,
    replies: [
      {
        id: 2,
        author: "John Doe",
        content: "Thanks Alice! I'm glad the examples were helpful. Feel free to ask if you have any questions.",
        timestamp: "1 hour ago",
        likes: 2,
        isInstructor: true,
        replies: [],
      },
    ],
  },
  {
    id: 3,
    author: "Bob Smith",
    content: "I'm having trouble understanding the difference between props and state. Could someone explain?",
    timestamp: "4 hours ago",
    likes: 3,
    isInstructor: false,
    replies: [],
  },
]

export function DiscussionSection({ courseId, lessonId }: DiscussionSectionProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const comment: Comment = {
      id: Date.now(),
      author: user.name || user.email || "Anonymous",
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      isInstructor: user.role === "instructor",
      replies: [],
    }

    setComments((prev) => [comment, ...prev])
    setNewComment("")
  }

  const handleSubmitReply = (parentId: number) => {
    if (!replyContent.trim()) return

    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const reply: Comment = {
      id: Date.now(),
      author: user.name || user.email || "Anonymous",
      content: replyContent,
      timestamp: "Just now",
      likes: 0,
      isInstructor: user.role === "instructor",
      replies: [],
    }

    setComments((prev) =>
      prev.map((comment) => (comment.id === parentId ? { ...comment, replies: [...comment.replies, reply] } : comment)),
    )
    setReplyContent("")
    setReplyTo(null)
  }

  const handleLike = (commentId: number, isReply = false, parentId?: number) => {
    if (isReply && parentId) {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === commentId ? { ...reply, likes: reply.likes + 1 } : reply,
                ),
              }
            : comment,
        ),
      )
    } else {
      setComments((prev) =>
        prev.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment)),
      )
    }
  }

  const CommentComponent = ({
    comment,
    isReply = false,
    parentId,
  }: {
    comment: Comment
    isReply?: boolean
    parentId?: number
  }) => (
    <div className={`space-y-3 ${isReply ? "ml-8 border-l-2 border-muted pl-4" : ""}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
          <AvatarFallback>
            {comment.author
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.author}</span>
            {comment.isInstructor && (
              <Badge variant="secondary" className="text-xs">
                Instructor
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
          </div>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(comment.id, isReply, parentId)}
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {comment.likes}
            </Button>
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>

          {replyTo === comment.id && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmitReply(comment.id)
              }}
              className="space-y-2"
            >
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Post Reply
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentComponent key={reply.id} comment={reply} isReply={true} parentId={comment.id} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Discussion
        </CardTitle>
        <CardDescription>Ask questions and discuss this lesson with other students</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            className="min-h-[100px]"
          />
          <Button type="submit">Post Comment</Button>
        </form>

        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentComponent key={comment.id} comment={comment} />
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to start the discussion!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
