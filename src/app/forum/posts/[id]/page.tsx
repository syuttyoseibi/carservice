'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Clock, User, Tag, ThumbsUp, Edit, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Post {
  id: string
  title: string
  content: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    role: string
  }
  category: {
    id: string
    name: string
    slug: string
  }
  _count: {
    replies: number
  }
}

interface Reply {
  id: string
  content: string
  isBestAnswer: boolean
  createdAt: string
  user: {
    id: string
    name: string
    role: string
  }
}

export default function PostDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const postId = params?.id as string

  useEffect(() => {
    if (postId) {
      fetchPost()
      fetchReplies()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      } else if (response.status === 404) {
        router.push('/forum')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/replies`)
      if (response.ok) {
        const data = await response.json()
        setReplies(data.replies)
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || !session) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim()
        }),
      })

      if (response.ok) {
        setReplyContent('')
        fetchReplies() // 回答一覧を再取得
      } else {
        const data = await response.json()
        setError(data.message || '回答の投稿に失敗しました')
      }
    } catch (error) {
      setError('回答の投稿中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('この投稿を削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/forum')
      } else {
        alert('投稿の削除に失敗しました')
      }
    } catch (error) {
      alert('投稿の削除中にエラーが発生しました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">投稿が見つかりません</h2>
        <Link
          href="/forum"
          className="text-blue-600 hover:text-blue-800"
        >
          フォーラムに戻る
        </Link>
      </div>
    )
  }

  const canEditPost = session?.user?.id === post.user.id || session?.user?.role === 'ADMIN'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ナビゲーション */}
      <div className="flex items-center justify-between">
        <Link
          href="/forum"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          フォーラムに戻る
        </Link>
        
        {canEditPost && (
          <div className="flex space-x-2">
            <Link
              href={`/forum/posts/${post.id}/edit`}
              className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              編集
            </Link>
            <button
              onClick={handleDeletePost}
              className="inline-flex items-center px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              削除
            </button>
          </div>
        )}
      </div>

      {/* 投稿詳細 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Tag className="h-3 w-3 mr-1" />
              {post.category.name}
            </span>
            {post.user.role === 'MODERATOR' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                モデレーター
              </span>
            )}
            {post.user.role === 'ADMIN' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                管理者
              </span>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {post.user.name}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatRelativeTime(post.createdAt)}
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              {post._count.replies}件の回答
            </div>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-900">
            {post.content}
          </div>
          
          {post.imageUrl && (
            <div className="mt-4">
              <img
                src={post.imageUrl}
                alt="投稿画像"
                className="max-w-full h-auto rounded-lg border border-gray-300"
                style={{ maxHeight: '500px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 回答一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          回答 ({replies.length}件)
        </h2>

        {replies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            まだ回答がありません。最初の回答を投稿してみませんか？
          </div>
        ) : (
          <div className="space-y-6">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className={`border rounded-lg p-4 ${
                  reply.isBestAnswer ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {reply.user.name}
                    </span>
                    {reply.user.role === 'MODERATOR' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        モデレーター
                      </span>
                    )}
                    {reply.user.role === 'ADMIN' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        管理者
                      </span>
                    )}
                    {reply.isBestAnswer && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        ベストアンサー
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(reply.createdAt)}
                  </span>
                </div>
                
                <div className="whitespace-pre-wrap text-gray-900">
                  {reply.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 回答投稿フォーム */}
      {session ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            回答を投稿
          </h3>
          
          <form onSubmit={handleReplySubmit} className="space-y-4">
            <div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="回答を入力してください..."
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    投稿中...
                  </div>
                ) : (
                  '回答を投稿'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">
            回答を投稿するにはログインが必要です
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ログイン
          </Link>
        </div>
      )}
    </div>
  )
}