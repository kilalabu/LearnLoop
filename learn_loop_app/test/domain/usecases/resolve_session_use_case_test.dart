import 'package:flutter_test/flutter_test.dart';
import 'package:learn_loop_app/domain/models/session_action.dart';
import 'package:learn_loop_app/domain/repositories/quiz_session_repository.dart';
import 'package:learn_loop_app/domain/usecases/resolve_session_use_case.dart';

// ---------------------------------------------------------------------------
// テスト用モック: QuizSessionRepository
// ---------------------------------------------------------------------------

/// 手動モック実装。返す進捗と呼び出し記録を制御できる。
class MockQuizSessionRepository implements QuizSessionRepository {
  /// getSessionProgress が返す進捗（null = セッションなし）
  QuizSessionProgress? progressToReturn;

  /// clearSession が呼ばれたかどうか
  bool cleared = false;

  /// saveSession に渡された remainingCount
  int? savedRemainingCount;

  /// decrementRemaining が呼ばれた回数
  int decrementCount = 0;

  /// incrementCompletedSessions が呼ばれた回数
  int incrementCompletedCount = 0;

  /// unlockNextSession が呼ばれた回数
  int unlockNextCount = 0;

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
  }

  @override
  Future<void> unlockNextSession() async {
    unlockNextCount++;
  }
}

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

/// 今日の深夜0時の millisecondsSinceEpoch
int _todayMidnight() {
  final today = DateTime.now();
  return DateTime(today.year, today.month, today.day).millisecondsSinceEpoch;
}

/// 昨日の深夜0時の millisecondsSinceEpoch
int _yesterdayMidnight() {
  final yesterday = DateTime.now().subtract(const Duration(days: 1));
  return DateTime(yesterday.year, yesterday.month, yesterday.day)
      .millisecondsSinceEpoch;
}

// ---------------------------------------------------------------------------
// テスト本体
// ---------------------------------------------------------------------------

void main() {
  group('ResolveSessionUseCase', () {
    late MockQuizSessionRepository mockRepo;
    late ResolveSessionUseCase useCase;

    setUp(() {
      mockRepo = MockQuizSessionRepository();
      useCase = ResolveSessionUseCase(mockRepo);
    });

    test('セッション進捗が null のとき SessionActionStartNew を返す', () async {
      // Arrange: セッションなし
      mockRepo.progressToReturn = null;

      // Act
      final result = await useCase.call(now: DateTime(2026, 1, 1, 10, 0));

      // Assert
      expect(result, isA<SessionActionStartNew>(),
          reason: 'セッションが存在しない場合は新規開始アクションを返す');
    });

    test('remaining が残っている場合 SessionActionResume(remaining=5) を返す', () async {
      // Arrange: 今日・残り5問・完了0セッション
      mockRepo.progressToReturn = QuizSessionProgress(
        sessionDateMs: _todayMidnight(),
        remaining: 5,
        completedSessions: 0,
      );

      // Act
      final result = await useCase.call(now: DateTime(2026, 1, 1, 10, 0));

      // Assert
      expect(result, isA<SessionActionResume>());
      final resume = result as SessionActionResume;
      expect(resume.remaining, equals(5),
          reason: '途中再開なので remaining=5 が引き継がれる');
    });

    test('remaining=0, completed=1, 12:00 のとき SessionActionDone(completedSessions=1, availableSessions=2) を返す', () async {
      // Arrange
      mockRepo.progressToReturn = QuizSessionProgress(
        sessionDateMs: _todayMidnight(),
        remaining: 0,
        completedSessions: 1,
      );

      // Act: 12:00 時点なので時間解放 2 セッション
      final result = await useCase.call(now: DateTime(2026, 1, 1, 12, 0));

      // Assert
      expect(result, isA<SessionActionDone>());
      final done = result as SessionActionDone;
      expect(done.completedSessions, equals(1));
      expect(done.availableSessions, equals(2),
          reason: '12:00 時点で2セッション解放済み');
    });

    test('remaining=0, completed=1, 6:00 のとき SessionActionDone(completedSessions=1, availableSessions=1) を返す', () async {
      // Arrange
      mockRepo.progressToReturn = QuizSessionProgress(
        sessionDateMs: _todayMidnight(),
        remaining: 0,
        completedSessions: 1,
      );

      // Act: 6:00 時点なので時間解放 1 セッション
      final result = await useCase.call(now: DateTime(2026, 1, 1, 6, 0));

      // Assert
      expect(result, isA<SessionActionDone>());
      final done = result as SessionActionDone;
      expect(done.completedSessions, equals(1));
      expect(done.availableSessions, equals(1),
          reason: '6:00 時点で1セッションのみ解放済み（次は 12:00 まで待機）');
    });

    test('completed=3（dailySessionCount 上限）のとき SessionActionAllDone を返す', () async {
      // Arrange: 全3セッション完了済み
      mockRepo.progressToReturn = QuizSessionProgress(
        sessionDateMs: _todayMidnight(),
        remaining: 0,
        completedSessions: 3,
      );

      // Act
      final result = await useCase.call(now: DateTime(2026, 1, 1, 23, 0));

      // Assert
      expect(result, isA<SessionActionAllDone>());
      final allDone = result as SessionActionAllDone;
      expect(allDone.completedSessions, equals(3),
          reason: '全3セッション完了時は AllDone を返す');
    });

    test('sessionDateMs が昨日のとき clearSession() を呼び出して SessionActionStartNew を返す', () async {
      // Arrange: 昨日のセッションデータ
      mockRepo.progressToReturn = QuizSessionProgress(
        sessionDateMs: _yesterdayMidnight(),
        remaining: 3,
        completedSessions: 1,
      );

      // Act
      final result = await useCase.call(now: DateTime.now());

      // Assert: clearSession が呼ばれていること
      expect(mockRepo.cleared, isTrue,
          reason: '日付が変わったので古いセッションをクリアすべき');
      // 新規開始アクションが返ること
      expect(result, isA<SessionActionStartNew>(),
          reason: 'クリア後は新規開始アクションを返す');
    });

    test('unlockedExtraSessions=1, 6:00 のとき availableSessions=2 になる', () async {
      // Arrange: 完了1セッション + 手動解放1
      mockRepo.progressToReturn = QuizSessionProgress(
        sessionDateMs: _todayMidnight(),
        remaining: 0,
        completedSessions: 1,
        unlockedExtraSessions: 1,
      );

      // Act: 6:00 時点（時間解放1）+ 手動解放1 = 合計2
      final result = await useCase.call(now: DateTime(2026, 1, 1, 6, 0));

      // Assert
      expect(result, isA<SessionActionDone>());
      final done = result as SessionActionDone;
      expect(done.completedSessions, equals(1));
      expect(done.availableSessions, equals(2),
          reason: '時間解放1 + 手動解放1 = 2 セッション利用可能');
    });

    test('早朝 3:00 で completed=0 のとき SessionActionDone(completedSessions=0, availableSessions=0) を返す', () async {
      // Arrange: 今日セッション開始済み（remaining=0）だが完了数は 0
      mockRepo.progressToReturn = QuizSessionProgress(
        sessionDateMs: _todayMidnight(),
        remaining: 0,
        completedSessions: 0,
      );

      // Act: 3:00 時点では時間解放なし
      final result = await useCase.call(now: DateTime(2026, 1, 1, 3, 0));

      // Assert
      expect(result, isA<SessionActionDone>());
      final done = result as SessionActionDone;
      expect(done.completedSessions, equals(0));
      expect(done.availableSessions, equals(0),
          reason: '3:00 は最初の解放時刻 6:00 より前なので利用可能セッションなし');
    });
  });
}
