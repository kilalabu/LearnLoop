"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, X, ExternalLink, Sparkles, PartyPopper, TrendingUp, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Option {
  id: string
  label: string
  text: string
  isCorrect: boolean
}

interface QuizResultScreenProps {
  currentQuestion?: number
  totalQuestions?: number
  isCorrect?: boolean
  options?: Option[]
  userAnswers?: string[]
  explanation?: string
  sourceUrl?: string
  xpEarned?: number
}

const defaultOptions: Option[] = [
  { id: "a", label: "A", text: "Dockerイメージはコンテナの実行可能なテンプレートである", isCorrect: true },
  { id: "b", label: "B", text: "Dockerコンテナは永続的なストレージを持つ", isCorrect: false },
  { id: "c", label: "C", text: "DockerfileはDockerイメージをビルドするための設定ファイルである", isCorrect: true },
  { id: "d", label: "D", text: "Dockerはハイパーバイザー型の仮想化技術を使用する", isCorrect: false },
]

const correctMessages = [
  "すばらしい!",
  "完璧!",
  "さすが!",
  "その調子!",
  "天才的!",
]

const incorrectMessages = [
  "惜しい!",
  "次は大丈夫!",
  "学びのチャンス!",
  "諦めないで!",
]

function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = (current / total) * 100

  return (
    <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden shadow-inner">
      <div 
        className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-accent"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function ResultBanner({ isCorrect, message }: { isCorrect: boolean; message: string }) {
  const [scale, setScale] = useState(0.8)

  useEffect(() => {
    const timer = setTimeout(() => setScale(1), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-6 px-6 rounded-3xl transition-transform duration-500",
        isCorrect 
          ? "bg-gradient-to-br from-success/20 to-xp/20" 
          : "bg-gradient-to-br from-error/20 to-accent/20"
      )}
      style={{ transform: `scale(${scale})` }}
    >
      <div className={cn(
        "flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg",
        isCorrect 
          ? "bg-gradient-to-br from-success to-xp" 
          : "bg-gradient-to-br from-error to-accent"
      )}>
        {isCorrect 
          ? <PartyPopper className="w-8 h-8 text-success-foreground" />
          : <TrendingUp className="w-8 h-8 text-error-foreground" />
        }
      </div>
      <span className={cn(
        "text-2xl font-bold",
        isCorrect ? "text-success" : "text-error"
      )}>
        {message}
      </span>
      {isCorrect && (
        <div className="flex items-center gap-2 bg-xp/20 px-4 py-1.5 rounded-full">
          <Zap className="w-4 h-4 text-xp" />
          <span className="text-sm font-bold text-xp">+10 XP</span>
        </div>
      )}
    </div>
  )
}

function OptionResult({ 
  option, 
  wasSelected,
  index
}: { 
  option: Option
  wasSelected: boolean
  index: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const showSuccess = option.isCorrect
  const showError = wasSelected && !option.isCorrect

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300 + index * 100)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div className={cn(
      "w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all duration-500",
      showSuccess && "border-success bg-success/10 shadow-lg shadow-success/10",
      showError && "border-error bg-error/10 shadow-lg shadow-error/10",
      !showSuccess && !showError && "border-border bg-card/50 opacity-50",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}
    style={{ transitionDelay: isVisible ? "0ms" : `${index * 100}ms` }}
    >
      <div className={cn(
        "flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all",
        showSuccess && "bg-gradient-to-br from-success to-xp",
        showError && "bg-gradient-to-br from-error to-accent",
        !showSuccess && !showError && "border-2 border-muted-foreground/40"
      )}>
        {showSuccess && <Check className="w-4 h-4 text-success-foreground" />}
        {showError && <X className="w-4 h-4 text-error-foreground" />}
      </div>
      <div className="flex-1 text-left">
        <span className={cn(
          "font-bold text-lg mr-2",
          showSuccess && "text-success",
          showError && "text-error",
          !showSuccess && !showError && "text-muted-foreground"
        )}>
          {option.label}.
        </span>
        <span className={cn(
          showSuccess && "text-foreground",
          showError && "text-foreground",
          !showSuccess && !showError && "text-muted-foreground"
        )}>
          {option.text}
        </span>
        {showSuccess && wasSelected && (
          <span className="ml-2 text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-medium">
            選択済み
          </span>
        )}
      </div>
    </div>
  )
}

export function QuizResultScreen({
  currentQuestion = 3,
  totalQuestions = 10,
  isCorrect = false,
  options = defaultOptions,
  userAnswers = ["a", "b"],
  explanation = "Dockerイメージはコンテナを実行するための読み取り専用のテンプレートです。イメージにはアプリケーションのコード、ランタイム、ライブラリ、環境変数、設定ファイルが含まれています。\n\nDockerfileはイメージをビルドするための設定ファイルで、ベースイメージの指定、必要なパッケージのインストール、ファイルのコピーなどを定義します。\n\nDockerコンテナは基本的にエフェメラル（一時的）であり、コンテナが削除されるとデータも失われます。永続化にはボリュームを使用します。\n\nDockerはコンテナ型の仮想化技術であり、ホストOSのカーネルを共有します。ハイパーバイザー型とは異なります。",
  sourceUrl = "https://docs.docker.com/get-started/",
  xpEarned = 10
}: QuizResultScreenProps) {
  const message = isCorrect 
    ? correctMessages[Math.floor(Math.random() * correctMessages.length)]
    : incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <Link href="/quiz">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground -ml-2 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">戻る</span>
            </Button>
          </Link>
          <span className="text-sm font-bold text-foreground bg-secondary/50 px-4 py-1.5 rounded-full">
            {currentQuestion} / {totalQuestions}
          </span>
          <div className="w-9" />
        </div>
        <ProgressBar current={currentQuestion} total={totalQuestions} />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-4 flex flex-col overflow-y-auto">
        {/* Result Banner */}
        <ResultBanner isCorrect={isCorrect} message={message} />

        {/* Answer Review */}
        <div className="flex flex-col gap-3 mt-6">
          {options.map((option, index) => (
            <OptionResult
              key={option.id}
              option={option}
              wasSelected={userAnswers.includes(option.id)}
              index={index}
            />
          ))}
        </div>

        {/* Explanation */}
        <Card className="border-0 bg-card shadow-xl mt-6 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              解説
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {explanation}
            </p>
            {sourceUrl && (
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 mt-4 font-medium bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
              >
                ソースを見る
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </CardContent>
        </Card>

        {/* Next Button */}
        <div className="mt-6 pb-4">
          <Link href="/quiz">
            <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <Zap className="w-5 h-5 mr-2" />
              次の問題へ
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
