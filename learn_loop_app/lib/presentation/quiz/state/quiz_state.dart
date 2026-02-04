import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../domain/models/problem.dart';

part 'quiz_state.freezed.dart';

/// クイズ画面の状態 (sealed class)
@freezed
sealed class QuizState with _$QuizState {
  /// 読み込み中
  const factory QuizState.loading() = QuizLoading;

  /// 問題に回答中
  const factory QuizState.answering({
    required List<Problem> problems,
    required int currentIndex,
    required Set<String> selectedOptionIds,
  }) = QuizAnswering;

  /// 結果表示中
  const factory QuizState.showingResult({
    required List<Problem> problems,
    required int currentIndex,
    required Set<String> selectedOptionIds,
    required bool isCorrect,
  }) = QuizShowingResult;

  /// 全問完了
  const factory QuizState.completed({
    required int correctCount,
    required int totalCount,
  }) = QuizCompleted;

  /// エラー
  const factory QuizState.error(String message) = QuizError;
}

/// QuizStateのextension
extension QuizStateX on QuizState {
  Problem? get currentProblem {
    return switch (this) {
      QuizAnswering(:final problems, :final currentIndex) =>
        problems[currentIndex],
      QuizShowingResult(:final problems, :final currentIndex) =>
        problems[currentIndex],
      _ => null,
    };
  }

  int? get totalCount {
    return switch (this) {
      QuizAnswering(:final problems) => problems.length,
      QuizShowingResult(:final problems) => problems.length,
      QuizCompleted(:final totalCount) => totalCount,
      _ => null,
    };
  }

  int? get currentQuestionNumber {
    return switch (this) {
      QuizAnswering(:final currentIndex) => currentIndex + 1,
      QuizShowingResult(:final currentIndex) => currentIndex + 1,
      _ => null,
    };
  }
}
