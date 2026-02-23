import '../repositories/quiz_session_repository.dart';
import '../models/session_action.dart';
import '../../core/constants/quiz_constants.dart';
import '../../core/utils/session_time_helper.dart';

class ResolveSessionUseCase {
  final QuizSessionRepository _sessionRepo;

  const ResolveSessionUseCase(this._sessionRepo);

  /// 現在のセッション状態を評価し、次に取るべきアクションを返す。
  ///
  /// アプリ起動時・セッション完了後・手動解放後など、クイズ画面の状態を
  /// 決定するすべての場面で呼び出される。
  ///
  /// [now] はテスト時に時刻を注入するために引数化している。
  /// 省略すると [DateTime.now()] を使用する。
  ///
  /// ## 判定フロー
  ///
  /// 1. **日付チェック**: 保存済みセッションが前日以前のものなら全データをクリアして新規扱い。
  /// 2. **セッションなし**: 当日のデータが存在しない場合も新規扱い。
  /// 3. **全セッション完了**: [QuizConstants.dailySessionCount]（=3）セッション完了済みなら
  ///    終了画面を表示する [SessionAction.allDone] を返す。
  /// 4. **途中再開**: 現在のセッション内に残り問題がある場合、その問題数で再開する。
  /// 5. **セッション完了直後**: 残り問題がゼロで全完了でもない場合。
  ///    - [availableSessions] > [completedSessions] なら次のセッションを即開始できる。
  ///    - [availableSessions] == [completedSessions] なら時間帯解放待ち（または手動解放が必要）。
  ///    どちらの場合も [SessionAction.sessionDone] を返し、UI 側で分岐する。
  ///
  /// ## セッション解放ルール
  ///
  /// 1日3セッション制。各セッションは以下の時刻に自動解放される：
  /// - 朝セッション: 6:00〜
  /// - 昼セッション: 12:00〜
  /// - 晩セッション: 18:00〜
  ///
  /// ユーザーが手動で次のセッションを先取り解放することも可能（[unlockedExtraSessions]）。
  Future<SessionAction> call({DateTime? now}) async {
    final currentTime = now ?? DateTime.now();
    final progress = await _sessionRepo.getSessionProgress();

    // 前日以前のデータが残っている場合はクリアして新規扱いにする。
    // 日付をまたいだ後も SharedPreferences にデータが残るため、
    // sessionDateMs（その日の深夜0時 ms）と今日の深夜0時を比較して判定する。
    if (progress != null) {
      final todayMs = DateTime(
        currentTime.year, currentTime.month, currentTime.day,
      ).millisecondsSinceEpoch;
      if (progress.sessionDateMs < todayMs) {
        await _sessionRepo.clearSession();
        return const SessionAction.startNew();
      }
    }

    // 当日のセッションデータが存在しない場合は新規開始。
    if (progress == null) {
      return const SessionAction.startNew();
    }

    final completed = progress.completedSessions;
    final available = SessionTimeHelper.totalAvailableSessions(
      currentTime, progress.unlockedExtraSessions,
    );

    // 全セッション（dailySessionCount = 3）完了済みなら終了画面へ。
    if (completed >= QuizConstants.dailySessionCount) {
      return SessionAction.allDone(completedSessions: completed);
    }

    // 現在のセッション内に残り問題がある場合は途中再開。
    if (progress.remaining > 0) {
      return SessionAction.resume(remaining: progress.remaining);
    }

    // remaining == 0 かつ全完了でない = セッション完了直後。
    // availableSessions と completedSessions の大小関係は UI 側で判定する。
    return SessionAction.sessionDone(
      completedSessions: completed,
      availableSessions: available,
    );
  }
}
