/// クイズ関連の定数
abstract final class QuizConstants {
  /// 1日の出題上限数
  static const int dailyLimit = 12;
  /// 1日のセッション上限
  static const int dailySessionCount = 3;
  /// セッション解放時間帯（時, 0-indexed）
  static const List<int> sessionUnlockHours = [6, 12, 18];
}
