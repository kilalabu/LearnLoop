"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pencil, ExternalLink, Eye, FileText, Loader2 } from "lucide-react";
import type { QuizListItem } from "@/domain/quiz";
import { QUIZ_CATEGORIES } from "@/domain/quiz-constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface QuizDetailDialogProps {
  quiz: QuizListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    id: string,
    data: Partial<{
      question: string;
      options: { id: string; text: string; isCorrect: boolean }[];
      explanation: string;
      category: string;
      sourceUrl: string;
    }>
  ) => Promise<void>;
}

export function QuizDetailDialog({
  quiz,
  open,
  onOpenChange,
  onSave,
}: QuizDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    question: "",
    explanation: "",
    category: "",
    sourceUrl: "",
    options: [] as { id: string; text: string; isCorrect: boolean }[],
  });

  // quizが変更されたらeditDataを初期化
  useEffect(() => {
    if (quiz) {
      setEditData({
        question: quiz.question,
        explanation: quiz.explanation,
        category: quiz.category,
        sourceUrl: quiz.sourceUrl || "",
        options: quiz.options.map((opt) => ({ ...opt })),
      });
      setIsEditing(false);
    }
  }, [quiz]);

  if (!quiz) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(quiz.id, editData);
      setIsEditing(false);
    } catch {
      // エラーは親コンポーネント側で処理
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      question: quiz.question,
      explanation: quiz.explanation,
      category: quiz.category,
      sourceUrl: quiz.sourceUrl || "",
      options: quiz.options.map((opt) => ({ ...opt })),
    });
    setIsEditing(false);
  };

  const statusLabel =
    quiz.learningStatus === "unanswered"
      ? "未回答"
      : quiz.learningStatus === "learning"
        ? "学習中"
        : "二度と出題しない";

  const statusVariant =
    quiz.learningStatus === "unanswered"
      ? "secondary"
      : quiz.learningStatus === "learning"
        ? "default"
        : "outline";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl font-bold">
              {isEditing ? "問題を編集" : "問題の詳細"}
            </DialogTitle>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            {quiz.category && (
              <Badge variant="outline">{quiz.category}</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {isEditing ? (
            <div className="space-y-6">
              {/* カテゴリ */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">カテゴリ</Label>
                <Select
                  value={editData.category}
                  onValueChange={(value) =>
                    setEditData((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                >
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="カテゴリを選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 現在の値がリストにない場合に表示（過去データ互換性のため） */}
                    {editData.category && !QUIZ_CATEGORIES.includes(editData.category as any) && (
                      <SelectItem value={editData.category}>
                        {editData.category} (現在の値)
                      </SelectItem>
                    )}
                    {QUIZ_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">問題文</Label>
                <Tabs defaultValue="edit" className="w-full flex flex-col">
                  <TabsList className="mb-2 w-fit">
                    <TabsTrigger value="edit">
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      編集
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      プレビュー
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit">
                    <Textarea
                      value={editData.question}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          question: e.target.value,
                        }))
                      }
                      className="min-h-[140px] bg-card text-lg leading-relaxed"
                      placeholder="問題文を入力してください（Markdown可）..."
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="min-h-[140px] rounded-md border bg-card p-6 prose prose-base max-w-none text-foreground overflow-y-auto">
                      <MarkdownPreview content={editData.question} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 選択肢 */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">選択肢</Label>
                  <div className="space-y-3">
                    {editData.options.map((opt, index) => (
                      <div
                        key={opt.id}
                        className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-transparent hover:border-primary/20 transition-all"
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0 ${opt.isCorrect
                            ? "bg-success text-slate-950"
                            : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <Input
                          value={opt.text}
                          onChange={(e) => {
                            const newOptions = [...editData.options];
                            newOptions[index] = {
                              ...newOptions[index],
                              text: e.target.value,
                            };
                            setEditData((prev) => ({
                              ...prev,
                              options: newOptions,
                            }));
                          }}
                          className="bg-card flex-1 border-none focus-visible:ring-1"
                        />
                        <Button
                          type="button"
                          variant={opt.isCorrect ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const newOptions = editData.options.map((o, i) => ({
                              ...o,
                              isCorrect: i === index,
                            }));
                            setEditData((prev) => ({
                              ...prev,
                              options: newOptions,
                            }));
                          }}
                          className="shrink-0 rounded-lg"
                        >
                          {opt.isCorrect ? "正解" : "不正解"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 解説（タブでプレビュー切替） */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">解説</Label>
                  <Tabs defaultValue="edit" className="w-full flex flex-col h-full">
                    <TabsList className="mb-2 w-fit">
                      <TabsTrigger value="edit">
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        編集
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        プレビュー
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="flex-1">
                      <Textarea
                        value={editData.explanation}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            explanation: e.target.value,
                          }))
                        }
                        className="min-h-[300px] h-full bg-card font-mono text-sm leading-relaxed"
                        placeholder="Markdown 形式で入力..."
                      />
                    </TabsContent>
                    <TabsContent value="preview" className="flex-1">
                      <div className="min-h-[300px] h-full rounded-md border bg-card p-4 prose prose-sm max-w-none text-foreground overflow-y-auto">
                        <MarkdownPreview content={editData.explanation} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* 出典URL */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">出典 URL</Label>
                <Input
                  value={editData.sourceUrl}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      sourceUrl: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="bg-card"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 問題文 */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                  問題文
                </Label>
                <div className="rounded-2xl bg-muted/30 p-6 border border-border/50">
                  <MarkdownPreview content={quiz.question} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 選択肢 */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                    選択肢
                  </Label>
                  <div className="grid gap-3">
                    {quiz.options.map((opt, index) => (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-4 rounded-xl px-4 py-3 text-base transition-all ${opt.isCorrect
                          ? "bg-success/10 border-2 border-success/30 shadow-sm"
                          : "bg-muted/20 border border-transparent"
                          }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0 ${opt.isCorrect
                            ? "bg-success text-slate-950"
                            : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className={opt.isCorrect ? "font-bold text-foreground" : "font-medium"}>
                          {opt.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 解説 */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                    解説
                  </Label>
                  <div className="rounded-2xl bg-muted/30 p-6 border border-border/50 min-h-[200px]">
                    <MarkdownPreview content={quiz.explanation} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 出典URL */}
                {quiz.sourceUrl && (
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                      出典
                    </Label>
                    <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
                      <a
                        href={quiz.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-bold hover:underline group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        出典を確認する
                      </a>
                    </div>
                  </div>
                )}

                {/* 統計情報 */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                    学習状況
                  </Label>
                  <div className="grid grid-cols-2 gap-3 h-full">
                    <div className="rounded-xl bg-muted/30 p-4 border border-border/50 flex flex-col justify-center gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">回答・正解</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black">{quiz.correctCount}</span>
                        <span className="text-xs text-muted-foreground">/ {quiz.attemptCount}</span>
                      </div>
                    </div>
                    {quiz.nextReviewAt && (
                      <div className="rounded-xl bg-muted/30 p-4 border border-border/50 flex flex-col justify-center gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">次回出題</span>
                        <span className="text-sm font-bold">{formatDate(quiz.nextReviewAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-muted/10">
          {isEditing ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none">
                キャンセル
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none font-bold shadow-lg shadow-primary/20">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                保存する
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto font-bold shadow-lg">
              <Pencil className="w-4 h-4 mr-2" />
              編集する
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Markdown プレビューコンポーネント
 * react-markdown を使用して安全かつリッチにレンダリングする。
 */
function MarkdownPreview({ content }: { content: string }) {
  if (!content) {
    return (
      <p className="text-muted-foreground italic">解説が入力されていません</p>
    );
  }

  return (
    <div className="text-sm leading-relaxed prose prose-sm max-w-none text-foreground dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Shadcn UI や Tailwind のスタイルに合わせるためのカスタマイズ
          h1: ({ ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
          h2: ({ ...props }) => <h2 className="text-lg font-semibold mt-4 mb-1" {...props} />,
          h3: ({ ...props }) => <h3 className="text-base font-semibold mt-3 mb-1" {...props} />,
          code: ({ ...props }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props} />
          ),
          pre: ({ ...props }) => (
            <pre className="bg-muted rounded-md p-3 overflow-x-auto my-2" {...props} />
          ),
          ul: ({ ...props }) => <ul className="ml-4 list-disc my-2" {...props} />,
          ol: ({ ...props }) => <ol className="ml-4 list-decimal my-2" {...props} />,
          li: ({ ...props }) => <li className="mb-1" {...props} />,
          a: ({ ...props }) => (
            <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}
