"use client";

import { useState, useCallback } from "react";
import type {
  QuizListItem,
  QuizListResponse,
  QuizListFilters,
} from "@/domain/quiz";

const LIMIT = 30;

/**
 * クイズ一覧の状態管理とAPI操作を行うカスタムフック。
 * 
 * [Flutter/Compose Comparison]
 * - useState ↔ mutableStateOf / remember
 * - useCallback ↔ rememberUpdatedState (依存配列の再計算制御)
 * - このフック全体 ↔ ViewModel (MVVM) または State Holder
 */
export function useQuizList() {
  // [Compose Comparison]: remember { mutableStateOf([]) } に相当
  const [items, setItems] = useState<QuizListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フィルタ状態
  const [filters, setFilters] = useState<QuizListFilters>({
    category: null,
    status: null,
    sort: "created_at",
    order: "desc",
    page: 1,
  });

  /**
   * クイズ一覧を取得する。
   * [Flutter] Future<void> fetchQuizzes() async { ... } に相当。
   */
  const fetchQuizzes = useCallback(
    async (overrideFilters?: Partial<QuizListFilters>) => {
      setIsLoading(true);
      setError(null);

      const currentFilters = { ...filters, ...overrideFilters };

      try {
        const params = new URLSearchParams();
        params.set("limit", String(LIMIT));
        params.set("offset", String((currentFilters.page - 1) * LIMIT));
        params.set("sort", currentFilters.sort);
        params.set("order", currentFilters.order);
        if (currentFilters.category) {
          params.set("category", currentFilters.category);
        }
        if (currentFilters.status) {
          params.set("status", currentFilters.status);
        }

        const res = await fetch(`/api/quiz/list?${params.toString()}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "取得に失敗しました");
        }

        const data: QuizListResponse = await res.json();
        setItems(data.items);
        setTotal(data.total);
        setCategories(data.categories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "不明なエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  /**
   * フィルタを更新し、再取得を行う。
   */
  const updateFilters = useCallback(
    (newFilters: Partial<QuizListFilters>) => {
      const updated = { ...filters, ...newFilters };
      // フィルタが変更されたらページを1に戻す（ページ変更自体でない場合）
      if (newFilters.page === undefined) {
        updated.page = 1;
      }
      setFilters(updated);
      fetchQuizzes(updated);
    },
    [filters, fetchQuizzes]
  );

  /**
   * クイズ内容を更新（API経由）し、ローカル状態に反映する。
   */
  const updateQuiz = useCallback(
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
      const res = await fetch(`/api/quiz/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "更新に失敗しました");
      }

      // 成功したらローカルのリスト状態を更新（リロードせず即時反映）
      // [Flutter] state = [for (var item in state) if (item.id == id) item.copyWith(...) else item]; に相当
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );

      return res.json();
    },
    []
  );

  /**
   * クイズを削除（API経由）し、ローカル状態から取り除く。
   */
  const deleteQuiz = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/quiz/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "削除に失敗しました");
      }

      // ローカル状態から即座に削除
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);

      return res.json();
    },
    []
  );

  const totalPages = Math.ceil(total / LIMIT);

  return {
    items,
    total,
    totalPages,
    categories,
    isLoading,
    error,
    filters,
    fetchQuizzes,
    updateFilters,
    updateQuiz,
    deleteQuiz,
  };
}
