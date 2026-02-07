import '../../domain/repositories/user_progress_repository.dart';

/// Fakeユーザー進捗リポジトリ実装
class FakeUserProgressRepository implements UserProgressRepository {
  final int _streak = 7;
  int _correctCount = 34;
  int _totalAnswered = 40;

  @override
  Future<UserStats> getStats() async {
    await Future.delayed(const Duration(milliseconds: 100));
    return UserStats(
      streak: _streak,
      accuracy: _totalAnswered > 0 ? _correctCount / _totalAnswered : 0.0,
      totalAnswered: _totalAnswered,
    );
  }

  @override
  Future<void> recordAnswer({
    required String quizId,
    required bool isCorrect,
  }) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _totalAnswered++;
    if (isCorrect) {
      _correctCount++;
    }
  }
}
