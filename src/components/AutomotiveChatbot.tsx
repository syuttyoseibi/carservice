'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

export interface ChatbotRef {
  setQuestion: (question: string) => void
}

const AutomotiveChatbot = forwardRef<ChatbotRef>((props, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '自動車修理に関するご質問にお答えします。どのような症状でお困りですか？\n\n例：「エンジンがかからない」「ブレーキから音がする」「オイル交換の時期」など',
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dailyUsage, setDailyUsage] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // 使用量をローカルストレージから読み込み
    checkUsageLimit()
  }, [])

  useImperativeHandle(ref, () => ({
    setQuestion: (question: string) => {
      setInput(question)
    }
  }))

  // 使用量制限チェック（1日50回まで）
  const checkUsageLimit = () => {
    const today = new Date().toDateString()
    const storedData = localStorage.getItem('chatbot_usage')
    
    if (storedData) {
      const { date, count } = JSON.parse(storedData)
      if (date === today) {
        setDailyUsage(count)
        return count < 50
      }
    }
    
    setDailyUsage(0)
    return true
  }

  const updateUsageCount = () => {
    const today = new Date().toDateString()
    const newCount = dailyUsage + 1
    setDailyUsage(newCount)
    localStorage.setItem('chatbot_usage', JSON.stringify({
      date: today,
      count: newCount
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // 使用量制限チェック
    if (!checkUsageLimit()) {
      alert('本日の使用回数制限に達しました。明日再度お試しください。')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // 会話履歴を準備
      const chatHistory = messages.slice(-4).map(m => 
        `${m.isBot ? 'AI' : 'ユーザー'}: ${m.content}`
      )

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          history: chatHistory
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isBot: true,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      updateUsageCount()

    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '申し訳ございません。一時的にサービスが利用できません。しばらく時間をおいて再度お試しください。',
        isBot: true,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    // フォーカスを入力フィールドに移動
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder="症状を詳しく教えてください..."]') as HTMLInputElement
      if (inputElement) {
        inputElement.focus()
      }
    }, 100)
  }

  return (
    <div className="flex flex-col h-[500px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">自動車修理AI相談</h3>
              <p className="text-blue-100 text-sm">本日の利用回数: {dailyUsage}/50</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">オンライン</span>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${!message.isBot ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* アバター */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                !message.isBot ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                {!message.isBot ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* メッセージバブル */}
              <div className={`px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap ${
                !message.isBot
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
              }`}>
                <div className="text-sm leading-relaxed">{message.content}</div>
                <div className={`text-xs mt-2 ${!message.isBot ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">回答を生成中...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="症状を詳しく教えてください..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || dailyUsage >= 50}
                maxLength={500}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {input.length}/500
              </div>
            </div>
            {dailyUsage >= 50 && (
              <p className="text-xs text-red-500 mt-1">
                本日の利用上限に達しました。明日再度お試しください。
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim() || dailyUsage >= 50}
            className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
})

AutomotiveChatbot.displayName = 'AutomotiveChatbot'

export default AutomotiveChatbot