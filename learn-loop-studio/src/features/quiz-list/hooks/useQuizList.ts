"use client";

import { useState, useCallback } from "react";
import type {
  QuizListItem,
  QuizListResponse,
  QuizListFilters,
} from "../types";

const LIMIT = 30;

export function useQuizList() {
  const [items, setItems] = useState<QuizListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<QuizListFilters>({
    category: null,
    status: null,
    sort: "created_at",
    order: "desc",
    page: 1,
  });

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

  const updateFilters = useCallback(
    (newFilters: Partial<QuizListFilters>) => {
      const updated = { ...filters, ...newFilters };
      // フィルタが変更されたらページを1に戻す（ページ変更以外）
      if (newFilters.page === undefined) {
        updated.page = 1;
      }
      setFilters(updated);
      fetchQuizzes(updated);
    },
    [filters, fetchQuizzes]
  );

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

      // ローカル状態を更新
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );

      return res.json();
    },
    []
  );

  const deleteQuiz = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/quiz/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "削除に失敗しました");
      }

      // ローカル状態から削除
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
