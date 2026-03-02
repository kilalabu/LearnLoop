import 'package:freezed_annotation/freezed_annotation.dart';

part 'quiz_session_progress.freezed.dart';

/// クイズセッション進捗（1日分のセッション状態）
@freezed
abstract class QuizSessionProgress with _$QuizSessionProgress {
  const factory QuizSessionProgress({
    /// [廃止済み] DB 移行により不使用。互換のためフィールドは残す。
    @Default(0) int sessionDateMs,

    /// 残り問題数（現セッション内）
    required int remaining,

    /// 今日完了したセッション数
    @Default(0) int completedSessions,

    /// 手動で解放した追加セッション数
    @Default(0) int unlockedExtraSessions,
  }) = _QuizSessionProgress;
}
