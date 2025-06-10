import { User } from './user'
import { ApiResponse } from './common'

export interface Comment {
  id: number
  content: string
  author: User
  createdAt: string
  updatedAt: string
  likes: number
  replies: Comment[]
  isHidden: boolean
}

export interface CommentRequestDTO {
  content: string
  parentId?: number
}

export interface CommentResponseDTO {
  id: number
  content: string
  author: string
  avatar: string
  createdAt: string
  isManager: boolean
  isHidden: number | null
  likeCount: number
  likedByCurrentUser: boolean
  userId: number
  owner: boolean
  replies: CommentResponseDTO[]
}

// Interface cho hiển thị trên UI
export interface CommentDisplayData {
  id: number
  content: string
  author: string
  avatar: string
  timestamp: string
  isManager: boolean
  isHidden: boolean
  likeCount: number
  likedByCurrentUser: boolean
  userId: number
  owner: boolean
  replies: CommentDisplayData[]
}

export type CommentResponse = ApiResponse<CommentResponseDTO>
export type CommentsResponse = ApiResponse<CommentResponseDTO[]>

// Helper function to transform API response to display data
export const transformComment = (
  comment: CommentResponseDTO
): CommentDisplayData => {
  const transformed = {
    id: comment.id,
    content: comment.content,
    author: comment.author,
    avatar: comment.avatar,
    timestamp: new Date(comment.createdAt).toLocaleString(),
    isManager: comment.isManager,
    isHidden: comment.isHidden === 1,
    likeCount: comment.likeCount,
    likedByCurrentUser: comment.likedByCurrentUser,
    userId: comment.userId,
    owner: comment.owner,
    replies: Array.isArray(comment.replies)
      ? comment.replies.map(transformComment)
      : [],
  }
  return transformed
}
