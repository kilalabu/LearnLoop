"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import type { QuizListFilters as FilterState } from "../types";

interface QuizListFiltersProps {
  filters: FilterState;
  categories: string[];
  onFilterChange: (filters: Partial<FilterState>) => void;
}

export function QuizListFilters({
  filters,
  categories,
  onFilterChange,
}: QuizListFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* ジャンルフィルタ */}
      <Select
        value={filters.category || "__all__"}
        onValueChange={(v) =>
          onFilterChange({ category: v === "__all__" ? null : v })
        }
      >
        <SelectTrigger className="w-[160px] h-9 bg-card">
          <SelectValue placeholder="ジャンル" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">すべてのジャンル</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ステータスフィルタ */}
      <Select
        value={filters.status || "__all__"}
        onValueChange={(v) =>
          onFilterChange({
            status:
              v === "__all__"
                ? null
                : (v as "unanswered" | "learning" | "hidden"),
          })
        }
      >
        <SelectTrigger className="w-[160px] h-9 bg-card">
          <SelectValue placeholder="ステータス" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">すべてのステータス</SelectItem>
          <SelectItem value="unanswered">未回答</SelectItem>
          <SelectItem value="learning">学習中</SelectItem>
          <SelectItem value="hidden">二度と出題しない</SelectItem>
        </SelectContent>
      </Select>

      {/* ソート */}
      <Select
        value={filters.sort}
        onValueChange={(v) =>
          onFilterChange({ sort: v as "created_at" | "next_review_at" })
        }
      >
        <SelectTrigger className="w-[160px] h-9 bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">作成日順</SelectItem>
          <SelectItem value="next_review_at">次回出題順</SelectItem>
        </SelectContent>
      </Select>

      {/* 昇順/降順トグル */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5"
        onClick={() =>
          onFilterChange({
            order: filters.order === "asc" ? "desc" : "asc",
          })
        }
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        {filters.order === "asc" ? "昇順" : "降順"}
      </Button>
    </div>
  );
}
