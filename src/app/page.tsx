import Link from "next/link";
import { MessageCircle, Users, TrendingUp, Wrench } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: MessageCircle,
      title: "質問・相談フォーラム",
      description: "自動車修理に関する質問を投稿し、専門家や同業者から回答を得られます。",
      href: "/forum"
    },
    {
      icon: Users,
      title: "専門家コミュニティ",
      description: "経験豊富な修理工や専門家とつながり、知識を共有できます。",
      href: "/forum"
    },
    {
      icon: TrendingUp,
      title: "業界インサイト",
      description: "修理業界のトレンドや改善提案を受け取り、ビジネスを成長させましょう。",
      href: "/insights"
    },
    {
      icon: Wrench,
      title: "AIチャットサポート",
      description: "24時間利用可能なAIチャットボットで、即座に回答を得られます。",
      href: "/chat"
    }
  ];

  const categories = [
    { name: "エンジン関連", count: 245, color: "bg-red-100 text-red-800" },
    { name: "トランスミッション", count: 189, color: "bg-blue-100 text-blue-800" },
    { name: "電装系", count: 156, color: "bg-green-100 text-green-800" },
    { name: "診断・故障探求", count: 298, color: "bg-yellow-100 text-yellow-800" },
    { name: "経営・業務改善", count: 87, color: "bg-purple-100 text-purple-800" }
  ];

  return (
    <div className="space-y-12">
      {/* ヒーローセクション */}
      <section className="text-center py-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          自動車修理業界の
          <br />
          知識共有プラットフォーム
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          修理工場、整備士、専門家が集まる場所。質問、回答、学習を通じて業界全体のレベルアップを目指します。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/forum"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            フォーラムを見る
          </Link>
          <Link
            href="/auth/signup"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </section>

      {/* 機能紹介 */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">主な機能</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* カテゴリ一覧 */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">人気のカテゴリ</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/forum?category=${encodeURIComponent(category.name)}`}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                  {category.count}件
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 統計情報 */}
      <section className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center mb-8">プラットフォーム統計</h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">1,250+</div>
            <div className="text-gray-600">登録ユーザー</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">3,400+</div>
            <div className="text-gray-600">質問投稿</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">8,900+</div>
            <div className="text-gray-600">回答数</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
            <div className="text-gray-600">解決率</div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="bg-gray-900 text-white rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">今すぐ参加して、知識を共有しましょう</h2>
        <p className="text-xl mb-6">
          無料でアカウントを作成し、自動車修理業界のコミュニティに参加してください。
        </p>
        <Link
          href="/auth/signup"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
        >
          無料で新規登録
        </Link>
      </section>
    </div>
  );
}
