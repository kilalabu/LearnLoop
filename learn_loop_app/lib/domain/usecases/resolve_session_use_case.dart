import 'package:learn_loop_app/core/constants/quiz_constants.dart';
import 'package:learn_loop_app/core/utils/session_time_helper.dart';
import 'package:learn_loop_app/domain/repositories/quiz_session_repository.dart';
import 'package:learn_loop_app/domain/repositories/user_progress_repository.dart';
import 'package:learn_loop_app/domain/models/session_action.dart';

class ResolveSessionUseCase {
  final UserProgressRepository _progressRepo;
  final QuizSessionRepository _sessionRepo;

  const ResolveSessionUseCase(this._progressRepo, this._sessionRepo);

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
  /// 1. DB から今日の回答数を取得（日付チェックは DB 側の JST 基準クエリが担う）
  /// 2. **回答なし**: まだ1問も回答していない場合は新規セッション開始。
  /// 3. **全セッション完了**: [QuizConstants.dailySessionCount]（=3）セッション完了済みなら
  ///    終了画面を表示する [SessionAction.allDone] を返す。
  /// 4. **セッション境界（12問ちょうど）**: セッション完了直後の状態。
  /// 5. **途中再開**: 現在のセッション内に残り問題がある場合、その問題数で再開する。
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

    // 今日の回答数を DB から取得（JST 基準）
    final answeredCount = await _progressRepo.getTodayAnsweredCount();
    final unlockedExtra = await _sessionRepo.getUnlockedExtraSessions();

    // 利用可能なセッション数（時刻解放 + 手動解放）
    final available = SessionTimeHelper.totalAvailableSessions(currentTime, unlockedExtra);

    // 今日まだ1問も回答していない → 新規セッション開始
    if (answeredCount == 0) {
      return const SessionAction.startNew();
    }

    // completedSessions: 12問 = 1セッションとして計算
    final completedSessions = answeredCount ~/ QuizConstants.dailyLimit;
    // 今のセッションで何問回答したか
    final inSessionProgress = answeredCount % QuizConstants.dailyLimit;

    // 全セッション完了済み
    if (completedSessions >= QuizConstants.dailySessionCount) {
      return SessionAction.allDone(completedSessions: completedSessions);
    }

    // セッション境界（12問ちょうど）→ セッション完了直後
    if (inSessionProgress == 0) {
      return SessionAction.sessionDone(
        completedSessions: completedSessions,
        availableSessions: available,
      );
    }

    // セッション途中 → 途中再開
    final remaining = QuizConstants.dailyLimit - inSessionProgress;
    return SessionAction.resume(remaining: remaining);
  }
}
