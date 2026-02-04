import { useState, useCallback } from 'react';
import { Problem } from '../types/Problem';
import { getMockProblems } from '@/lib/mocks/dummyData';
import { v4 as uuidv4 } from 'uuid';

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

  // 問題を生成する（擬似的な非同期処理）
  // useCallback は、関数の再定義を防ぎ、子コンポーネントの不要な再レンダリングを抑えます。
  const generateProblems = useCallback(async (sourceText: string, category: string) => {
    // バリデーション（200文字以下は生成しない）
    if (sourceText.length < 20) { // テスト用に一旦短くしています
      return;
    }

    setIsGenerating(true);

    try {
      // [Web Context]: 実際の API 呼び出しの代わりに setTimeout で遅延をシミュレートします
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // ダミーデータを取得
      const newProblems = getMockProblems(category);
      setProblems(newProblems);
    } catch (error) {
      console.error('Failed to generate problems:', error);
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
