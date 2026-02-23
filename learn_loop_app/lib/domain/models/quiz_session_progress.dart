import 'package:freezed_annotation/freezed_annotation.dart';

part 'quiz_session_progress.freezed.dart';

/// クイズセッション進捗（1日分のセッション状態）
@freezed
abstract class QuizSessionProgress with _$QuizSessionProgress {
  const factory QuizSessionProgress({
    /// セッション開始日の深夜0時の millisecondsSinceEpoch
    required int sessionDateMs,

    /// 残り問題数（セッション開始時の出題数から nextQuestion() のたびに減る）
    required int remaining,

    /// 今日完了したセッション数（incrementCompletedSessions() のたびに増える）
    @Default(0) int completedSessions,

    /// 手動で解放した追加セッション数（unlockNextSession() のたびに増える）
    @Default(0) int unlockedExtraSessions,
  }) = _QuizSessionProgress;
}
