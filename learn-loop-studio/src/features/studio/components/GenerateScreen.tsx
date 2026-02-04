"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Loader2,
  Wand2,
  ArrowLeft,
  Lightbulb,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateScreenProps {
  onGenerate: (text: string, category: string) => Promise<void>;
  isGenerating: boolean;
}

const MAX_CHARS = 5000;

/**
 * [Web Context]: 問題生成の入力画面。
 * [Compose Comparison]: Column { ... } に各入力パーツを配置するレイアウトです。
 */
export function GenerateScreen({ onGenerate, isGenerating }: GenerateScreenProps) {
  const [sourceText, setSourceText] = useState("");
  const [category, setCategory] = useState("");

  const charCount = sourceText.length;
  // 最小文字数のバリデーション (要件2.1: 200文字以下はボタン非活性)
  // 開発テスト用に一旦 20文字 に下げていますが、プロダクションでは 200 に戻す想定です。
  const isValidLength = charCount >= 20 && charCount <= MAX_CHARS;
  const canGenerate = category && isValidLength && !isGenerating;

  const handleGenerate = () => {
    if (canGenerate) {
      onGenerate(sourceText, category);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 画面ヘッダー */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <Wand2 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">問題を生成</h1>
          <p className="text-muted-foreground text-sm font-medium">AIがテキストから最適なクイズを作成します</p>
        </div>
      </div>

      <main className="grid gap-8">
        {/* カテゴリ入力セクション */}
        <section className="space-y-3">
          <Label className="text-sm font-bold flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
            カテゴリを入力
          </Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例: Docker, ネットワーク, 英語..."
            className="h-14 bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-all text-base px-6 font-medium focus-visible:ring-primary"
          />
        </section>

        {/* テキスト入力セクション */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
              ソーステキストをペースト
            </Label>
            <span className={cn(
              "text-xs font-bold font-mono transition-colors",
              charCount > MAX_CHARS ? "text-destructive" : "text-muted-foreground"
            )}>
              {charCount} / {MAX_CHARS}
            </span>
          </div>

          <div className="relative group">
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="学習したい内容のドキュメントや記事をここに貼り付けてください..."
              className="min-h-[350px] bg-card rounded-3xl border-2 border-border hover:border-primary/50 transition-all p-8 text-lg leading-relaxed resize-none focus-visible:ring-primary group-hover:shadow-xl group-hover:shadow-primary/5"
            />
            {/* プログレスバー風の装飾 */}
            <div className="absolute bottom-4 left-8 right-8 h-1.5 bg-secondary rounded-full overflow-hidden opacity-50">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  charCount > MAX_CHARS ? "bg-destructive" : "bg-primary"
                )}
                style={{ width: `${Math.min((charCount / MAX_CHARS) * 100, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-medium px-2">
            {charCount < 20 ? "※ 最低20文字以上のテキストが必要です" : "十分な情報量です。高品質な問題を生成できます。"}
          </p>
        </section>

        {/* 生成ボタン */}
        <Button
          size="lg"
          disabled={!canGenerate}
          onClick={handleGenerate}
          className={cn(
            "h-16 rounded-2xl text-xl font-bold transition-all duration-500 shadow-xl",
            canGenerate
              ? "bg-gradient-to-r from-primary via-primary to-accent hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0"
              : "bg-muted text-muted-foreground grayscale"
          )}
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>AIが思考中...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <span>問題を生成する</span>
            </div>
          )}
        </Button>

        {/* ヒントカード */}
        <Card className="border-none bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl overflow-hidden">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center shadow-inner">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-bold">Tips</p>
              <p className="text-muted-foreground leading-relaxed">
                具体的な技術ドキュメントや、自分が理解しにくい部分を詳細に貼り付けると、AIがより深い知識を問う問題を作成します。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* フッター装飾 */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground opacity-50 pt-4">
          <Rocket className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase">Powered by LearnLoop AI</span>
        </div>
      </main>
    </div>
  );
}
