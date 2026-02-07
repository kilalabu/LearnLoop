import 'package:freezed_annotation/freezed_annotation.dart';
import 'quiz.dart';

part 'quiz_session.freezed.dart';

/// クイズセッションモデル
@freezed
abstract class QuizSession with _$QuizSession {
  const factory QuizSession({
    required List<Quiz> quizzes,
    required int currentIndex,
    @Default({}) Map<String, List<String>> userAnswers,
  }) = _QuizSession;

  const QuizSession._();

  /// 現在のクイズ
  Quiz get currentQuiz => quizzes[currentIndex];

  /// クイズ総数
  int get totalCount => quizzes.length;

  /// 次のクイズがあるか
  bool get hasNext => currentIndex < quizzes.length - 1;

  /// 現在のクイズの回答済み選択肢
  List<String> get currentAnswers => userAnswers[currentQuiz.id] ?? [];
}
