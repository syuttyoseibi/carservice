'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X } from 'lucide-react'

export default function NewPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: ''
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const categories = [
    { id: 'engine', name: 'エンジン関連' },
    { id: 'transmission', name: 'トランスミッション' },
    { id: 'electrical', name: '電装系' },
    { id: 'diagnosis', name: '診断・故障探求' },
    { id: 'business', name: '経営・業務改善' }
  ]

  // 認証チェック
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（5MB制限）
      if (file.size > 5 * 1024 * 1024) {
        setError('画像ファイルは5MB以下にしてください。')
        return
      }

      // ファイル形式チェック
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください。')
        return
      }

      setImage(file)
      setError('')

      // プレビュー表示
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // バリデーション
    if (!formData.title.trim()) {
      setError('タイトルを入力してください。')
      setIsLoading(false)
      return
    }

    if (!formData.content.trim()) {
      setError('内容を入力してください。')
      setIsLoading(false)
      return
    }

    if (!formData.categoryId) {
      setError('カテゴリを選択してください。')
      setIsLoading(false)
      return
    }

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title.trim())
      submitData.append('content', formData.content.trim())
      submitData.append('categoryId', formData.categoryId)
      
      if (image) {
        submitData.append('image', image)
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/forum')
      } else {
        setError(data.message || '投稿の作成に失敗しました。')
      }
    } catch (error) {
      setError('投稿の作成中にエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/forum"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          フォーラムに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">新規投稿</h1>
        <p className="text-gray-600 mt-2">
          自動車修理に関する質問や情報を投稿してください
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：エンジンオイル交換の適切な頻度について"
              maxLength={200}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.title.length}/200文字
            </p>
          </div>

          {/* カテゴリ */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">カテゴリを選択してください</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* 内容 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="詳細な質問内容や情報を入力してください。

例：
- 症状の詳細
- 車種・年式
- 試した対処法
- 質問したいポイント

具体的に書いていただくと、より適切な回答が得られます。"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.content.length}文字
            </p>
          </div>

          {/* 画像アップロード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像（任意）
            </label>
            <div className="space-y-4">
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    画像をアップロードしてください（任意）
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    JPG, PNG, GIF形式、5MB以下
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    ファイルを選択
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="プレビュー"
                    className="max-w-full h-auto rounded-lg border border-gray-300"
                    style={{ maxHeight: '300px' }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* 投稿ガイドライン */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">投稿ガイドライン</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 具体的で分かりやすいタイトルを付けてください</li>
              <li>• 車種、年式、症状などの詳細情報を含めてください</li>
              <li>• 他のユーザーに敬意を払い、建設的な内容にしてください</li>
              <li>• 個人情報や機密情報は投稿しないでください</li>
            </ul>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/forum"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  投稿中...
                </div>
              ) : (
                '投稿する'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}