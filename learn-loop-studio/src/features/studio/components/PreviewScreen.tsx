"use client";

import { Problem } from "../types/Problem";
import { ProblemCard } from "./ProblemCard";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Trash2,
  CheckCircle,
  LayoutGrid
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface PreviewScreenProps {
  problems: Problem[];
  onUpdate: (updated: Problem) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  onBack: () => void;
}

/**
 * [Web Context]: 生成された問題のリスト表示画面。
 * Framer Motion を使用して、削除やリスト表示時のアニメーションを実現します。
 */
export function PreviewScreen({
  problems,
  onUpdate,
  onDelete,
  onSave,
  onBack
}: PreviewScreenProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      {/* 画面ヘッダー */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-success" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">生成完了</h1>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mt-1">
                {problems.length} 問が見つかりました
              </p>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Button
            onClick={onSave}
            className="rounded-2xl bg-gradient-to-r from-success to-xp font-black shadow-lg shadow-success/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-8 h-12"
          >
            <Save className="h-4 w-4 mr-2" />
            保存して終了
          </Button>
        </div>
      </div>

      <main className="space-y-6">
        {/* レベルやカテゴリごとの要約などのヒント（将来的な拡張用） */}
        <div className="bg-secondary/20 rounded-3xl p-6 flex items-center justify-between border border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm">全ての問題を確認してください</p>
              <p className="text-muted-foreground text-xs">必要に応じて内容を調整できます。削除した問題は復元できません。</p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              ))}
            </div>
          </div>
        </div>

        {/* 問題リスト（Framer Motion によるアニメーション） */}
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {problems.map((problem) => (
              <motion.div
                key={problem.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                <ProblemCard
                  problem={problem}
                  onChange={onUpdate}
                  onDelete={() => onDelete(problem.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* リストが空の場合 */}
        {problems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center">
              <Trash2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">問題がありません</p>
              <p className="text-muted-foreground text-sm">生成画面に戻ってやり直してください</p>
            </div>
            <Button onClick={onBack} variant="outline" className="rounded-xl border-2">
              生成画面へ戻る
            </Button>
          </div>
        )}
      </main>

      {/* フローティングアクションボタン（モバイル・下部固定） */}
      <div className="fixed bottom-8 left-0 right-0 px-6 sm:hidden pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <Button
            onClick={onSave}
            disabled={problems.length === 0}
            className="w-full h-16 rounded-3xl bg-gradient-to-r from-success to-xp font-black text-lg shadow-2xl shadow-success/40"
          >
            <CheckCircle className="h-6 w-6 mr-2" />
            {problems.length} 問を保存
          </Button>
        </div>
      </div>

      {/* デスクトップ向けのサブ保存ボタン */}
      {problems.length > 0 && (
        <div className="hidden sm:flex justify-center pt-8">
          <Button
            onClick={onSave}
            variant="outline"
            className="rounded-2xl border-2 border-border hover:bg-secondary px-12 h-12 font-bold"
          >
            完了してトップへ戻る
          </Button>
        </div>
      )}
    </div>
  );
}
