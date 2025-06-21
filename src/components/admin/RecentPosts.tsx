'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import { Eye, Trash2, MessageCircle, User, Tag } from 'lucide-react'

interface Post {
  id: string
  title: string
  createdAt: string
  user: {
    id: string
    name: string
    role: string
  }
  category: {
    name: string
    slug: string
  }
  _count: {
    replies: number
  }
}

interface RecentPostsProps {
  posts: Post[]
}

export default function RecentPosts({ posts: initialPosts }: RecentPostsProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeletePost = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？この操作は取り消せません。')) {
      return
    }

    setDeletingId(postId)

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
      } else {
        alert('投稿の削除に失敗しました')
      }
    } catch (error) {
      alert('投稿の削除中にエラーが発生しました')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">最近の投稿</h2>
      
      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          投稿がありません
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Tag className="h-3 w-3 mr-1" />
                      {post.category.name}
                    </span>
                    {post.user.role === 'MODERATOR' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        モデレーター
                      </span>
                    )}
                    {post.user.role === 'ADMIN' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        管理者
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-900 truncate mb-2">
                    {post.title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {post.user.name}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {post._count.replies}件
                    </div>
                    <span>{formatRelativeTime(post.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    href={`/forum/posts/${post.id}`}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="詳細を見る"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletingId === post.id}
                    className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                    title="削除"
                  >
                    {deletingId === post.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center">
        <Link
          href="/admin/posts"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          すべての投稿を見る →
        </Link>
      </div>
    </div>
  )
}