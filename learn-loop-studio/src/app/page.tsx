"use client";

import { useState } from "react";
import { useProblemGenerator } from "@/features/studio/hooks/useProblemGenerator";
import { GenerateScreen } from "@/features/studio/components/GenerateScreen";
import { PreviewScreen } from "@/features/studio/components/PreviewScreen";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";

/**
 * [Web Context]: LearnLoop Studio のメインエントリポイント。
 * Flutter の Navigator や Compose の NavHost に相当する役割を、
 * 条件付きレンダリング（problems.length による分岐）で実現しています。
 */
export default function StudioPage() {
  const {
    problems,
    isGenerating,
    generateProblems,
    updateProblem,
    deleteProblem,
    resetProblems,
    registerBatch,
  } = useProblemGenerator();

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (problems.length === 0) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizzes: problems.map((p) => ({
            id: p.id,
            question: p.question,
            options: p.options,
            explanation: p.explanation,
            category: p.category,
            sourceType: p.sourceType,
            sourceUrl: p.sourceUrl,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存に失敗しました');
      }

      const result = await response.json();

      toast.success("問題を保存しました！", {
        description: `${result.savedIds.length} 問のクイズをマイライブラリに追加しました。`,
        position: "top-center",
      });

      setTimeout(() => {
        resetProblems();
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      toast.error("保存中にエラーが発生しました。", {
        description: error instanceof Error ? error.message : "もう一度お試しください。",
        position: "top-center",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* [Flutter/Compose]: 画面遷移の代わりに、状態に応じて表示するコンポーネントを切り替えます */}
        {problems.length === 0 ? (
          <GenerateScreen
            onGenerate={generateProblems}
            onRegisterBatch={registerBatch}
            isGenerating={isGenerating}
          />
        ) : (
          <PreviewScreen
            problems={problems}
            onUpdate={updateProblem}
            onDelete={deleteProblem}
            onSave={handleSave}
            onBack={resetProblems}
            isSaving={isSaving}
          />
        )}
      </div>

      {/* トースト通知用のコンポーネント */}
      <Toaster richColors />
    </div>
  );
}
