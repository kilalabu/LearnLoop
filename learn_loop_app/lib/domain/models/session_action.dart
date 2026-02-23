import 'package:freezed_annotation/freezed_annotation.dart';
part 'session_action.freezed.dart';

/// セッション判定結果
@freezed
sealed class SessionAction with _$SessionAction {
  /// 新規セッション開始
  const factory SessionAction.startNew() = SessionActionStartNew;

  /// 途中再開（remaining 問残っている）
  const factory SessionAction.resume({
    required int remaining,
  }) = SessionActionResume;

  /// セッション完了（まだ次がある or 手動解放可能）
  const factory SessionAction.sessionDone({
    required int completedSessions,
    required int availableSessions,
  }) = SessionActionDone;

  /// 全セッション完了
  const factory SessionAction.allDone({
    required int completedSessions,
  }) = SessionActionAllDone;
}
