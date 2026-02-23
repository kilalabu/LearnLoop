import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../domain/models/quiz.dart';

part 'quiz_state.freezed.dart';

/// クイズ画面の状態 (sealed class)
@freezed
sealed class QuizState with _$QuizState {
  /// 読み込み中
  const factory QuizState.loading() = QuizLoading;

  /// クイズに回答中
  const factory QuizState.answering({
    required List<Quiz> quizzes,
    required int currentIndex,
    required Set<String> selectedOptionIds,
  }) = QuizAnswering;

  /// 結果表示中
  const factory QuizState.showingResult({
    required List<Quiz> quizzes,
    required int currentIndex,
    required Set<String> selectedOptionIds,
    required bool isCorrect,
    /// 解説の非表示選択肢を展開済みかどうか
    @Default(false) bool isHiddenChecked,
  }) = QuizShowingResult;

  /// 全問完了
  const factory QuizState.completed({
    required int correctCount,
    required int totalCount,
    required int completedSessions,
    required int availableSessions,
    required bool isAllDone,
  }) = QuizCompleted;

  /// エラー
  const factory QuizState.error(String message) = QuizError;
}

/// QuizStateのextension
extension QuizStateX on QuizState {
  Quiz? get currentQuiz {
    return switch (this) {
      QuizAnswering(:final quizzes, :final currentIndex) =>
        quizzes[currentIndex],
      QuizShowingResult(:final quizzes, :final currentIndex) =>
        quizzes[currentIndex],
      _ => null,
    };
  }

  int? get totalCount {
    return switch (this) {
      QuizAnswering(:final quizzes) => quizzes.length,
      QuizShowingResult(:final quizzes) => quizzes.length,
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
