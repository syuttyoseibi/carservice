import { GoogleGenerativeAI } from '@google/generative-ai'
import { AUTOMOTIVE_SYSTEM_PROMPT } from './automotive-prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class AutomotiveAI {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.3, // 専門的回答のため低め
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1000,
    }
  })

  async generateResponse(userMessage: string, chatHistory: string[] = []): Promise<string> {
    try {
      // 会話履歴を文字列に変換（最新5件のみ）
      const recentHistory = chatHistory.slice(-5).join('\n')
      
      const prompt = `${AUTOMOTIVE_SYSTEM_PROMPT}

【質問】
${userMessage}

【最近の会話履歴】
${recentHistory}

上記に基づいて、専門的で実用的な回答をお願いします。`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()

    } catch (error) {
      console.error('Gemini API Error:', error)
      
      // フォールバック用の基本回答
      return this.getFallbackResponse(userMessage)
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('かからない') || lowerMessage.includes('始動')) {
      return `
症状：エンジン始動不良
考えられる原因：
• バッテリー上がり（最も一般的）
• セルモーターの故障
• 燃料系統の問題

診断手順：
1. バッテリー電圧をチェック（12.6V以上か確認）
2. セルモーターの回転音を確認
3. 燃料の臭いを確認

緊急度：高
概算費用：バッテリー交換 8,000円〜15,000円

注意事項：バッテリー端子は素手で触らず、ショートに注意してください。
      `
    }

    if (lowerMessage.includes('オイル')) {
      return `
症状：エンジンオイル関連
メンテナンス情報：
• 交換間隔：5,000km〜10,000kmまたは6ヶ月
• オイル量：エンジンサイズにより3-6L
• 推奨粘度：5W-30または0W-20（車種により異なる）

診断手順：
1. オイルレベルゲージで量を確認
2. オイルの色と粘度をチェック
3. エンジン音の変化を確認

緊急度：中
概算費用：3,000円〜8,000円（オイル代+工賃）

注意事項：オイル不足での走行は避けてください。
      `
    }

    if (lowerMessage.includes('ブレーキ') || lowerMessage.includes('音')) {
      return `
症状：ブレーキ系統の異音
考えられる原因：
• ブレーキパッドの摩耗
• ディスクローターの変形
• ブレーキフルードの劣化

診断手順：
1. ブレーキパッドの厚みを目視確認
2. ブレーキペダルの感触をチェック
3. 異音の発生タイミングを確認

緊急度：高
概算費用：パッド交換 15,000円〜30,000円

注意事項：ブレーキの異常は重大事故につながる可能性があります。すぐに専門業者にご相談ください。
      `
    }

    if (lowerMessage.includes('エアコン') || lowerMessage.includes('冷房')) {
      return `
症状：エアコン関連の問題
考えられる原因：
• 冷媒ガス不足
• コンプレッサーの故障
• エアコンフィルターの詰まり

診断手順：
1. エアコンフィルターの状態を確認
2. 冷風の温度をチェック
3. 異音の有無を確認

緊急度：低
概算費用：ガス補充 5,000円〜、フィルター交換 3,000円〜

注意事項：夏場の故障は熱中症のリスクがあります。早めの点検をお勧めします。
      `
    }

    return '申し訳ございませんが、もう少し具体的に症状を教えていただけますか？例：「エンジンがかからない」「ブレーキから音がする」「オイル交換の時期」など、できるだけ詳しくお聞かせください。'
  }
}

export const automotiveAI = new AutomotiveAI()