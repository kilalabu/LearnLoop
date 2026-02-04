import 'package:freezed_annotation/freezed_annotation.dart';
import 'problem.dart';

part 'quiz_session.freezed.dart';

/// クイズセッションモデル
@freezed
abstract class QuizSession with _$QuizSession {
  const factory QuizSession({
    required List<Problem> problems,
    required int currentIndex,
    @Default({}) Map<String, List<String>> userAnswers,
  }) = _QuizSession;

  const QuizSession._();

  /// 現在の問題
  Problem get currentProblem => problems[currentIndex];

  /// 問題総数
  int get totalCount => problems.length;

  /// 次の問題があるか
  bool get hasNext => currentIndex < problems.length - 1;

  /// 現在の問題の回答済み選択肢
  List<String> get currentAnswers => userAnswers[currentProblem.id] ?? [];
}
