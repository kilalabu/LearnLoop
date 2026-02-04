import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/problem.dart';
import '../home/home_view_model.dart';
import 'state/quiz_state.dart';

final quizViewModelProvider = NotifierProvider<QuizViewModel, QuizState>(
  QuizViewModel.new,
);

class QuizViewModel extends Notifier<QuizState> {
  List<Problem> _problems = [];
  int _correctCount = 0;

  @override
  QuizState build() {
    _loadProblems();
    return const QuizState.loading();
  }

  Future<void> _loadProblems() async {
    try {
      final problemRepo = ref.read(problemRepositoryProvider);
      _problems = await problemRepo.getTodayProblems();
      _correctCount = 0;

      if (_problems.isEmpty) {
        state = const QuizState.completed(correctCount: 0, totalCount: 0);
      } else {
        state = QuizState.answering(
          problems: _problems,
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

    final problem = currentState.problems[currentState.currentIndex];
    final correctIds = problem.options
        .where((o) => o.isCorrect)
        .map((o) => o.id)
        .toSet();

    final isCorrect =
        currentState.selectedOptionIds.length == correctIds.length &&
        currentState.selectedOptionIds.containsAll(correctIds);

    if (isCorrect) {
      _correctCount++;
    }

    state = QuizState.showingResult(
      problems: currentState.problems,
      currentIndex: currentState.currentIndex,
      selectedOptionIds: currentState.selectedOptionIds,
      isCorrect: isCorrect,
    );
  }

  /// 次の問題へ
  void nextQuestion() {
    final currentState = state;
    if (currentState is! QuizShowingResult) return;

    final nextIndex = currentState.currentIndex + 1;
    if (nextIndex >= currentState.problems.length) {
      state = QuizState.completed(
        correctCount: _correctCount,
        totalCount: currentState.problems.length,
      );
    } else {
      state = QuizState.answering(
        problems: currentState.problems,
        currentIndex: nextIndex,
        selectedOptionIds: {},
      );
    }
  }

  /// やり直し
  void restart() {
    _loadProblems();
  }
}
