import '../models/daily_answer_record.dart';
import '../models/daily_stats_result.dart';

/// ユーザー進捗リポジトリ インターフェース
abstract interface class UserProgressRepository {
  /// 統計情報を取得
  Future<UserStats> getStats();

  /// クイズの進捗を記録
  Future<void> recordAnswer({required String quizId, required bool isCorrect});

  /// クイズを「もう出さない」に設定
  Future<void> hideQuiz({required String quizId});

  /// 日付ごとの回答統計一覧を取得する（ページング対応）
  Future<DailyStatsResult> getDailyStats({int limit = 20, int offset = 0});
}

/// ユーザー統計情報
class UserStats {
  const UserStats({
    required this.streak,
    required this.accuracy,
    required this.totalAnswered,
  });

  final int streak;
  final double accuracy; // 0.0 ~ 1.0
  final int totalAnswered;
}
