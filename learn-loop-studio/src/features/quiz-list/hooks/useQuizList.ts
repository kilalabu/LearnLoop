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
   * カテゴリ一覧のみを取得する（初期化時などに呼び出す）
   */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/quiz/categories");
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  /**
   * クイズ一覧を取得する。
   * 引数なしで呼ばれた場合は現在の state (filters) を使用する。
   * 
   * [Flutter] Future<void> fetchQuizzes() async { ... } に相当。
   */
  const fetchQuizzes = useCallback(
    async (targetFilters: QuizListFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("limit", String(LIMIT));
        params.set("offset", String((targetFilters.page - 1) * LIMIT));
        params.set("sort", targetFilters.sort);
        params.set("order", targetFilters.order);
        if (targetFilters.category) {
          params.set("category", targetFilters.category);
        }
        if (targetFilters.status) {
          params.set("status", targetFilters.status);
        }

        const res = await fetch(`/api/quiz/list?${params.toString()}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "取得に失敗しました");
        }

        const data: QuizListResponse = await res.json();
        setItems(data.items);
        setTotal(data.total);
        // 注: API側でも categories は空で返るように最適化したので、
        // ここでは setCategories(data.categories) は行わない。
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "不明なエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [] // filters に依存させないことで、循環参照を回避
  );

  /**
   * フィルタを更新し、再取得を行う。
   */
  const updateFilters = useCallback(
    (newFilters: Partial<QuizListFilters>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        // フィルタが明示的にページ指定でない限り、ページを1に戻す
        if (newFilters.page === undefined) {
          updated.page = 1;
        }
        // 更新後のフィルタで即座に取得
        fetchQuizzes(updated);
        return updated;
      });
    },
    [fetchQuizzes]
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
    fetchCategories,
    updateFilters,
    updateQuiz,
    deleteQuiz,
  };
}
