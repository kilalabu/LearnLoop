import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import '../../core/constants/quiz_constants.dart';
import '../../data/repositories/quiz_session_repository_impl.dart';
import '../../domain/models/quiz.dart';
import '../../domain/models/session_action.dart';
import '../../domain/usecases/resolve_session_use_case.dart';
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
      final useCase = ResolveSessionUseCase(
        ref.read(quizSessionRepositoryProvider),
      );
      final action = await useCase.call();

      switch (action) {
        case SessionActionStartNew():
          await _startNewSession();

        case SessionActionResume(:final remaining):
          // 途中再開: 残り問題数を limit にしてクイズを取得
          final quizRepo = ref.read(quizRepositoryProvider);
          _quizzes = await quizRepo.getTodayQuizzes(limit: remaining);
          _correctCount = 0;
          final sessionRepo = ref.read(quizSessionRepositoryProvider);
          await sessionRepo.saveSession(remainingCount: _quizzes.length);
          if (_quizzes.isEmpty) {
            state = _buildCompletedState(0, 0, isAllDone: true);
          } else {
            state = QuizState.answering(
              quizzes: _quizzes,
              currentIndex: 0,
              selectedOptionIds: {},
            );
          }

        case SessionActionDone(:final completedSessions, :final availableSessions):
          // セッション完了済みで次のセッションを待っている状態
          state = QuizState.completed(
            correctCount: 0,
            totalCount: 0,
            completedSessions: completedSessions,
            availableSessions: availableSessions,
            isAllDone: false,
          );

        case SessionActionAllDone(:final completedSessions):
          // 全セッション完了
          state = QuizState.completed(
            correctCount: 0,
            totalCount: 0,
            completedSessions: completedSessions,
            availableSessions: QuizConstants.dailySessionCount,
            isAllDone: true,
          );
      }
    } catch (e) {
      state = QuizState.error(e.toString());
    }
  }

  /// 新規セッションを開始してクイズを読み込む
  Future<void> _startNewSession() async {
    final quizRepo = ref.read(quizRepositoryProvider);
    final sessionRepo = ref.read(quizSessionRepositoryProvider);
    _quizzes = await quizRepo.getTodayQuizzes(limit: QuizConstants.dailyLimit);
    _correctCount = 0;
    await sessionRepo.saveSession(remainingCount: _quizzes.length);
    if (_quizzes.isEmpty) {
      state = _buildCompletedState(0, 0, isAllDone: true);
    } else {
      state = QuizState.answering(
        quizzes: _quizzes,
        currentIndex: 0,
        selectedOptionIds: {},
      );
    }
  }

  /// 完了状態を構築するヘルパー
  QuizState _buildCompletedState(
    int correctCount,
    int totalCount, {
    required bool isAllDone,
  }) {
    return QuizState.completed(
      correctCount: correctCount,
      totalCount: totalCount,
      completedSessions:
          isAllDone ? QuizConstants.dailySessionCount : 0,
      availableSessions: QuizConstants.dailySessionCount,
      isAllDone: isAllDone,
    );
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
  Future<void> nextQuestion() async {
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
      // 全問終了: セッション完了処理に移行
      await _showSessionCompleted();
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

  /// セッション完了後の状態を決定する
  Future<void> _showSessionCompleted() async {
    final sessionRepo = ref.read(quizSessionRepositoryProvider);
    // 完了セッション数を +1 してから remaining=0 で保存
    await sessionRepo.incrementCompletedSessions();
    await sessionRepo.saveSession(remainingCount: 0);

    // UseCase で次のアクションを判定
    final useCase = ResolveSessionUseCase(sessionRepo);
    final action = await useCase.call();

    switch (action) {
      case SessionActionDone(:final completedSessions, :final availableSessions):
        state = QuizState.completed(
          correctCount: _correctCount,
          totalCount: _quizzes.length,
          completedSessions: completedSessions,
          availableSessions: availableSessions,
          isAllDone: false,
        );
      case SessionActionAllDone(:final completedSessions):
        state = QuizState.completed(
          correctCount: _correctCount,
          totalCount: _quizzes.length,
          completedSessions: completedSessions,
          availableSessions: QuizConstants.dailySessionCount,
          isAllDone: true,
        );
      default:
        // 予期しないアクション（新規 or 再開）の場合は再ロード
        await _loadQuizzes();
    }
  }

  /// 次のセッションを開始する（completedSessions < availableSessions のとき）
  Future<void> startNextSession() async {
    state = const QuizState.loading();
    await _startNewSession();
  }

  /// 次のセッションを手動解放する（アドオン購入など）
  Future<void> unlockNextSession() async {
    final sessionRepo = ref.read(quizSessionRepositoryProvider);
    await sessionRepo.unlockNextSession();
    await _loadQuizzes();
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
