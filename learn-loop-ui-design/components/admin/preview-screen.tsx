"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown, ChevronUp, Trash2, Check, Sparkles, Save, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Option {
  text: string
  isCorrect: boolean
}

interface GeneratedQuestion {
  id: string
  questionNumber: number
  questionText: string
  options: Option[]
  explanation: string
}

const defaultQuestions: GeneratedQuestion[] = [
  {
    id: "1",
    questionNumber: 1,
    questionText: "Dockerコンテナに関する以下の説明のうち、正しいものをすべて選んでください。",
    options: [
      { text: "コンテナはホストOSのカーネルを共有する", isCorrect: true },
      { text: "コンテナは仮想マシンより起動が遅い", isCorrect: false },
      { text: "コンテナはイメージから作成される", isCorrect: true },
      { text: "コンテナは常に永続的なデータを保持する", isCorrect: false },
    ],
    explanation: "Dockerコンテナはホストのカーネルを共有するため、仮想マシンより軽量で高速に起動できます。コンテナはイメージをベースに作成され、デフォルトではエフェメラル（一時的）なストレージを使用します。"
  },
  {
    id: "2",
    questionNumber: 2,
    questionText: "Dockerfileの命令に関して、正しいものを選んでください。",
    options: [
      { text: "FROMは必ずDockerfileの最初に記述する必要がある", isCorrect: true },
      { text: "RUNは1つのDockerfileに1つしか使用できない", isCorrect: false },
      { text: "COPYはローカルファイルをイメージにコピーする", isCorrect: true },
      { text: "ENTRYPOINTはCMDで上書きできる", isCorrect: false },
    ],
    explanation: "FROMはベースイメージを指定し、必ず最初に記述します。RUNは複数使用可能です。COPYはホストのファイルをイメージにコピーします。ENTRYPOINTは実行時に上書きできませんが、CMDはできます。"
  },
  {
    id: "3",
    questionNumber: 3,
    questionText: "Dockerネットワークについて、正しい説明を選んでください。",
    options: [
      { text: "bridgeネットワークはデフォルトのネットワークドライバーである", isCorrect: true },
      { text: "hostネットワークではコンテナがホストのネットワークを直接使用する", isCorrect: true },
      { text: "同じネットワーク上のコンテナは互いに通信できない", isCorrect: false },
      { text: "noneネットワークではコンテナに完全なネットワーク機能がある", isCorrect: false },
    ],
    explanation: "bridgeはDockerのデフォルトネットワークドライバーです。hostを使用するとコンテナはホストのネットワークスタックを直接使用します。同じネットワーク上のコンテナは相互に通信可能です。"
  },
]

function QuestionCard({ 
  question, 
  onDelete,
  index
}: { 
  question: GeneratedQuestion
  onDelete: () => void
  index: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100 + index * 100)
    return () => clearTimeout(timer)
  }, [index])

  const correctCount = question.options.filter(o => o.isCorrect).length

  return (
    <Card className={cn(
      "border-2 border-border bg-card overflow-hidden transition-all duration-500 hover:border-primary/50",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <CardContent className="py-5">
          <div className="flex items-start gap-4">
            <Badge className="shrink-0 font-bold text-base px-3 py-1 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground border-0">
              Q{question.questionNumber}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm text-foreground leading-relaxed font-medium",
                !isExpanded && "line-clamp-2"
              )}>
                {question.questionText}
              </p>
              {!isExpanded && (
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    選択肢: {question.options.length}つ
                  </span>
                  <span className="text-xs text-success bg-success/20 px-2 py-1 rounded-full font-medium">
                    正解: {correctCount}つ
                  </span>
                </div>
              )}
            </div>
            <div className={cn(
              "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
              isExpanded ? "bg-primary/20 text-primary rotate-180" : "bg-secondary text-muted-foreground"
            )}>
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </button>

      {isExpanded && (
        <div className="border-t-2 border-border">
          <CardContent className="py-5">
            {/* Options */}
            <div className="space-y-2 mb-5">
              {question.options.map((option, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl text-sm transition-all",
                    option.isCorrect 
                      ? "bg-success/10 border-2 border-success/30" 
                      : "bg-secondary/50 border-2 border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                    option.isCorrect ? "bg-success" : "bg-muted"
                  )}>
                    {option.isCorrect && <Check className="w-4 h-4 text-success-foreground" />}
                  </div>
                  <span className={cn(
                    option.isCorrect ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {option.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Explanation Preview */}
            <div className="mb-5 p-4 rounded-xl bg-primary/5 border-2 border-primary/20">
              <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                解説
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {question.explanation}
              </p>
            </div>

            {/* Delete Button */}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="w-full rounded-xl h-11"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              この問題を削除
            </Button>
          </CardContent>
        </div>
      )}
    </Card>
  )
}

export function PreviewScreen() {
  const router = useRouter()
  const [questions, setQuestions] = useState(defaultQuestions)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleDelete = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  const handleSave = () => {
    setShowSuccess(true)
    setTimeout(() => {
      router.push("/")
    }, 1500)
  }

  const handleCancel = () => {
    router.push("/admin")
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-success to-xp flex items-center justify-center shadow-xl">
            <PartyPopper className="w-10 h-10 text-success-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">保存しました!</h2>
          <p className="text-muted-foreground">{questions.length}問が追加されました</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-4 pb-4 border-b-2 border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-success to-xp flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-success-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">生成完了!</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-success font-bold">{questions.length}問</span>生成されました
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground rounded-xl hover:bg-error/10"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">閉じる</span>
          </Button>
        </div>
      </header>

      {/* Question List */}
      <main className="flex-1 px-5 py-5 overflow-y-auto">
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard 
              key={question.id} 
              question={question}
              onDelete={() => handleDelete(question.id)}
              index={index}
            />
          ))}
        </div>

        {questions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium mb-4">すべての問題が削除されました</p>
            <Button 
              variant="outline" 
              className="rounded-xl bg-transparent"
              onClick={handleCancel}
            >
              戻って再生成する
            </Button>
          </div>
        )}
      </main>

      {/* Bottom Actions */}
      {questions.length > 0 && (
        <div className="px-5 py-5 border-t-2 border-border bg-card">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl bg-transparent border-2"
              onClick={handleCancel}
            >
              キャンセル
            </Button>
            <Button 
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-success to-xp hover:from-success/90 hover:to-xp/90 shadow-lg font-bold text-success-foreground"
              onClick={handleSave}
            >
              <Save className="w-5 h-5 mr-2" />
              {questions.length}問を保存
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
