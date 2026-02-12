"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { QuizTable } from "@/features/quiz-list/components/QuizTable";
import { QuizDetailDialog } from "@/features/quiz-list/components/QuizDetailDialog";
import { QuizListFilters } from "@/features/quiz-list/components/QuizListFilters";
import { Pagination } from "@/features/quiz-list/components/Pagination";
import { useQuizList } from "@/features/quiz-list/hooks/useQuizList";
import type { QuizListItem } from "@/domain/quiz";

export default function QuizzesPage() {
  const {
    items,
    total,
    totalPages,
    categories,
    isLoading,
    filters,
    fetchQuizzes,
    fetchCategories,
    updateFilters,
    updateQuiz,
    deleteQuiz,
  } = useQuizList();

  const [selectedQuiz, setSelectedQuiz] = useState<QuizListItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 初回ロード
  useEffect(() => {
    fetchQuizzes(filters);
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRowClick = useCallback((quiz: QuizListItem) => {
    setSelectedQuiz(quiz);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((quiz: QuizListItem) => {
    setSelectedQuiz(quiz);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    async (
      id: string,
      data: Partial<{
        question: string;
        options: { id: string; text: string; isCorrect: boolean }[];
        explanation: string;
        category: string;
        sourceUrl: string;
      }>
    ) => {
      try {
        await updateQuiz(id, data);
        // selectedQuiz も更新
        setSelectedQuiz((prev) => (prev ? { ...prev, ...data } : prev));
        toast.success("問題を更新しました。", { position: "top-center" });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "更新に失敗しました。",
          { position: "top-center" }
        );
        throw error;
      }
    },
    [updateQuiz]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteQuiz(id);
        toast.success("問題を削除しました。", { position: "top-center" });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "削除に失敗しました。",
          { position: "top-center" }
        );
      }
    },
    [deleteQuiz]
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-balance">問題一覧</h1>
              <p className="text-sm text-muted-foreground">
                {total} 件の問題を管理
              </p>
            </div>
          </div>
          <Button asChild className="gap-1.5">
            <a href="/">
              <Plus className="w-4 h-4" />
              新規作成
            </a>
          </Button>
        </div>

        {/* フィルタ */}
        <div className="mb-4">
          <QuizListFilters
            filters={filters}
            categories={categories}
            onFilterChange={updateFilters}
          />
        </div>

        {/* テーブル */}
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <QuizTable
              items={items}
              isLoading={isLoading}
              onRowClick={handleRowClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        {/* ページネーション */}
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          total={total}
          onPageChange={(page) => updateFilters({ page })}
        />
      </main>

      {/* 詳細/編集ダイアログ */}
      <QuizDetailDialog
        quiz={selectedQuiz}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />

      <Toaster richColors />
    </div>
  );
}
