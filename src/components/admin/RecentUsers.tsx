'use client'

import { formatRelativeTime } from '@/lib/utils'
import { User, FileText, MessageCircle, Shield, Crown } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: {
    posts: number
    replies: number
  }
}

interface RecentUsersProps {
  users: User[]
}

export default function RecentUsers({ users }: RecentUsersProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4 text-purple-600" />
      case 'MODERATOR':
        return <Shield className="h-4 w-4 text-green-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '管理者'
      case 'MODERATOR':
        return 'モデレーター'
      default:
        return 'ユーザー'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'MODERATOR':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">最近のユーザー</h2>
      
      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ユーザーがいません
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {getRoleIcon(user.role)}
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {user.email}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      {user._count.posts}投稿
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {user._count.replies}回答
                    </div>
                    <span>登録: {formatRelativeTime(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center">
        <a
          href="/admin/users"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          すべてのユーザーを見る →
        </a>
      </div>
    </div>
  )
}