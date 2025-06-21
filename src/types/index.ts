import { User, Post, Reply, Category, ChatLog, UserRole, PostStatus } from '@prisma/client'

export type { User, Post, Reply, Category, ChatLog, UserRole, PostStatus }

export interface PostWithDetails extends Post {
  user: User
  category: Category
  replies: (Reply & { user: User })[]
  _count: {
    replies: number
  }
}

export interface ReplyWithUser extends Reply {
  user: User
}

export interface CategoryWithCount extends Category {
  _count: {
    posts: number
  }
}

export interface ChatMessage {
  id: string
  message: string
  response: string
  timestamp: Date
  isUser: boolean
}

export interface ForumFilters {
  category?: string
  search?: string
  sortBy?: 'newest' | 'oldest' | 'mostReplies'
  status?: PostStatus
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}