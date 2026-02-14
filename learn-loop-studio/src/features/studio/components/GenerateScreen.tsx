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
  FileUp,
  X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MODEL_OPTIONS, DEFAULT_MODEL, type ModelId } from "@/lib/ai/models";

interface GenerateItem {
  name: string;
  content: string;
}

interface GenerateScreenProps {
  onGenerate: (
    sourceType: 'text' | 'url' | 'import',
    data: string,
    modelId?: string,
    maxQuestions?: 'default' | 'unlimited' | number
  ) => Promise<void>;
  onRegisterBatch: (files: GenerateItem[]) => Promise<void>;
  isGenerating: boolean;
}

const MAX_CHARS = 20000;

export function GenerateScreen({ onGenerate, onRegisterBatch, isGenerating }: GenerateScreenProps) {
  const [sourceType, setSourceType] = useState<'text' | 'url' | 'import'>('text');
  const [sourceText, setSourceText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [importFiles, setImportFiles] = useState<GenerateItem[]>([]);
  const [generationMode, setGenerationMode] = useState<'immediate' | 'batch'>('batch');
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL);
  const [maxQuestions, setMaxQuestions] = useState<'default' | 'unlimited' | 'custom'>('default');
  const [customQuestionCount, setCustomQuestionCount] = useState<string>("5");
  const [isDragging, setIsDragging] = useState<boolean>(false);

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
  const isImportValid = importFiles.length > 0 && importFiles.every(f => f.content.length >= 20);

  const canGenerate = !isGenerating && (
    (sourceType === 'text' && isTextValid) ||
    (sourceType === 'url' && isUrlValid(sourceUrl)) ||
    (sourceType === 'import' && isImportValid)
  );

  const handleGenerate = () => {
    if (!canGenerate) return;

    // Batch 生成モードの場合、収集したファイル群を一括登録APIに投げて終了する
    // クイズの生成結果は翌日以降に反映される
    if (sourceType === 'import' && generationMode === 'batch') {
      onRegisterBatch(importFiles);
      return;
    }

    const effectiveMaxQuestions: 'default' | 'unlimited' | number =
      sourceType === 'import'
        ? 'unlimited' // ファイル取り込み時はファイル内のクイズをすべて抽出することを期待
        : maxQuestions === 'custom'
          ? (parseInt(customQuestionCount, 10) || 5)
          : maxQuestions;

    // 即時生成モード: API/AI SDK を使用してその場で結果を表示する
    if (sourceType === 'text') {
      onGenerate('text', sourceText, selectedModel, effectiveMaxQuestions);
    } else if (sourceType === 'url') {
      onGenerate('url', sourceUrl, selectedModel, effectiveMaxQuestions);
    } else if (sourceType === 'import') {
      // 即時取り込み時は、UX のシンプル化のため、選択されている最初のファイルのみを処理対象とする
      onGenerate('import', importFiles[0].content, selectedModel, effectiveMaxQuestions);
    }
  };

  /**
   * File オブジェクトからテキスト内容を抽出する
   */
  const readFile = (file: File): Promise<GenerateItem> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        resolve({
          name: file.name,
          content: typeof text === 'string' ? text : ''
        });
      };
      reader.readAsText(file);
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      f => f.name.endsWith('.md') || f.name.endsWith('.txt')
    );
    if (files.length === 0) return;

    const newItems = await Promise.all(files.map(readFile));
    setImportFiles(prev => [...prev, ...newItems]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        <section className="space-y-3">
          <Label className="text-sm font-bold flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
            ソースを選択して入力
          </Label>

          <Tabs defaultValue="text" value={sourceType} onValueChange={(v) => setSourceType(v as 'text' | 'url' | 'import')} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                <FileText className="w-4 h-4 mr-2" />
                テキスト
              </TabsTrigger>
              <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                <LinkIcon className="w-4 h-4 mr-2" />
                URL抽出
              </TabsTrigger>
              <TabsTrigger value="import" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                <FileUp className="w-4 h-4 mr-2" />
                取り込み
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300 outline-none">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground">学習したい内容を貼り付けてください</span>
                <span className={cn(
                  "text-xs font-bold font-mono transition-colors",
                  charCount > MAX_CHARS ? "text-destructive" : "text-muted-foreground"
                )}>
                  {charCount} / {MAX_CHARS}
                </span>
              </div>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="ドキュメントの内容をここに貼り付けてください..."
                className="min-h-[300px] bg-card rounded-3xl border-2 border-border hover:border-primary/50 transition-all p-6 text-lg leading-relaxed resize-none focus-visible:ring-primary"
              />
            </TabsContent>

            <TabsContent value="url" className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300 outline-none">
              <Input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/article..."
                className="h-14 bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-all text-base px-6 font-medium focus-visible:ring-primary"
              />
              <p className="text-xs text-muted-foreground font-medium px-2">
                ※ 記事をAIが自動抽出します。ログインが必要なページは読み込めない場合があります。
              </p>
            </TabsContent>

            <TabsContent value="import" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300 outline-none">
              <div className="bg-muted/30 p-4 rounded-2xl space-y-3 border border-border/30">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={generationMode === 'batch' ? 'default' : 'outline'}
                    onClick={() => setGenerationMode('batch')}
                    className="rounded-xl h-11 text-xs font-bold"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Batch 生成 (翌日)
                  </Button>
                  <Button
                    type="button"
                    variant={generationMode === 'immediate' ? 'default' : 'outline'}
                    onClick={() => setGenerationMode('immediate')}
                    className="rounded-xl h-11 text-xs font-bold"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    即時生成
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground px-1 leading-relaxed">
                  {generationMode === 'batch'
                    ? "複数ファイルを一括予約。OpenAI Batch API を利用して翌日までに生成完了。"
                    : "1つのファイルをその場で生成。即座に結果を確認できます。"
                  }
                </p>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                onDrop={handleDrop}
                className={cn(
                  "space-y-4 rounded-3xl border-2 border-dashed p-6 transition-all duration-200 min-h-[200px] flex flex-col justify-center",
                  isDragging ? "border-primary bg-primary/5" : "border-border/50 bg-card/30"
                )}
              >
                {importFiles.length === 0 ? (
                  <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                      <FileUp className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">ファイルをドロップ</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">または下のボタンから選択</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">選択されたファイル ({importFiles.length})</Label>
                    <div className="grid gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                      {importFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-background/80 backdrop-blur rounded-xl border border-border/50 group hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden min-w-0">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{file.content.length} 文字</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setImportFiles(prev => prev.filter((_, idx) => idx !== i))}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-2 hover:bg-primary/5 hover:border-primary/50 transition-all font-bold"
                    onClick={() => document.getElementById('import-file-input')?.click()}
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    {importFiles.length > 0 ? 'さらに追加' : 'ファイルを選択'}
                  </Button>
                  <input
                    id="import-file-input"
                    type="file"
                    accept=".md,.txt"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      const newItems = await Promise.all(files.map(readFile));
                      setImportFiles(prev => [...prev, ...newItems]);
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {!(sourceType === 'import' && generationMode === 'batch') && (
          <section className="space-y-3">
            <Label className="text-sm font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
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
        )}

        {sourceType !== 'import' && (
          <section className="space-y-3">
            <Label className="text-sm font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
              問題数の上限
            </Label>
            <div className="flex items-center gap-3">
              <Select value={maxQuestions} onValueChange={(v) => setMaxQuestions(v as 'default' | 'unlimited' | 'custom')}>
                <SelectTrigger className="h-14 w-full bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-all text-base px-6 font-medium">
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
                  className="h-14 w-32 bg-card rounded-2xl border-2 border-border hover:border-primary transition-all text-base px-6 font-medium"
                />
              )}
            </div>
          </section>
        )}

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
              <span>{sourceType === 'import' && generationMode === 'batch' ? 'リクエスト送信中...' : 'AIが思考中...'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {sourceType === 'import' && generationMode === 'batch' ? <Rocket className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
              <span>
                {sourceType === 'import'
                  ? (generationMode === 'batch' ? 'Batch 生成を予約' : '即時取り込みを実行')
                  : '問題を生成する'
                }
              </span>
            </div>
          )}
        </Button>

        <Card className="border-none bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl overflow-hidden shadow-inner">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center shadow-sm">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-bold">Tips</p>
              <p className="text-muted-foreground leading-relaxed">
                {sourceType === 'import' && generationMode === 'batch'
                  ? "Markdown ファイルをまとめてアップロードできます。翌日の朝にはクイズが完成しています。"
                  : "具体的な技術ドキュメントや、自分が理解しにくい部分を詳細に貼り付けると、AIがより深い知識を問う問題を作成します。"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
