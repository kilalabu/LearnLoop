"use client";

import { useProblemGenerator } from "@/features/studio/hooks/useProblemGenerator";
import { GenerateScreen } from "@/features/studio/components/GenerateScreen";
import { PreviewScreen } from "@/features/studio/components/PreviewScreen";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

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
  } = useProblemGenerator();

  // 保存処理のシミュレーション
  const handleSave = () => {
    // 実際はここで Supabase 等の DB に保存しますが、今回はプロトタイプなので
    // トーストを表示して初期状態に戻します。
    toast.success("問題を保存しました！", {
      description: `${problems.length} 問のクイズをマイライブラリに追加しました。`,
      position: "top-center",
    });

    // 少し待ってから画面をリセット
    setTimeout(() => {
      resetProblems();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* [Flutter/Compose]: 画面遷移の代わりに、状態に応じて表示するコンポーネントを切り替えます */}
        {problems.length === 0 ? (
          <GenerateScreen
            onGenerate={generateProblems}
            isGenerating={isGenerating}
          />
        ) : (
          <PreviewScreen
            problems={problems}
            onUpdate={updateProblem}
            onDelete={deleteProblem}
            onSave={handleSave}
            onBack={resetProblems}
          />
        )}
      </div>

      {/* トースト通知用のコンポーネント */}
      <Toaster richColors />
    </div>
  );
}
