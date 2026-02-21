import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import '../../core/constants/quiz_constants.dart';
import '../../data/repositories/quiz_session_repository_impl.dart';
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
      final sessionRepo = ref.read(quizSessionRepositoryProvider);
      final progress = await sessionRepo.getSessionProgress();

      // 当日完了済み（remaining == 0 かつセッションあり）の場合は即座に完了状態を表示
      if (progress != null && progress.remaining == 0) {
        state = const QuizState.completed(correctCount: 0, totalCount: 0);
        return;
      }

      // 未開始 or 途中再開: セッションの残り問題数をクエリパラメータとして渡して取得
      final limit = progress?.remaining ?? QuizConstants.dailyLimit;

      final quizRepo = ref.read(quizRepositoryProvider);
      _quizzes = await quizRepo.getTodayQuizzes(limit: limit);
      _correctCount = 0;

      // 今日の日付と totalCount を保存（answeredCount は既存値を引き継ぐ）
      await sessionRepo.saveSession(remainingCount: _quizzes.length);

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

  /// 「もう出さない」チェックをトグル
  void toggleHidden() {
    final currentState = state;
    if (currentState is! QuizShowingResult) return;

    state = currentState.copyWith(
      isHiddenChecked: !currentState.isHiddenChecked,
    );
  }

  /// 次のクイズへ
  void nextQuestion() {
    final currentState = state;
    if (currentState is! QuizShowingResult) return;

    // 「もう出さない」がチェックされていたら is_hidden を更新(fire-and-forget)
    if (currentState.isHiddenChecked) {
      final quiz = currentState.quizzes[currentState.currentIndex];
      final progressRepo = ref.read(userProgressRepositoryProvider);
      progressRepo
          .hideQuiz(quizId: quiz.id)
          .catchError((e) => debugPrint('非表示更新失敗: $e'));
    }

    final nextIndex = currentState.currentIndex + 1;
    if (nextIndex >= currentState.quizzes.length) {
      // 全問完了: clearSession は呼ばない。remaining = 0 が完了の証跡として残る
      state = QuizState.completed(
        correctCount: _correctCount,
        totalCount: currentState.quizzes.length,
      );
    } else {
      // 途中: 残り問題数をデクリメント(fire-and-forget)
      final sessionRepo = ref.read(quizSessionRepositoryProvider);
      sessionRepo.decrementRemaining().catchError(
        (e) => debugPrint('セッション更新失敗: $e'),
      );

      state = QuizState.answering(
        quizzes: currentState.quizzes,
        currentIndex: nextIndex,
        selectedOptionIds: {},
      );
    }
  }

  /// クリップボードにコピー
  void copyToClipboard() {
    final currentState = state;
    if (currentState is! QuizShowingResult) return;

    final quiz = currentState.quizzes[currentState.currentIndex];
    final text = _buildCopyText(quiz);
    Clipboard.setData(ClipboardData(text: text));
    HapticFeedback.lightImpact();
  }

  /// クイズの問題・正解・解説をまとめたコピー用テキストを生成する
  static String _buildCopyText(Quiz quiz) {
    // 正解の選択肢を取得（複数正解対応）
    final correctOptions = quiz.options.where((o) => o.isCorrect).toList();
    final correctLines = correctOptions
        .map((o) => '${o.label}. ${o.text}')
        .join('\n');

    final buffer = StringBuffer();
    buffer.writeln('【問題】');
    buffer.writeln(quiz.question);
    buffer.writeln();
    buffer.writeln('【正解】');
    buffer.writeln(correctLines);
    buffer.writeln();
    buffer.writeln('【解説】');
    buffer.write(quiz.explanation);

    // sourceUrl がある場合のみ出典行を追加
    if (quiz.sourceUrl != null) {
      buffer.writeln();
      buffer.writeln();
      buffer.write('出典: ${quiz.sourceUrl}');
    }

    return buffer.toString();
  }

  /// やり直し
  Future<void> restart() async {
    final sessionRepo = ref.read(quizSessionRepositoryProvider);
    await sessionRepo.clearSession();
    _correctCount = 0;
    _loadQuizzes();
  }
}
