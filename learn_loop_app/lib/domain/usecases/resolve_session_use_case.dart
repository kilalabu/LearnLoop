import 'package:learn_loop_app/core/constants/quiz_constants.dart';
import 'package:learn_loop_app/domain/repositories/user_progress_repository.dart';
import 'package:learn_loop_app/domain/models/session_action.dart';

class ResolveSessionUseCase {
  final UserProgressRepository _progressRepo;

  const ResolveSessionUseCase(this._progressRepo);

  /// 現在のセッション状態を評価し、次に取るべきアクションを返す。
  ///
  /// アプリ起動時・セッション完了後など、クイズ画面の状態を
  /// 決定するすべての場面で呼び出される。
  ///
  /// ## 判定フロー
  ///
  /// 1. DB から今日の回答数を取得（日付チェックは DB 側の JST 基準クエリが担う）
  /// 2. **回答なし**: まだ1問も回答していない場合は新規セッション開始。
  /// 3. **全セッション完了**: [QuizConstants.dailySessionCount]（=3）セッション完了済みなら
  ///    終了画面を表示する [SessionAction.allDone] を返す。
  /// 4. **セッション境界（12問ちょうど）**: セッション完了直後は即新規開始。
  /// 5. **途中再開**: 現在のセッション内に残り問題がある場合、その問題数で再開する。
  Future<SessionAction> call() async {
    final answeredCount = await _progressRepo.getTodayAnsweredCount();

    // 今日まだ1問も回答していない → 新規セッション開始
    if (answeredCount == 0) return const SessionAction.startNew();

    final completedSessions = answeredCount ~/ QuizConstants.dailyLimit;
    final inSessionProgress = answeredCount % QuizConstants.dailyLimit;

    // 全セッション完了済み
    if (completedSessions >= QuizConstants.dailySessionCount) {
      return SessionAction.allDone(completedSessions: completedSessions);
    }

    // セッション境界（12問ちょうど） → 解放ロックなしで即新規開始
    if (inSessionProgress == 0) return const SessionAction.startNew();

    // セッション途中 → 途中再開
    final remaining = QuizConstants.dailyLimit - inSessionProgress;
    return SessionAction.resume(remaining: remaining);
  }
}
