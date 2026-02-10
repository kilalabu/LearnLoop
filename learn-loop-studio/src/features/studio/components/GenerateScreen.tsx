"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Loader2,
  Wand2,
  Lightbulb,
  Rocket,
  Link as LinkIcon,
  FileText,
  FileUp
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MODEL_OPTIONS, DEFAULT_MODEL, type ModelId } from "@/lib/ai/models";

interface GenerateScreenProps {
  onGenerate: (
    sourceType: 'text' | 'url' | 'import',
    data: string,
    category: string,
    modelId?: string,
    maxQuestions?: 'default' | 'unlimited' | number
  ) => Promise<void>;
  isGenerating: boolean;
}

const MAX_CHARS = 20000; // API limit consideration

/**
 * [Web Context]: 問題生成の入力画面。
 * URLまたはテキスト入力からAIが問題を生成します。
 */
export function GenerateScreen({ onGenerate, isGenerating }: GenerateScreenProps) {
  const [sourceType, setSourceType] = useState<'text' | 'url' | 'import'>('text');
  const [sourceText, setSourceText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [importText, setImportText] = useState("");
  const [category, setCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL);
  const [maxQuestions, setMaxQuestions] = useState<'default' | 'unlimited' | 'custom'>('default');
  const [customQuestionCount, setCustomQuestionCount] = useState<string>("5");
  const [isDragging, setIsDragging] = useState<boolean>(false); // ドラッグ&ドロップ状態

  // バリデーション
  const isUrlValid = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('http');
    } catch {
      return false;
    }
  };

  const charCount = sourceText.length;
  const isTextValid = charCount >= 20 && charCount <= MAX_CHARS;

  const importCharCount = importText.length;
  const isImportValid = importCharCount >= 20;

  const canGenerate = category.length > 0 && !isGenerating && (
    (sourceType === 'text' && isTextValid) ||
    (sourceType === 'url' && isUrlValid(sourceUrl)) ||
    (sourceType === 'import' && isImportValid)
  );

  const handleGenerate = () => {
    if (!canGenerate) return;

    // 取り込みタブの場合は常に 'unlimited' を使用（問題数制限なし）
    // 'custom' の場合は数値に変換してAPIに渡す
    const effectiveMaxQuestions: 'default' | 'unlimited' | number =
      sourceType === 'import'
        ? 'unlimited'
        : maxQuestions === 'custom'
          ? (parseInt(customQuestionCount, 10) || 5)
          : maxQuestions;

    if (sourceType === 'text') {
      onGenerate('text', sourceText, category, selectedModel, effectiveMaxQuestions);
    } else if (sourceType === 'url') {
      onGenerate('url', sourceUrl, category, selectedModel, effectiveMaxQuestions);
    } else if (sourceType === 'import') {
      onGenerate('import', importText, category, selectedModel, effectiveMaxQuestions);
    }
  };

  // ドラッグ&ドロップでファイル読み込み
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // .md, .txt のみ受け付ける
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        setImportText(text);
      }
    };
    reader.readAsText(file);
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

        {/* ソース入力セクション (Tabs) */}
        <section className="space-y-3">
          <Label className="text-sm font-bold flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
            ソースを選択して入力
          </Label>

          <Tabs defaultValue="text" value={sourceType} onValueChange={(v) => setSourceType(v as 'text' | 'url' | 'import')} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                <FileText className="w-4 h-4 mr-2" />
                テキスト入力
              </TabsTrigger>
              <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                <LinkIcon className="w-4 h-4 mr-2" />
                URLから抽出
              </TabsTrigger>
              <TabsTrigger value="import" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                <FileUp className="w-4 h-4 mr-2" />
                取り込み
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground">学習したい内容を貼り付けてください</span>
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
                  placeholder="ドキュメントの内容をここに貼り付けてください..."
                  className="min-h-[300px] bg-card rounded-3xl border-2 border-border hover:border-primary/50 transition-all p-6 text-lg leading-relaxed resize-none focus-visible:ring-primary group-hover:shadow-xl group-hover:shadow-primary/5"
                />
              </div>
              <p className="text-xs text-muted-foreground font-medium px-2">
                {charCount < 20 ? "※ 最低20文字以上のテキストが必要です" : "十分な情報量です。"}
              </p>
            </TabsContent>

            <TabsContent value="url" className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="px-1">
                <span className="text-xs text-muted-foreground">技術ブログやドキュメントのURLを入力してください</span>
              </div>
              <Input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/article..."
                className="h-14 bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-all text-base px-6 font-medium focus-visible:ring-primary"
              />
              <p className="text-xs text-muted-foreground font-medium px-2">
                ※ 記事本文をAIが自動抽出します。ログインが必要なページは読み込めない場合があります。
              </p>
            </TabsContent>

            <TabsContent value="import" className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "space-y-3 rounded-3xl border-2 border-dashed p-4 transition-all duration-200",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-transparent"
                )}
              >
                {/* ドラッグ中のオーバーレイメッセージ */}
                {isDragging && (
                  <div className="flex items-center justify-center py-8 text-primary font-bold text-sm">
                    <FileUp className="w-5 h-5 mr-2" />
                    ファイルをドロップして読み込み
                  </div>
                )}

                <div className="px-1">
                  <span className="text-xs text-muted-foreground">マークダウン形式のクイズファイルを添付するか、内容を貼り付けてください</span>
                </div>

                {/* ファイル添付ボタン */}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => document.getElementById('import-file-input')?.click()}
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    ファイルを選択
                  </Button>
                  <input
                    id="import-file-input"
                    type="file"
                    accept=".md,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const text = ev.target?.result;
                        if (typeof text === 'string') {
                          setImportText(text);
                        }
                      };
                      reader.readAsText(file);
                      // 同じファイルを再選択できるようにリセット
                      e.target.value = '';
                    }}
                  />
                  <span className="text-xs text-muted-foreground">.md, .txt ファイルに対応</span>
                </div>

                {/* テキストエリア（コピペ or ファイル読み込み結果） */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-muted-foreground">ファイル読み込み結果を確認・編集できます</span>
                  <span className={cn(
                    "text-xs font-bold font-mono transition-colors",
                    "text-muted-foreground"
                  )}>
                    {importCharCount} 文字
                  </span>
                </div>
                <div className="relative group">
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="クイズのマークダウンをここに貼り付けてください..."
                    className="min-h-[300px] max-h-[500px] overflow-y-auto bg-card rounded-3xl border-2 border-border hover:border-primary/50 transition-all p-6 text-lg leading-relaxed resize-none focus-visible:ring-primary group-hover:shadow-xl group-hover:shadow-primary/5"
                  />
                </div>
                <p className="text-xs text-muted-foreground font-medium px-2">
                  {importCharCount < 20 ? "※ 最低20文字以上のテキストが必要です" : "取り込み可能です。"}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* AIモデル選択 */}
        <section className="space-y-3">
          <Label className="text-sm font-bold flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
            AIモデルを選択
          </Label>
          <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as ModelId)}>
            <SelectTrigger className="h-14 w-full bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-all text-base px-6 font-medium focus-visible:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODEL_OPTIONS).map(([id, { label }]) => (
                <SelectItem key={id} value={id}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* 問題数制限（取り込みタブでは非表示） */}
        {sourceType !== 'import' && (
          <section className="space-y-3">
            <Label className="text-sm font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">4</span>
              問題数の上限
            </Label>
            <div className="flex items-center gap-3">
              <Select value={maxQuestions} onValueChange={(v) => setMaxQuestions(v as 'default' | 'unlimited' | 'custom')}>
                <SelectTrigger className="h-14 w-full bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-all text-base px-6 font-medium focus-visible:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">最大10問（デフォルト）</SelectItem>
                  <SelectItem value="unlimited">制限なし</SelectItem>
                  <SelectItem value="custom">数を指定</SelectItem>
                </SelectContent>
              </Select>
              {maxQuestions === 'custom' && (
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={customQuestionCount}
                  onChange={(e) => setCustomQuestionCount(e.target.value)}
                  placeholder="問題数"
                  className="h-14 w-32 bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-all text-base px-6 font-medium focus-visible:ring-primary"
                />
              )}
            </div>
          </section>
        )}

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
              <span>{sourceType === 'import' ? '問題を取り込む' : '問題を生成する'}</span>
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
