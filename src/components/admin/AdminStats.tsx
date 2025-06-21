'use client'

import { Users, FileText, MessageCircle, TrendingUp } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalPosts: number
  totalReplies: number
  avgRepliesPerPost: number
}

interface AdminStatsProps {
  stats: Stats
}

export default function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      title: '総ユーザー数',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: '総投稿数',
      value: stats.totalPosts.toLocaleString(),
      icon: FileText,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: '総回答数',
      value: stats.totalReplies.toLocaleString(),
      icon: MessageCircle,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: '平均回答数/投稿',
      value: stats.avgRepliesPerPost.toString(),
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.textColor}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}