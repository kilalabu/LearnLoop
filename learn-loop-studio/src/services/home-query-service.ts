import { SupabaseClient } from '@supabase/supabase-js';
import { QuizRepository } from '@/repositories/quiz-repository';
import { ProgressRepository } from '@/repositories/progress-repository';
import { UserStats } from '@/domain/progress';

export interface HomeSummary {
  count: number;
  streak: number;
  accuracy: number;
  totalAnswered: number;
}

/**
 * ホーム画面表示に必要なデータを集約して取得するサービス。
 * QuizRepository と ProgressRepository を協調させ、1回の呼び出しで
 * count と stats を並列取得して HomeSummary として返す。
 */
export class HomeQueryService {
  private quizRepo: QuizRepository;
  private progressRepo: ProgressRepository;

  constructor(supabase: SupabaseClient, userId: string) {
    this.quizRepo = new QuizRepository(supabase, userId);
    this.progressRepo = new ProgressRepository(supabase, userId);
  }

  async getSummary(): Promise<HomeSummary> {
    const [count, stats] = await Promise.all([
      this.quizRepo.getCount(),
      this.progressRepo.getStats(),
    ]);

    return {
      count,
      streak: stats.streak,
      accuracy: stats.accuracy,
      totalAnswered: stats.totalAnswered,
    };
  }
}
