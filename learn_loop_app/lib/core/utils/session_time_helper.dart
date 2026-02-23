import '../constants/quiz_constants.dart';

abstract final class SessionTimeHelper {
  /// 指定時刻で自動解放されるセッション数（0〜3）
  static int availableSessionsByTime(DateTime now) {
    final hour = now.hour;
    int count = 0;
    for (final h in QuizConstants.sessionUnlockHours) {
      if (hour >= h) count++;
    }
    return count;
  }

  /// 自動解放 + 手動解放の合計（上限 dailySessionCount）
  static int totalAvailableSessions(DateTime now, int unlockedExtra) {
    final byTime = availableSessionsByTime(now);
    return (byTime + unlockedExtra).clamp(0, QuizConstants.dailySessionCount);
  }
}
