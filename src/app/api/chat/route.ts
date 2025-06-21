import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { automotiveAI } from '@/lib/gemini'

// デモ用のレスポンス生成関数（フォールバック用）
function generateResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // キーワードベースの簡単な応答システム
  if (lowerMessage.includes('エンジンオイル') || lowerMessage.includes('オイル交換')) {
    return `エンジンオイル交換について回答します：

一般的な交換頻度：
• 通常のエンジンオイル：5,000km または 6ヶ月
• 高性能合成オイル：10,000km または 12ヶ月
• 厳しい使用条件下：3,000-5,000km

交換時期の判断基準：
• オイルの色が黒く変色
• 粘度の低下
• 金属粉の混入
• 走行距離

定期的な交換により、エンジンの寿命を延ばし、燃費向上にもつながります。`
  }
  
  if (lowerMessage.includes('ブレーキ') || lowerMessage.includes('パッド')) {
    return `ブレーキパッドの交換について説明します：

交換時期の目安：
• パッド厚：残り2-3mm以下
• 走行距離：20,000-40,000km（使用状況による）
• 異音：キーキー音やゴリゴリ音

点検ポイント：
• 目視でのパッド厚確認
• ブレーキフルードの汚れ
• ローターの摩耗状況
• ブレーキの効き具合

安全に直結する部品のため、定期点検を怠らないようにしましょう。`
  }
  
  if (lowerMessage.includes('cvt') || lowerMessage.includes('異音')) {
    return `CVTの異音について解説します：

主な異音の原因：
• CVTフルードの劣化・不足
• ベルトとプーリーの摩耗
• バルブボディの不具合
• 電子制御系の問題

診断手順：
1. CVTフルードレベル・状態確認
2. 診断機での故障コード確認
3. 路上テストでの症状確認
4. 内部点検（必要に応じて）

早期発見・対処により、大きな故障を防げます。`
  }
  
  if (lowerMessage.includes('ハイブリッド') || lowerMessage.includes('バッテリー')) {
    return `ハイブリッド車のメンテナンスについて：

特別な注意点：
• 高電圧システムの安全確保
• 駆動用バッテリーの状態監視
• 冷却システムの点検
• 回生ブレーキシステムの確認

メンテナンス項目：
• エンジンオイル（通常車と同様）
• ブレーキフルード
• 冷却水（エンジン・インバーター用）
• エアフィルター

専用診断機での定期チェックが重要です。`
  }
  
  if (lowerMessage.includes('診断機') || lowerMessage.includes('診断')) {
    return `診断機の効果的な使用方法：

基本手順：
1. 車両情報の正確な入力
2. 全システムスキャン実行
3. 故障コードの詳細確認
4. ライブデータの監視
5. アクチュエーターテスト

活用のコツ：
• 症状と故障コードの関連性確認
• 履歴データとの比較
• メーカー別の特殊機能活用
• 定期的なソフトウェア更新

診断機は故障の手がかりを提供するツールです。最終判断は技術者の経験と知識が重要です。`
  }
  
  // デフォルトレスポンス
  return `ご質問ありがとうございます。

自動車修理に関するご質問にお答えします。以下のような内容についてお気軽にお聞きください：

• エンジン関連（オイル交換、異音、不調など）
• ブレーキシステム（パッド交換、フルード交換など）
• トランスミッション（CVT、AT、MTの不具合）
• 電装系（バッテリー、オルタネーター、ECUなど）
• 診断・故障探求の方法
• 工場運営・業務改善

より具体的な症状や車種をお教えいただければ、詳しい回答ができます。

※このAIアシスタントは参考情報を提供します。実際の作業は安全を最優先に、適切な手順で行ってください。`
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId, history } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      )
    }

    // 基本的な入力検証
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'メッセージが長すぎます（500文字以内）' },
        { status: 400 }
      )
    }

    // Gemini AIでレスポンスを生成（フォールバック付き）
    let response: string
    try {
      response = await automotiveAI.generateResponse(message, history || [])
    } catch (aiError) {
      console.error('AI generation error:', aiError)
      // フォールバック用のレスポンス
      response = generateResponse(message)
    }

    // チャットログをデータベースに保存
    try {
      await prisma.chatLog.create({
        data: {
          userId: userId || null,
          message: message,
          response: response
        }
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      // データベースエラーでもレスポンスは返す
    }

    return NextResponse.json({
      response: response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'チャット処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}