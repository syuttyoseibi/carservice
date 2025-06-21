import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createReplySchema = z.object({
  content: z.string().min(1, '回答内容は必須です')
})

// 回答一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // 投稿の存在確認
    const post = await prisma.post.findUnique({
      where: {
        id,
        status: 'PUBLISHED'
      }
    })

    if (!post) {
      return NextResponse.json(
        { message: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // 回答一覧取得
    const replies = await prisma.reply.findMany({
      where: {
        postId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: [
        { isBestAnswer: 'desc' }, // ベストアンサーを最初に表示
        { createdAt: 'asc' }      // その後は投稿順
      ]
    })

    return NextResponse.json({ replies })

  } catch (error) {
    console.error('Replies fetch error:', error)
    return NextResponse.json(
      { message: '回答の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 回答作成
export async function POST(
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

    const body = await request.json()
    const validatedData = createReplySchema.parse(body)

    // 投稿の存在確認
    const post = await prisma.post.findUnique({
      where: {
        id,
        status: 'PUBLISHED'
      }
    })

    if (!post) {
      return NextResponse.json(
        { message: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // 回答作成
    const reply = await prisma.reply.create({
      data: {
        content: validatedData.content,
        postId: id,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: '回答が正常に投稿されました',
        reply 
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Reply creation error:', error)
    return NextResponse.json(
      { message: '回答の投稿中にエラーが発生しました' },
      { status: 500 }
    )
  }
}