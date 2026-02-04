import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_progress.freezed.dart';

/// ユーザー進捗モデル
@freezed
abstract class UserProgress with _$UserProgress {
  const factory UserProgress({
    required String id,
    required String problemId,
    required bool isCorrect,
    required int attemptCount,
    DateTime? lastAnsweredAt,
    required int forgettingStep,
    DateTime? nextReviewAt,
    @Default(false) bool isHidden,
  }) = _UserProgress;
}
