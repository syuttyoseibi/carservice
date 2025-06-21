import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminStats from '@/components/admin/AdminStats'
import RecentPosts from '@/components/admin/RecentPosts'
import RecentUsers from '@/components/admin/RecentUsers'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  // 管理者権限チェック
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    redirect('/')
  }

  // 統計データ取得
  const [
    totalUsers,
    totalPosts,
    totalReplies,
    recentPosts,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.reply.count(),
    prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            replies: true
          }
        }
      }
    })
  ])

  const stats = {
    totalUsers,
    totalPosts,
    totalReplies,
    avgRepliesPerPost: totalPosts > 0 ? Math.round((totalReplies / totalPosts) * 10) / 10 : 0
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">管理者パネル</h1>
        <p className="text-gray-600 mt-2">
          プラットフォームの管理と監視
        </p>
      </div>

      {/* 統計カード */}
      <AdminStats stats={stats} />

      {/* コンテンツグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentPosts posts={recentPosts} />
        <RecentUsers users={recentUsers} />
      </div>
    </div>
  )
}