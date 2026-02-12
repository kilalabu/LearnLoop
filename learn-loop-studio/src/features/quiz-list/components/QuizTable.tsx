"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { QuizListItem } from "@/domain/quiz";

interface QuizTableProps {
  items: QuizListItem[];
  isLoading: boolean;
  onRowClick: (quiz: QuizListItem) => void;
  onEdit: (quiz: QuizListItem) => void;
  onDelete: (id: string) => Promise<void>;
}

export function QuizTable({
  items,
  isLoading,
  onRowClick,
  onEdit,
  onDelete,
}: QuizTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<QuizListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return <QuizTableSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <span className="text-2xl text-muted-foreground">?</span>
        </div>
        <h3 className="text-lg font-semibold mb-1">問題が見つかりません</h3>
        <p className="text-sm text-muted-foreground">
          フィルタ条件を変更するか、新しい問題を作成してください。
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px]">ステータス</TableHead>
            <TableHead>問題</TableHead>
            <TableHead className="w-[120px]">ジャンル</TableHead>
            <TableHead className="w-[120px]">統計</TableHead>
            <TableHead className="w-[110px]">次回予定</TableHead>
            <TableHead className="w-[80px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((quiz) => (
            <TableRow
              key={quiz.id}
              className="cursor-pointer"
              onClick={() => onRowClick(quiz)}
            >
              <TableCell>
                <StatusBadge status={quiz.learningStatus} />
              </TableCell>
              <TableCell>
                <span className="block max-w-[400px] truncate text-sm">
                  {getFirstLine(quiz.question)}
                </span>
              </TableCell>
              <TableCell>
                {quiz.category && (
                  <Badge variant="outline" className="text-xs">
                    {quiz.category}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {'回答: '}
                  {quiz.attemptCount}
                  {' / 正解: '}
                  {quiz.correctCount}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {quiz.nextReviewAt
                    ? formatDate(quiz.nextReviewAt)
                    : "-"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(quiz);
                    }}
                    aria-label="編集"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(quiz);
                    }}
                    aria-label="削除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 削除確認ダイアログ */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>問題を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。問題「
              {deleteTarget && getFirstLine(deleteTarget.question)}
              」を完全に削除します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "削除中..." : "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StatusBadge({
  status,
}: {
  status: "unanswered" | "learning" | "hidden";
}) {
  switch (status) {
    case "unanswered":
      return (
        <Badge variant="secondary" className="text-xs">
          未回答
        </Badge>
      );
    case "learning":
      return (
        <Badge variant="default" className="text-xs">
          学習中
        </Badge>
      );
    case "hidden":
      return (
        <Badge variant="outline" className="text-xs opacity-60">
          非表示
        </Badge>
      );
  }
}

function QuizTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[100px]">ステータス</TableHead>
          <TableHead>問題</TableHead>
          <TableHead className="w-[120px]">ジャンル</TableHead>
          <TableHead className="w-[120px]">統計</TableHead>
          <TableHead className="w-[110px]">次回予定</TableHead>
          <TableHead className="w-[80px] text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 8 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-14 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-64" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-12 ml-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getFirstLine(text: string): string {
  const firstLine = text.split("\n")[0];
  return firstLine.length > 80 ? firstLine.slice(0, 80) + "..." : firstLine;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}
