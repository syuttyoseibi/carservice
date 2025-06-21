import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPostSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
  content: z.string().min(1, '内容は必須です'),
  categoryId: z.string().min(1, 'カテゴリは必須です')
})

// 投稿作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const categoryId = formData.get('categoryId') as string
    const image = formData.get('image') as File | null

    // バリデーション
    const validatedData = createPostSchema.parse({
      title,
      content,
      categoryId
    })

    // カテゴリの存在確認
    const category = await prisma.category.findUnique({
      where: { slug: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { message: '無効なカテゴリです' },
        { status: 400 }
      )
    }

    let imageUrl = null
    
    // 画像処理（簡易版 - 実際の実装ではCloudinaryなどを使用）
    if (image && image.size > 0) {
      // ここでは画像をbase64として保存（デモ用）
      // 実際の運用では外部ストレージサービスを使用
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // ファイルサイズチェック（5MB制限）
      if (buffer.length > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: '画像ファイルは5MB以下にしてください' },
          { status: 400 }
        )
      }

      // 簡易的な画像URL生成（実際の実装では外部ストレージのURLを使用）
      imageUrl = `data:${image.type};base64,${buffer.toString('base64')}`
    }

    // 投稿作成
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        userId: session.user.id,
        categoryId: category.id,
        imageUrl,
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

    return NextResponse.json(
      { 
        message: '投稿が正常に作成されました',
        post 
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

    console.error('Post creation error:', error)
    return NextResponse.json(
      { message: '投稿の作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 投稿一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // フィルター条件構築
    const where: any = {
      status: 'PUBLISHED'
    }

    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category }
      })
      if (categoryRecord) {
        where.categoryId = categoryRecord.id
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ]
    }

    // 投稿取得
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json(
      { message: '投稿の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}