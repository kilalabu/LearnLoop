import '../models/quiz_session_progress.dart';

export '../models/quiz_session_progress.dart';

/// クイズセッションリポジトリ インターフェース
///
/// SharedPreferences などのローカルストレージへのアクセスをカプセル化し、
/// ViewModel がストレージ実装に依存しないようにする。
abstract interface class QuizSessionRepository {
  /// 今日のセッション進捗を取得する。
  /// 今日のセッションが存在しない場合は null を返す。
  Future<QuizSessionProgress?> getSessionProgress();

  /// 今日の日付と残り問題数を保存する。
  Future<void> saveSession({required int remainingCount});

  /// 残り問題数を -1 デクリメントする。nextQuestion() のたびに呼ぶ。
  Future<void> decrementRemaining();

  /// セッションデータを全削除する。
  Future<void> clearSession();

  /// 完了セッション数を +1 する
  Future<void> incrementCompletedSessions();

  /// 手動解放: unlockedExtraSessions を +1 する
  Future<void> unlockNextSession();
}
