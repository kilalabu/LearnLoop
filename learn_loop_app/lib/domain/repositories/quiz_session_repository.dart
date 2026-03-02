export '../models/quiz_session_progress.dart';

/// クイズセッションリポジトリ インターフェース
///
/// DB 移行後はインメモリ管理（手動解放カウント）のみを担当する。
abstract interface class QuizSessionRepository {
  /// 手動解放したセッション数を取得する（インメモリ管理）
  Future<int> getUnlockedExtraSessions();

  /// 手動解放: unlockedExtraSessions を +1 する
  Future<void> unlockNextSession();

}
