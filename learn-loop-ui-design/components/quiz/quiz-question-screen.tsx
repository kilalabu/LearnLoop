"use client"

import { useState, useEffect } from "react"
import { X, Check, Sparkles, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Option {
  id: string
  label: string
  text: string
}

interface QuizQuestionScreenProps {
  currentQuestion?: number
  totalQuestions?: number
  genre?: string
  question?: string
  options?: Option[]
  onSubmit?: (selectedIds: string[]) => void
}

const defaultOptions: Option[] = [
  { id: "a", label: "A", text: "Dockerイメージはコンテナの実行可能なテンプレートである" },
  { id: "b", label: "B", text: "Dockerコンテナは永続的なストレージを持つ" },
  { id: "c", label: "C", text: "DockerfileはDockerイメージをビルドするための設定ファイルである" },
  { id: "d", label: "D", text: "Dockerはハイパーバイザー型の仮想化技術を使用する" },
]

const encouragingMessages = [
  "じっくり考えよう!",
  "落ち着いて読もう!",
  "きみならできる!",
  "自信を持って!",
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

function OptionCard({ 
  option, 
  isSelected, 
  onToggle,
  index
}: { 
  option: Option
  isSelected: boolean
  onToggle: () => void
  index: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100 + index * 80)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300",
        "hover:border-primary/60 hover:bg-primary/5 hover:scale-[1.01]",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "active:scale-[0.99]",
        isSelected 
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
          : "border-border bg-card shadow-sm",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-7 h-7 rounded-lg border-2 shrink-0 transition-all duration-300",
        isSelected 
          ? "border-primary bg-gradient-to-br from-primary to-primary/80 scale-110" 
          : "border-muted-foreground/40 bg-transparent"
      )}>
        {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
      </div>
      <div className="flex-1 text-left">
        <span className={cn(
          "font-bold text-lg mr-2 transition-colors duration-300",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}>
          {option.label}.
        </span>
        <span className="text-foreground leading-relaxed">{option.text}</span>
      </div>
    </button>
  )
}

export function QuizQuestionScreen({
  currentQuestion = 3,
  totalQuestions = 10,
  genre = "Docker",
  question = "Dockerに関する以下の説明のうち、正しいものをすべて選んでください。",
  options = defaultOptions,
  onSubmit
}: QuizQuestionScreenProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [message] = useState(
    encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
  )

  const toggleOption = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = () => {
    onSubmit?.(selectedIds)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground -ml-2 rounded-xl hover:bg-error/10">
              <X className="h-5 w-5" />
              <span className="sr-only">閉じる</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2 bg-secondary/50 px-4 py-1.5 rounded-full">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {currentQuestion} / {totalQuestions}
            </span>
          </div>
          <div className="w-9" />
        </div>
        <ProgressBar current={currentQuestion} total={totalQuestions} />
        <div className="flex items-center justify-between mt-4">
          <Badge className="font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-0">
            {genre}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">{message}</span>
        </div>
      </header>

      {/* Question Area */}
      <main className="flex-1 px-5 py-4 flex flex-col">
        <Card className="border-0 bg-card shadow-xl mb-6 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground leading-relaxed pt-1">
                {question}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="flex flex-col gap-3 flex-1">
          {options.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              isSelected={selectedIds.includes(option.id)}
              onToggle={() => toggleOption(option.id)}
              index={index}
            />
          ))}
        </div>

        {/* Selection indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 mb-2">
          {options.map((option) => (
            <div 
              key={option.id}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                selectedIds.includes(option.id) 
                  ? "bg-primary scale-110" 
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-4 pb-4">
          <Link href="/quiz/result">
            <Button 
              className={cn(
                "w-full h-14 text-lg font-bold rounded-2xl transition-all duration-300",
                selectedIds.length > 0 
                  ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  : "bg-muted text-muted-foreground"
              )}
              disabled={selectedIds.length === 0}
              onClick={handleSubmit}
            >
              {selectedIds.length > 0 ? (
                <>
                  回答を確認する
                  <span className="ml-2 px-2 py-0.5 bg-primary-foreground/20 rounded-full text-sm">
                    {selectedIds.length}個選択
                  </span>
                </>
              ) : (
                "選択肢を選んでください"
              )}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
