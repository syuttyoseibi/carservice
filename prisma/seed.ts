import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('データベースのシードを開始します...')

  // カテゴリを作成
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'engine' },
      update: {},
      create: {
        name: 'エンジン関連',
        description: 'エンジンの修理、メンテナンス、トラブルシューティング',
        slug: 'engine'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'transmission' },
      update: {},
      create: {
        name: 'トランスミッション',
        description: 'AT、MT、CVTの修理とメンテナンス',
        slug: 'transmission'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'electrical' },
      update: {},
      create: {
        name: '電装系',
        description: 'バッテリー、オルタネーター、ECU、配線関連',
        slug: 'electrical'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'diagnosis' },
      update: {},
      create: {
        name: '診断・故障探求',
        description: '故障診断の方法、診断機の使用方法',
        slug: 'diagnosis'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: '経営・業務改善',
        description: '工場運営、効率化、顧客対応',
        slug: 'business'
      }
    })
  ])

  console.log('カテゴリを作成しました:', categories.length)

  // ユーザーを作成
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        name: 'デモユーザー',
        email: 'demo@example.com',
        role: 'USER',
        profile: hashedPassword
      }
    }),
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: '管理者',
        email: 'admin@example.com',
        role: 'ADMIN',
        profile: hashedPassword
      }
    }),
    prisma.user.upsert({
      where: { email: 'tanaka@example.com' },
      update: {},
      create: {
        name: '田中整備士',
        email: 'tanaka@example.com',
        role: 'USER',
        profile: hashedPassword
      }
    }),
    prisma.user.upsert({
      where: { email: 'sato@example.com' },
      update: {},
      create: {
        name: '佐藤工場長',
        email: 'sato@example.com',
        role: 'MODERATOR',
        profile: hashedPassword
      }
    })
  ])

  console.log('ユーザーを作成しました:', users.length)

  // 投稿を作成
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'エンジンオイル交換の適切な頻度について',
        content: `最近のエンジンオイルの品質向上により、交換頻度について議論があります。

皆さんの工場では、どのような基準でオイル交換を推奨していますか？

私の工場では以下の基準で案内しています：
- 通常使用：10,000km または 1年
- 厳しい使用条件：5,000km または 6ヶ月

しかし、お客様からは「もっと早く交換した方が良いのでは？」という質問をよく受けます。

メーカー推奨と実際の現場での判断について、皆さんのご意見をお聞かせください。`,
        userId: users[2].id, // 田中整備士
        categoryId: categories[0].id, // エンジン関連
        status: 'PUBLISHED'
      }
    }),
    prisma.post.create({
      data: {
        title: 'CVTの異音診断について相談',
        content: `お客様のCVT車で異音が発生しています。

症状：
- 発進時にウィーンという高音
- 加速時に音が大きくなる
- 停車時は音がしない

診断機では特にエラーコードは出ていません。
CVTフルードは交換したばかりです。

同様の症状を経験された方、診断のポイントを教えてください。`,
        userId: users[3].id, // 佐藤工場長
        categoryId: categories[1].id, // トランスミッション
        status: 'PUBLISHED'
      }
    }),
    prisma.post.create({
      data: {
        title: 'ハイブリッド車のバッテリー診断ツール',
        content: `ハイブリッド車のバッテリー診断に使用している機器について情報交換しませんか？

現在使用している機器：
- メーカー純正診断機
- 汎用OBD2スキャナー

しかし、バッテリーの劣化状態をより詳しく診断したいと考えています。

おすすめの診断ツールや、診断時の注意点があれば教えてください。`,
        userId: users[0].id, // デモユーザー
        categoryId: categories[2].id, // 電装系
        status: 'PUBLISHED'
      }
    })
  ])

  console.log('投稿を作成しました:', posts.length)

  // 回答を作成
  const replies = await Promise.all([
    prisma.reply.create({
      data: {
        content: `オイル交換頻度については、私も同じような悩みを持っています。

実際のところ、以下の要因を考慮して判断しています：

1. 使用環境
   - 市街地走行が多い → 短めの間隔
   - 高速道路中心 → メーカー推奨でOK

2. エンジンの状態
   - 高走行車 → 短めの間隔
   - 新車〜中古車 → メーカー推奨

3. オイルの品質
   - 鉱物油 → 5,000km
   - 化学合成油 → 10,000km

お客様には使用状況をヒアリングして、個別に提案するのが良いと思います。`,
        postId: posts[0].id,
        userId: users[3].id, // 佐藤工場長
        isBestAnswer: true
      }
    }),
    prisma.reply.create({
      data: {
        content: `CVTの異音、よくある症状ですね。

私の経験では以下をチェックします：

1. CVTフルードの状態再確認
   - 色、匂い、粘度
   - 金属粉の混入

2. ベルトとプーリーの状態
   - 内視鏡での確認
   - 異物の挟み込み

3. 電子制御系
   - 学習値のリセット
   - アクチュエーターテスト

フルード交換直後ということなので、学習値のリセットを試してみてください。`,
        postId: posts[1].id,
        userId: users[2].id, // 田中整備士
        isBestAnswer: false
      }
    })
  ])

  console.log('回答を作成しました:', replies.length)

  console.log('シードデータの作成が完了しました！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })