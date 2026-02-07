import { useState, useCallback } from 'react';
import { Problem } from '../types/Problem';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

/** /api/quiz/generate のレスポンス内の個別クイズ */
interface GeneratedQuiz {
  question: string;
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

  // 問題を生成する
  // useCallback は、関数の再定義を防ぎ、子コンポーネントの不要な再レンダリングを抑えます。
  const generateProblems = useCallback(async (sourceType: 'text' | 'url', data: string, category: string, modelId?: string) => {
    // バリデーション
    if (!data || data.length === 0) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceType, data, modelId }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();
      // APIレスポンス (GeneratedQuizResponse)
      // { topic: string, quizzes: { question, options, answers, explanation }[] }

      // Problem型へ変換
      const newProblems: Problem[] = result.quizzes.map((quiz: GeneratedQuiz) => {
        return {
          id: uuidv4(),
          question: quiz.question,
          category: category || result.topic || 'General',
          explanation: quiz.explanation,
          sourceType: sourceType,
          sourceUrl: sourceType === 'url' ? data : undefined,
          options: quiz.options.map((optText: string) => ({
            id: uuidv4(),
            text: optText,
            isCorrect: quiz.answers.includes(optText),
          })),
        };
      });

      if (newProblems.length === 0) {
        toast.warning("クイズが生成されませんでした。別のテキストで試してください。");
      } else {
        setProblems(newProblems);
        toast.success(`${newProblems.length}問のクイズが生成されました！`);
      }

    } catch (error) {
      console.error('Failed to generate problems:', error);
      toast.error("問題の生成中にエラーが発生しました。");
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
    updateProblem,
    deleteProblem,
    resetProblems,
  };
};
