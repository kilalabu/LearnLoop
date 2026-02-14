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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-bold">
              {isEditing ? "問題を編集" : "問題の詳細"}
            </DialogTitle>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            {quiz.category && (
              <Badge variant="outline">{quiz.category}</Badge>
            )}
          </div>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-5">
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

            {/* 問題文 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">問題文</Label>
              <Textarea
                value={editData.question}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    question: e.target.value,
                  }))
                }
                className="min-h-[120px] bg-card"
              />
            </div>

            {/* 選択肢 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">選択肢</Label>
              <div className="space-y-2">
                {editData.options.map((opt, index) => (
                  <div
                    key={opt.id}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${opt.isCorrect
                        ? "bg-success text-success-foreground"
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
                      className="bg-card flex-1"
                    />
                    <Button
                      type="button"
                      variant={opt.isCorrect ? "default" : "outline"}
                      size="xs"
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
                      className="shrink-0"
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
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="mb-2">
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
                    value={editData.explanation}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        explanation: e.target.value,
                      }))
                    }
                    className="min-h-[160px] bg-card font-mono text-sm"
                    placeholder="Markdown 形式で入力..."
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="min-h-[160px] rounded-md border bg-card p-4 prose prose-sm max-w-none text-foreground">
                    <MarkdownPreview content={editData.explanation} />
                  </div>
                </TabsContent>
              </Tabs>
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
          <div className="space-y-5">
            {/* 問題文 */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                問題文
              </Label>
              <div className="rounded-lg bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {quiz.question}
              </div>
            </div>

            {/* 選択肢 */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                選択肢
              </Label>
              <div className="space-y-1.5">
                {quiz.options.map((opt, index) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${opt.isCorrect
                      ? "bg-success/10 border border-success/20"
                      : "bg-muted/20"
                      }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${opt.isCorrect
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={opt.isCorrect ? "font-medium" : ""}>
                      {opt.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 解説 */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                解説
              </Label>
              <div className="rounded-lg bg-muted/30 p-4 prose prose-sm max-w-none text-foreground">
                <MarkdownPreview content={quiz.explanation} />
              </div>
            </div>

            {/* 出典URL */}
            {quiz.sourceUrl && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  出典
                </Label>
                <a
                  href={quiz.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  出典を確認する
                </a>
              </div>
            )}

            {/* 統計情報 */}
            <div className="flex items-center gap-6 rounded-lg bg-muted/30 p-4 text-sm">
              <div>
                <span className="text-muted-foreground">回答数: </span>
                <span className="font-semibold">{quiz.attemptCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">正解数: </span>
                <span className="font-semibold">{quiz.correctCount}</span>
              </div>
              {quiz.nextReviewAt && (
                <div>
                  <span className="text-muted-foreground">次回出題: </span>
                  <span className="font-semibold">
                    {formatDate(quiz.nextReviewAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                キャンセル
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                保存する
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4" />
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
