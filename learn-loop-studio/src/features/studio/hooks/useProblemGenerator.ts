import { useState, useCallback } from 'react';
import { Problem } from '../types/Problem';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

/** /api/quiz/generate のレスポンス内の個別クイズ */
interface GeneratedQuiz {
  question: string;
  category: string;
  options: string[];
  answers: string[];
  explanation: string;
}

/**
 * [Web Context]: カスタムフック (Custom Hook)
 * ロジックをコンポーネントから分離し、再利用可能にするための仕組みです。
 * [Flutter/Compose Comparison]:
 * Flutter の ViewModel や ChangeNotifier、Compose の ViewModel に近い役割を持ちます。
 */
export const useProblemGenerator = () => {
  // [Compose Comparison]: remember { mutableStateOf<Problem[]>([]) } に相当
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 問題を生成する（即時生成）
  const generateProblems = useCallback(async (
    sourceType: 'text' | 'url' | 'import',
    data: string,
    modelId?: string,
    maxQuestions?: 'default' | 'unlimited' | number
  ) => {
    if (!data || data.length === 0) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceType, data, modelId, maxQuestions }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const result = await response.json();
      const newProblems: Problem[] = result.quizzes.map((quiz: GeneratedQuiz) => ({
        id: uuidv4(),
        question: quiz.question,
        category: quiz.category || result.category || result.topic || 'Others',
        explanation: quiz.explanation,
        sourceType: sourceType,
        sourceUrl: sourceType === 'url' ? data : undefined,
        options: quiz.options.map((optText: string) => ({
          id: uuidv4(),
          text: optText,
          isCorrect: quiz.answers.includes(optText),
        })),
      }));

      if (newProblems.length === 0) {
        toast.warning("クイズが生成されませんでした。別のテキストで試してください。");
      } else {
        setProblems(newProblems);
        const actionLabel = sourceType === 'import' ? '取り込まれ' : '生成され';
        toast.success(`${newProblems.length}問のクイズが${actionLabel}ました！`);
      }
    } catch (error) {
      console.error('Failed to generate problems:', error);
      toast.error("問題の生成中にエラーが発生しました。");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Batch 予約を登録する
  // ユーザーが選択した複数のファイルをサーバーに送信し、DB に pending 状態で保存する
  const registerBatch = useCallback(async (files: { name: string; content: string }[]) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/quiz/register-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const result = await response.json();
      // 完了まで時間がかかるため、翌日に反映される旨を明示的に伝える
      toast.success(`${result.count} 件のクイズ生成予約を登録しました。翌日に反映されます。`);
    } catch (error) {
      console.error('Failed to register batch:', error);
      toast.error("予約の登録中にエラーが発生しました。");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 特定の問題を更新する（インライン編集用）
  const updateProblem = useCallback((updatedProblem: Problem) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === updatedProblem.id ? updatedProblem : p))
    );
  }, []);

  // 特定の問題を削除する
  const deleteProblem = useCallback((id: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // 状態をリセットして最初に戻る
  const resetProblems = useCallback(() => {
    setProblems([]);
  }, []);

  return {
    problems,
    isGenerating,
    generateProblems,
    registerBatch,
    updateProblem,
    deleteProblem,
    resetProblems,
  };
};
