import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 投稿詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await prisma.post.findUnique({
      where: {
        id,
        status: 'PUBLISHED'
      },
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
            id: true,
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
    })

    if (!post) {
      return NextResponse.json(
        { message: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Post fetch error:', error)
    return NextResponse.json(
      { message: '投稿の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 投稿削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // 投稿の存在確認と権限チェック
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { message: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // 権限チェック（投稿者本人または管理者のみ削除可能）
    const canDelete = 
      post.userId === session.user.id || 
      session.user.role === 'ADMIN' ||
      session.user.role === 'MODERATOR'

    if (!canDelete) {
      return NextResponse.json(
        { message: '削除権限がありません' },
        { status: 403 }
      )
    }

    // 関連する回答も含めて削除
    await prisma.$transaction([
      prisma.reply.deleteMany({
        where: { postId: id }
      }),
      prisma.post.delete({
        where: { id }
      })
    ])

    return NextResponse.json(
      { message: '投稿が正常に削除されました' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Post deletion error:', error)
    return NextResponse.json(
      { message: '投稿の削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}