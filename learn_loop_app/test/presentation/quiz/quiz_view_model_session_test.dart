import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:learn_loop_app/data/repositories/quiz_session_repository_impl.dart';
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
  Future<List<Quiz>> getTodayQuizzes({int? limit}) async {
    lastCalledLimit = limit;
    // limit が指定された場合は件数を制限して返す
    if (limit != null && limit < quizzesToReturn.length) {
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
}

// ---------------------------------------------------------------------------
// テスト用モック: QuizSessionRepository
// ---------------------------------------------------------------------------

/// 手動モック実装。テストごとに返すセッション進捗と、呼び出し結果を記録できる。
class MockQuizSessionRepository implements QuizSessionRepository {
  /// getSessionProgress が返す進捗（null = セッションなし）
  QuizSessionProgress? progressToReturn;

  /// saveSession に渡された remainingCount の記録
  int? savedRemainingCount;

  /// decrementRemaining が呼ばれた回数
  int decrementCount = 0;

  /// clearSession が呼ばれたかどうか
  bool cleared = false;

  /// incrementCompletedSessions が呼ばれた回数
  int incrementCompletedCount = 0;

  /// incrementCompletedSessions 呼び出し後に progressToReturn を差し替えるコールバック
  /// テストで完了後の状態を注入するために使う
  void Function()? onIncrementCompleted;

  @override
  Future<QuizSessionProgress?> getSessionProgress() async => progressToReturn;

  @override
  Future<void> saveSession({required int remainingCount}) async {
    savedRemainingCount = remainingCount;
  }

  @override
  Future<void> decrementRemaining() async {
    decrementCount++;
  }

  @override
  Future<void> clearSession() async {
    cleared = true;
    progressToReturn = null;
  }

  @override
  Future<void> incrementCompletedSessions() async {
    incrementCompletedCount++;
    // テストで注入されたコールバックがあれば呼ぶ
    onIncrementCompleted?.call();
  }

  @override
  Future<void> unlockNextSession() async {}
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

/// 今日の深夜0時の millisecondsSinceEpoch を返す
int _todayMidnight() {
  final today = DateTime.now();
  return DateTime(today.year, today.month, today.day).millisecondsSinceEpoch;
}

/// 昨日の深夜0時の millisecondsSinceEpoch を返す
int _yesterdayMidnight() {
  final yesterday = DateTime.now().subtract(const Duration(days: 1));
  return DateTime(
    yesterday.year,
    yesterday.month,
    yesterday.day,
  ).millisecondsSinceEpoch;
}

/// ProviderContainer を作成し、テストが終わったら自動 dispose するヘルパー
ProviderContainer _makeContainer(
  MockQuizRepository mockRepo,
  MockQuizSessionRepository mockSessionRepo,
) {
  final container = ProviderContainer(
    overrides: [
      quizRepositoryProvider.overrideWithValue(mockRepo),
      userProgressRepositoryProvider.overrideWithValue(
        MockUserProgressRepository(),
      ),
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
    // 1. 今日のセッションが存在する場合: remaining を limit として取得する
    // -------------------------------------------------------------------------
    test('今日のセッションが存在する場合、remaining を limit として取得する', () async {
      // Arrange: 今日の日付・remaining=3 のセッション進捗を返すモック
      final mockSessionRepo = MockQuizSessionRepository()
        ..progressToReturn = QuizSessionProgress(
          sessionDateMs: _todayMidnight(),
          remaining: 3,
        );

      // 残り 3 件を返すモック
      final mockRepo = MockQuizRepository(
        quizzesToReturn: [_makeQuiz('q1'), _makeQuiz('q2'), _makeQuiz('q3')],
      );
      final container = _makeContainer(mockRepo, mockSessionRepo);

      // Act
      await _waitForStableState(container);

      // Assert: getTodayQuizzes に limit=3 が渡されていること
      expect(
        mockRepo.lastCalledLimit,
        equals(3),
        reason: 'limit は remaining(3) と等しいべき',
      );
    });

    // -------------------------------------------------------------------------
    // 2. 翌日以降の場合: セッションがクリアされて全件取得
    // -------------------------------------------------------------------------
    test('翌日以降の場合、セッションをクリアして全件取得する', () async {
      // Arrange: 昨日の日付のセッション進捗を返すモック
      final mockSessionRepo = MockQuizSessionRepository()
        ..progressToReturn = QuizSessionProgress(
          sessionDateMs: _yesterdayMidnight(),
          remaining: 3,
        );

      final mockRepo = MockQuizRepository(
        quizzesToReturn: [_makeQuiz('q1'), _makeQuiz('q2')],
      );
      final container = _makeContainer(mockRepo, mockSessionRepo);

      // Act
      await _waitForStableState(container);

      // Assert: 古いセッションはクリアされていること
      expect(mockSessionRepo.cleared, isTrue, reason: '翌日起動後は古いセッションがクリアされるべき');

      // 新規セッション開始なので dailyLimit(12) が渡されること
      // （clearSession後に_startNewSession()が呼ばれ limit: QuizConstants.dailyLimit が使われる）
      expect(
        mockRepo.lastCalledLimit,
        equals(12),
        reason: '翌日以降は新規セッションとして dailyLimit(12) で取得すべき',
      );
    });

    // -------------------------------------------------------------------------
    // 3. nextQuestion() で decrementRemaining が呼ばれること
    // -------------------------------------------------------------------------
    test('nextQuestion() を呼ぶと decrementRemaining が呼ばれる', () async {
      // Arrange: 2問あるクイズセッション
      final mockSessionRepo = MockQuizSessionRepository()
        ..progressToReturn = QuizSessionProgress(
          sessionDateMs: _todayMidnight(),
          remaining: 2,
        );

      final mockRepo = MockQuizRepository(
        quizzesToReturn: [_makeQuiz('q1'), _makeQuiz('q2')],
      );
      final container = _makeContainer(mockRepo, mockSessionRepo);
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

      // Assert: decrementRemaining が 1 回呼ばれていること
      expect(
        mockSessionRepo.decrementCount,
        equals(1),
        reason: '1問進めた後は decrementRemaining が1回呼ばれるべき',
      );
    });

    // -------------------------------------------------------------------------
    // 4. 全問完了時に QuizCompleted 状態になること
    //    新フィールド（completedSessions, availableSessions, isAllDone）も検証する
    // -------------------------------------------------------------------------
    test('全問完了時に QuizCompleted 状態になり新フィールドが正しい値を持つ', () async {
      // Arrange: 1問のみのセッション（全問完了させる）
      // incrementCompletedSessions が呼ばれた後、completed=3 を返すよう設定して
      // SessionActionAllDone（全セッション完了）が確実に返るようにする
      final mockSessionRepo = MockQuizSessionRepository()
        ..progressToReturn = QuizSessionProgress(
          sessionDateMs: _todayMidnight(),
          remaining: 1,
          completedSessions: 2, // 既に2セッション完了済み（あと1で上限3）
        );

      // incrementCompletedSessions 呼出後に completed=3, remaining=0 に差し替える
      mockSessionRepo.onIncrementCompleted = () {
        mockSessionRepo.progressToReturn = QuizSessionProgress(
          sessionDateMs: _todayMidnight(),
          remaining: 0,
          completedSessions: 3, // 上限に達した状態
        );
      };

      final mockRepo = MockQuizRepository(quizzesToReturn: [_makeQuiz('q1')]);
      final container = _makeContainer(mockRepo, mockSessionRepo);
      final viewModel = container.read(quizViewModelProvider.notifier);

      await _waitForStableState(container);

      // 1問だけ回答して完了させる
      viewModel.toggleOption('q1_o1');
      viewModel.submitAnswer();
      await viewModel.nextQuestion();

      // fire-and-forget の書き込みを settle
      await Future<void>.delayed(const Duration(milliseconds: 50));

      // Assert: 状態が QuizCompleted になっていること
      final state = container.read(quizViewModelProvider);
      expect(
        state,
        isA<QuizCompleted>(),
        reason: '全1問を完了したので QuizCompleted 状態になるべき',
      );

      // 新フィールドの検証
      final completed = state as QuizCompleted;
      expect(
        completed.isAllDone,
        isTrue,
        reason: '全3セッション完了なので isAllDone=true になるべき',
      );
      expect(
        completed.completedSessions,
        equals(3),
        reason: 'completedSessions は 3（上限）になるべき',
      );
    });

    // -------------------------------------------------------------------------
    // 5. restart() でセッションがクリアされて問題が再取得されること
    // -------------------------------------------------------------------------
    test('restart() を呼ぶとセッションがクリアされてクイズが再取得される', () async {
      // Arrange: セッションデータが残っている状態（remaining=2）
      final mockSessionRepo = MockQuizSessionRepository()
        ..progressToReturn = QuizSessionProgress(
          sessionDateMs: _todayMidnight(),
          remaining: 2,
        );

      final mockRepo = MockQuizRepository(
        quizzesToReturn: [_makeQuiz('q1'), _makeQuiz('q2')],
      );
      final container = _makeContainer(mockRepo, mockSessionRepo);
      final viewModel = container.read(quizViewModelProvider.notifier);

      // 最初のロードを待つ（この時点では limit=2 が渡されている）
      await _waitForStableState(container);
      expect(
        mockRepo.lastCalledLimit,
        equals(2),
        reason: '初回ロード時: limit = remaining(2)',
      );

      // Act: restart() を呼ぶ
      await viewModel.restart();
      await _waitForStableState(container);

      // Assert: 2回目の getTodayQuizzes は dailyLimit(12) で呼ばれること
      // （restart() → clearSession() → _startNewSession() → limit: QuizConstants.dailyLimit）
      expect(
        mockRepo.lastCalledLimit,
        equals(12),
        reason: 'restart() 後は新規セッションとして dailyLimit(12) で全件取得すべき',
      );
    });
  });
}
