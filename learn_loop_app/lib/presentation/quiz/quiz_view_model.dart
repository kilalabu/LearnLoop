import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/foundation.dart';
import '../../domain/models/quiz.dart';
import '../home/home_view_model.dart';
import 'state/quiz_state.dart';

final quizViewModelProvider = NotifierProvider<QuizViewModel, QuizState>(
  QuizViewModel.new,
);

class QuizViewModel extends Notifier<QuizState> {
  List<Quiz> _quizzes = [];
  int _correctCount = 0;

  @override
  QuizState build() {
    _loadQuizzes();
    return const QuizState.loading();
  }

  Future<void> _loadQuizzes() async {
    try {
      final quizRepo = ref.read(quizRepositoryProvider);
      _quizzes = await quizRepo.getTodayQuizzes();
      _correctCount = 0;

      if (_quizzes.isEmpty) {
        state = const QuizState.completed(correctCount: 0, totalCount: 0);
      } else {
        state = QuizState.answering(
          quizzes: _quizzes,
          currentIndex: 0,
          selectedOptionIds: {},
        );
      }
    } catch (e) {
      state = QuizState.error(e.toString());
    }
  }

  /// 選択肢をトグル
  void toggleOption(String optionId) {
    final currentState = state;
    if (currentState is! QuizAnswering) return;

    final newSelected = Set<String>.from(currentState.selectedOptionIds);
    if (newSelected.contains(optionId)) {
      newSelected.remove(optionId);
    } else {
      newSelected.add(optionId);
    }

    state = currentState.copyWith(selectedOptionIds: newSelected);
  }

  /// 回答を確定
  void submitAnswer() {
    final currentState = state;
    if (currentState is! QuizAnswering) return;
    if (currentState.selectedOptionIds.isEmpty) return;

    final quiz = currentState.quizzes[currentState.currentIndex];
    final correctIds = quiz.options
        .where((o) => o.isCorrect)
        .map((o) => o.id)
        .toSet();

    final isCorrect =
        currentState.selectedOptionIds.length == correctIds.length &&
        currentState.selectedOptionIds.containsAll(correctIds);

    if (isCorrect) {
      _correctCount++;
    }

    // バックエンドに回答を記録(fire-and-forget)
    final progressRepo = ref.read(userProgressRepositoryProvider);
    progressRepo
        .recordAnswer(quizId: quiz.id, isCorrect: isCorrect)
        .catchError((e) => debugPrint('回答記録失敗: $e'));

    state = QuizState.showingResult(
      quizzes: currentState.quizzes,
      currentIndex: currentState.currentIndex,
      selectedOptionIds: currentState.selectedOptionIds,
      isCorrect: isCorrect,
    );
  }

  /// 次のクイズへ
  void nextQuestion() {
    final currentState = state;
    if (currentState is! QuizShowingResult) return;

    final nextIndex = currentState.currentIndex + 1;
    if (nextIndex >= currentState.quizzes.length) {
      state = QuizState.completed(
        correctCount: _correctCount,
        totalCount: currentState.quizzes.length,
      );
    } else {
      state = QuizState.answering(
        quizzes: currentState.quizzes,
        currentIndex: nextIndex,
        selectedOptionIds: {},
      );
    }
  }

  /// やり直し
  void restart() {
    _loadQuizzes();
  }
}
