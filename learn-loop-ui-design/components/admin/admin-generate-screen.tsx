"use client"

import { useState } from "react"
import { ArrowLeft, Sparkles, Loader2, Lightbulb, Wand2, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const genres = [
  { value: "docker", label: "Docker", icon: "🐳" },
  { value: "kubernetes", label: "Kubernetes", icon: "☸️" },
  { value: "database", label: "Database", icon: "🗄️" },
  { value: "networking", label: "Networking", icon: "🌐" },
  { value: "security", label: "Security", icon: "🔐" },
  { value: "cloud", label: "Cloud", icon: "☁️" },
  { value: "other", label: "その他", icon: "📚" },
]

const MAX_CHARS = 5000

export function AdminGenerateScreen() {
  const router = useRouter()
  const [genre, setGenre] = useState<string>("")
  const [sourceText, setSourceText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const charCount = sourceText.length
  const isValidLength = charCount > 0 && charCount <= MAX_CHARS
  const canGenerate = genre && isValidLength && !isGenerating
  const charProgress = Math.min((charCount / MAX_CHARS) * 100, 100)

  const handleGenerate = async () => {
    if (!canGenerate) return
    
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    
    router.push("/admin/preview")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground -ml-2 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">戻る</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">問題を生成</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-4 flex flex-col">
        {/* Genre Select */}
        <div className="mb-6">
          <Label htmlFor="genre" className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center text-xs">1</span>
            カテゴリを選択
          </Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger id="genre" className="w-full h-14 bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-colors text-base">
              <SelectValue placeholder="カテゴリを選択..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {genres.map((g) => (
                <SelectItem key={g.value} value={g.value} className="py-3 rounded-lg">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{g.icon}</span>
                    <span>{g.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Text */}
        <div className="flex-1 flex flex-col mb-6">
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="source" className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center text-xs">2</span>
              ソーステキスト
            </Label>
          </div>
          <div className="relative flex-1">
            <Textarea
              id="source"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="学習したい内容をペースト..."
              className="flex-1 min-h-[200px] h-full resize-none bg-card text-base leading-relaxed rounded-2xl border-2 border-border hover:border-primary/50 focus:border-primary transition-colors p-4"
            />
          </div>
          {/* Character counter */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">
                {charCount > 0 && charCount < 200 && "もう少し追加するといい問題が作れます"}
                {charCount >= 200 && charCount <= 2000 && "いい感じの長さです!"}
                {charCount > 2000 && charCount <= MAX_CHARS && "十分な量のテキストです"}
                {charCount > MAX_CHARS && "テキストが長すぎます"}
              </span>
              <span className={cn(
                "text-xs font-bold transition-colors",
                charCount > MAX_CHARS ? "text-error" : "text-muted-foreground"
              )}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  charCount > MAX_CHARS 
                    ? "bg-error" 
                    : charCount >= 200 
                      ? "bg-gradient-to-r from-success to-xp" 
                      : "bg-primary/50"
                )}
                style={{ width: `${charProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          className={cn(
            "w-full h-14 text-lg font-bold rounded-2xl mb-6 transition-all duration-300",
            canGenerate 
              ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              : "bg-muted text-muted-foreground"
          )}
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AIが問題を生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              AIで問題を生成
            </>
          )}
        </Button>

        {/* Tips Card */}
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-accent" />
          <CardContent className="flex items-start gap-4 py-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shrink-0">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground font-bold mb-1">ヒント</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                200〜2000文字程度のテキストが最適です。技術ドキュメントやブログ記事などをペーストしてください。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground">
          <Rocket className="w-4 h-4" />
          <span className="text-xs">Powered by AI</span>
        </div>
      </main>
    </div>
  )
}
