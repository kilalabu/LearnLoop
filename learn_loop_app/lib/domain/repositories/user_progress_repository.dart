/// ユーザー進捗リポジトリ インターフェース
abstract interface class UserProgressRepository {
  /// 統計情報を取得
  Future<UserStats> getStats();

  /// クイズの進捗を記録
  Future<void> recordAnswer({required String quizId, required bool isCorrect});
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
