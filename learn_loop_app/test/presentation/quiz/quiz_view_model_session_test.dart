import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:learn_loop_app/core/constants/quiz_constants.dart';
import 'package:learn_loop_app/data/repositories/quiz_session_repository_impl.dart';
import 'package:learn_loop_app/domain/models/daily_stats_result.dart';
import 'package:learn_loop_app/domain/models/home_summary.dart';
import 'package:learn_loop_app/domain/models/quiz.dart';
import 'package:learn_loop_app/domain/repositories/quiz_repository.dart';
import 'package:learn_loop_app/domain/repositories/quiz_session_repository.dart';
import 'package:learn_loop_app/domain/repositories/user_progress_repository.dart';
import 'package:learn_loop_app/presentation/home/home_view_model.dart';
import 'package:learn_loop_app/presentation/quiz/quiz_view_model.dart';
import 'package:learn_loop_app/presentation/quiz/state/quiz_state.dart';

// ---------------------------------------------------------------------------
// テスト用モック: QuizRepository
// ---------------------------------------------------------------------------

/// 手動モック実装。テストごとに返すクイズリストと limit の引数を記録できる。
class MockQuizRepository implements QuizRepository {
  /// getTodayQuizzes に渡された limit の記録
  int? lastCalledLimit;

  /// getTodayQuizzes が返すクイズリスト
  List<Quiz> quizzesToReturn;

  MockQuizRepository({required this.quizzesToReturn});

  @override
  Future<List<Quiz>> getTodayQuizzes({required int limit}) async {
    lastCalledLimit = limit;
    // limit が指定された場合は件数を制限して返す
    if (limit < quizzesToReturn.length) {
      return quizzesToReturn.sublist(0, limit);
    }
    return quizzesToReturn;
  }

  @override
  Future<Quiz?> getQuizById(String id) async => null;

  @override
  Future<HomeSummary> getSummary() async => HomeSummary(
    count: quizzesToReturn.length,
    streak: 0,
    accuracy: 0.0,
    totalAnswered: 0,
  );
}

/// テスト用の UserProgressRepository モック（副作用をスキップ）
class MockUserProgressRepository implements UserProgressRepository {
  /// 今日の回答数（ResolveSessionUseCase が参照する）
  int answeredCountToReturn = 0;

  @override
  Future<int> getTodayAnsweredCount() async => answeredCountToReturn;

  @override
  Future<void> recordAnswer({
    required String quizId,
    required bool isCorrect,
  }) async {}

  @override
  Future<void> hideQuiz({required String quizId}) async {}

  @override
  Future<UserStats> getStats() async {
    return const UserStats(streak: 0, accuracy: 0.0, totalAnswered: 0);
  }

  @override
  Future<DailyStatsResult> getDailyStats({int limit = 20, int offset = 0}) {
    throw UnimplementedError();
  }
}

// ---------------------------------------------------------------------------
// テスト用モック: QuizSessionRepository
// ---------------------------------------------------------------------------

/// 手動モック実装。手動解放セッション数を記録できる。
class MockQuizSessionRepository implements QuizSessionRepository {
  /// 手動解放済みのセッション追加数
  int unlockedExtraSessions = 0;

  @override
  Future<int> getUnlockedExtraSessions() async => unlockedExtraSessions;

  @override
  Future<void> unlockNextSession() async {
    unlockedExtraSessions++;
  }
}

// ---------------------------------------------------------------------------
// テストヘルパー
// ---------------------------------------------------------------------------

/// テスト用クイズを生成するファクトリ
Quiz _makeQuiz(String id) => Quiz(
  id: id,
  question: '問題 $id',
  options: [
    QuizOption(id: '${id}_o1', label: 'A', text: '選択肢A', isCorrect: true),
    QuizOption(id: '${id}_o2', label: 'B', text: '選択肢B', isCorrect: false),
  ],
  explanation: '解説 $id',
);

/// ProviderContainer を作成し、テストが終わったら自動 dispose するヘルパー
ProviderContainer _makeContainer(
  MockQuizRepository mockRepo,
  MockQuizSessionRepository mockSessionRepo, {
  MockUserProgressRepository? mockProgressRepo,
}) {
  final progressRepo = mockProgressRepo ?? MockUserProgressRepository();
  final container = ProviderContainer(
    overrides: [
      quizRepositoryProvider.overrideWithValue(mockRepo),
      userProgressRepositoryProvider.overrideWithValue(progressRepo),
      // QuizSessionRepository をモックで上書き
      quizSessionRepositoryProvider.overrideWithValue(mockSessionRepo),
    ],
  );
  addTearDown(container.dispose);
  return container;
}

/// QuizViewModel が loading を抜けて最初の安定状態になるまで待つ
Future<QuizState> _waitForStableState(ProviderContainer container) async {
  // build() が _loadQuizzes() を呼ぶが、非同期なので settle するまでポーリングする
  QuizState state;
  do {
    await Future<void>.delayed(Duration.zero);
    state = container.read(quizViewModelProvider);
  } while (state is QuizLoading);
  return state;
}

// ---------------------------------------------------------------------------
// テスト本体
// ---------------------------------------------------------------------------

void main() {
  group('QuizViewModel セッション管理', () {
    // -------------------------------------------------------------------------
    // 1. セッション途中の場合: remaining を limit として取得する
    // -------------------------------------------------------------------------
    test('セッション途中の場合、remaining を limit として取得する', () async {
      // Arrange: 今日3問回答済み（1セッション内、remaining=9）
      // QuizConstants.dailyLimit=12, answeredCount=3 → remaining=9
      final mockProgressRepo = MockUserProgressRepository()
        ..answeredCountToReturn = 3;

      // 残り 9 件を返すモック
      final mockRepo = MockQuizRepository(
        quizzesToReturn: List.generate(9, (i) => _makeQuiz('q${i + 1}')),
      );
      final container = _makeContainer(
        mockRepo,
        MockQuizSessionRepository(),
        mockProgressRepo: mockProgressRepo,
      );

      // Act
      await _waitForStableState(container);

      // Assert: getTodayQuizzes に limit=9 が渡されていること
      expect(
        mockRepo.lastCalledLimit,
        equals(QuizConstants.dailyLimit - 3),
        reason: 'limit は remaining(dailyLimit - answeredCount) と等しいべき',
      );
    });

    // -------------------------------------------------------------------------
    // 2. 今日まだ回答なしの場合: 全件取得（新規セッション）
    // -------------------------------------------------------------------------
    test('今日まだ回答なしの場合、dailyLimit で全件取得する', () async {
      // Arrange: 回答数0（新規セッション）
      final mockProgressRepo = MockUserProgressRepository()
        ..answeredCountToReturn = 0;

      final mockRepo = MockQuizRepository(
        quizzesToReturn: [_makeQuiz('q1'), _makeQuiz('q2')],
      );
      final container = _makeContainer(
        mockRepo,
        MockQuizSessionRepository(),
        mockProgressRepo: mockProgressRepo,
      );

      // Act
      await _waitForStableState(container);

      // Assert: 新規セッションなので dailyLimit(12) が渡されること
      expect(
        mockRepo.lastCalledLimit,
        equals(QuizConstants.dailyLimit),
        reason: '回答なし → 新規セッション開始なので dailyLimit(12) で取得すべき',
      );
    });

    // -------------------------------------------------------------------------
    // 3. nextQuestion() で decrementRemaining は呼ばれない（DB ベース管理）
    // -------------------------------------------------------------------------
    test('nextQuestion() を呼んでも QuizAnswering 状態に遷移する', () async {
      // Arrange: 2問あるクイズセッション（途中再開: 2問残り）
      final mockProgressRepo = MockUserProgressRepository()
        ..answeredCountToReturn = QuizConstants.dailyLimit - 2; // 残り2問

      final mockRepo = MockQuizRepository(
        quizzesToReturn: [_makeQuiz('q1'), _makeQuiz('q2')],
      );
      final container = _makeContainer(
        mockRepo,
        MockQuizSessionRepository(),
        mockProgressRepo: mockProgressRepo,
      );
      final viewModel = container.read(quizViewModelProvider.notifier);

      // 最初の安定状態（QuizAnswering）を待つ
      await _waitForStableState(container);

      // 1問目: 選択肢を選んで回答確定
      viewModel.toggleOption('q1_o1');
      viewModel.submitAnswer();

      // nextQuestion() を呼んで2問目へ進む
      await viewModel.nextQuestion();

      // fire-and-forget の書き込みを settle
      await Future<void>.delayed(const Duration(milliseconds: 50));

      // Assert: 2問目の QuizAnswering 状態になっていること
      final state = container.read(quizViewModelProvider);
      expect(
        state,
        isA<QuizAnswering>(),
        reason: '2問目に進んだので QuizAnswering 状態になるべき',
      );
    });

    // -------------------------------------------------------------------------
    // 4. 全問完了時に QuizCompleted 状態になること
    //    新フィールド（completedSessions, availableSessions, isAllDone）も検証する
    // -------------------------------------------------------------------------
    test('全問完了時に QuizCompleted 状態になり新フィールドが正しい値を持つ', () async {
      // Arrange: 1問のみのセッション（全問完了させる）
      // 既に 2セッション×12問=24問回答済み（nextQuestion後に25問になる）
      // ResolveSessionUseCase は _showSessionCompleted で再呼び出しされるため、
      // answeredCount を全完了済み（36問）に設定
      final mockProgressRepo = MockUserProgressRepository()
        ..answeredCountToReturn =
            QuizConstants.dailySessionCount * QuizConstants.dailyLimit; // 36

      final mockRepo = MockQuizRepository(quizzesToReturn: [_makeQuiz('q1')]);
      final container = _makeContainer(
        mockRepo,
        MockQuizSessionRepository(),
        mockProgressRepo: mockProgressRepo,
      );

      // _loadQuizzes で answeredCount=36 → SessionActionAllDone になる
      final initialState = await _waitForStableState(container);

      // Assert: 全完了状態（SessionActionAllDone）として QuizCompleted になること
      expect(
        initialState,
        isA<QuizCompleted>(),
        reason: '全セッション完了済みなので初期状態が QuizCompleted になるべき',
      );

      final completed = initialState as QuizCompleted;
      expect(
        completed.isAllDone,
        isTrue,
        reason: '全3セッション完了なので isAllDone=true になるべき',
      );
      expect(
        completed.completedSessions,
        equals(QuizConstants.dailySessionCount),
        reason: 'completedSessions は 3（上限）になるべき',
      );
    });

    // -------------------------------------------------------------------------
    // 5. restart() でセッションがクリアされて問題が再取得されること
    // -------------------------------------------------------------------------
    test('restart() を呼ぶとセッションがクリアされてクイズが再取得される', () async {
      // Arrange: 途中再開状態（2問残り）
      final mockProgressRepo = MockUserProgressRepository()
        ..answeredCountToReturn = QuizConstants.dailyLimit - 2; // 残り2問

      final mockSessionRepo = MockQuizSessionRepository();
      final mockRepo = MockQuizRepository(
        quizzesToReturn: [_makeQuiz('q1'), _makeQuiz('q2')],
      );
      final container = _makeContainer(
        mockRepo,
        mockSessionRepo,
        mockProgressRepo: mockProgressRepo,
      );
      final viewModel = container.read(quizViewModelProvider.notifier);

      // 最初のロードを待つ（この時点では limit=2 が渡されている）
      await _waitForStableState(container);
      expect(
        mockRepo.lastCalledLimit,
        equals(2),
        reason: '初回ロード時: limit = remaining(2)',
      );

      // restart() 後は answeredCount=0 として新規セッション開始させる
      mockProgressRepo.answeredCountToReturn = 0;

      // Act: restart() を呼ぶ
      await viewModel.restart();
      await _waitForStableState(container);

      // Assert: 2回目の getTodayQuizzes は dailyLimit(12) で呼ばれること
      expect(
        mockRepo.lastCalledLimit,
        equals(QuizConstants.dailyLimit),
        reason: 'restart() 後は新規セッションとして dailyLimit(12) で全件取得すべき',
      );
    });
  });
}
