import 'package:flutter_test/flutter_test.dart';
import 'package:learn_loop_app/core/constants/quiz_constants.dart';
import 'package:learn_loop_app/domain/models/daily_stats_result.dart';
import 'package:learn_loop_app/domain/models/session_action.dart';
import 'package:learn_loop_app/domain/repositories/quiz_session_repository.dart';
import 'package:learn_loop_app/domain/repositories/user_progress_repository.dart';
import 'package:learn_loop_app/domain/usecases/resolve_session_use_case.dart';

// ---------------------------------------------------------------------------
// テスト用モック: UserProgressRepository
// ---------------------------------------------------------------------------

/// 手動モック実装。今日の回答数を制御できる。
class MockUserProgressRepository implements UserProgressRepository {
  int answeredCount = 0;

  @override
  Future<int> getTodayAnsweredCount() async => answeredCount;

  @override
  Future<void> recordAnswer({required String quizId, required bool isCorrect}) async {}

  @override
  Future<void> hideQuiz({required String quizId}) async {}

  @override
  Future<UserStats> getStats() async =>
      const UserStats(streak: 0, accuracy: 0.0, totalAnswered: 0);

  @override
  Future<DailyStatsResult> getDailyStats({int limit = 20, int offset = 0}) {
    throw UnimplementedError();
  }
}

// ---------------------------------------------------------------------------
// テスト用モック: QuizSessionRepository
// ---------------------------------------------------------------------------

/// 手動モック実装。手動解放セッション数を制御できる。
class MockQuizSessionRepository implements QuizSessionRepository {
  int unlockedExtraSessions = 0;

  @override
  Future<int> getUnlockedExtraSessions() async => unlockedExtraSessions;

  @override
  Future<void> unlockNextSession() async {
    unlockedExtraSessions++;
  }
}

// ---------------------------------------------------------------------------
// テスト本体
// ---------------------------------------------------------------------------

void main() {
  group('ResolveSessionUseCase', () {
    late MockUserProgressRepository mockProgressRepo;
    late MockQuizSessionRepository mockSessionRepo;
    late ResolveSessionUseCase useCase;

    setUp(() {
      mockProgressRepo = MockUserProgressRepository();
      mockSessionRepo = MockQuizSessionRepository();
      useCase = ResolveSessionUseCase(mockProgressRepo, mockSessionRepo);
    });

    test('回答数が 0 のとき SessionActionStartNew を返す', () async {
      // Arrange: 今日まだ1問も回答していない
      mockProgressRepo.answeredCount = 0;

      // Act
      final result = await useCase.call(now: DateTime(2026, 1, 1, 10, 0));

      // Assert
      expect(result, isA<SessionActionStartNew>(),
          reason: '回答なしの場合は新規開始アクションを返す');
    });

    test('回答数が 5 のとき SessionActionResume(remaining=7) を返す', () async {
      // Arrange: 1セッション内で5問回答済み（12問中7問残り）
      mockProgressRepo.answeredCount = 5;

      // Act
      final result = await useCase.call(now: DateTime(2026, 1, 1, 10, 0));

      // Assert
      expect(result, isA<SessionActionResume>());
      final resume = result as SessionActionResume;
      expect(resume.remaining, equals(QuizConstants.dailyLimit - 5),
          reason: 'remaining = dailyLimit(12) - 5 = 7');
    });

    test('回答数が 12（1セッション完了）かつ 12:00 のとき SessionActionDone(completedSessions=1, availableSessions=2) を返す', () async {
      // Arrange: 1セッション分（12問）ちょうど回答済み
      mockProgressRepo.answeredCount = QuizConstants.dailyLimit; // 12

      // Act: 12:00 時点なので時間解放 2 セッション
      final result = await useCase.call(now: DateTime(2026, 1, 1, 12, 0));

      // Assert
      expect(result, isA<SessionActionDone>());
      final done = result as SessionActionDone;
      expect(done.completedSessions, equals(1));
      expect(done.availableSessions, equals(2),
          reason: '12:00 時点で2セッション解放済み');
    });

    test('回答数が 12 かつ 6:00 のとき SessionActionDone(completedSessions=1, availableSessions=1) を返す', () async {
      // Arrange: 1セッション完了済み
      mockProgressRepo.answeredCount = QuizConstants.dailyLimit; // 12

      // Act: 6:00 時点なので時間解放 1 セッション
      final result = await useCase.call(now: DateTime(2026, 1, 1, 6, 0));

      // Assert
      expect(result, isA<SessionActionDone>());
      final done = result as SessionActionDone;
      expect(done.completedSessions, equals(1));
      expect(done.availableSessions, equals(1),
          reason: '6:00 時点で1セッションのみ解放済み（次は 12:00 まで待機）');
    });

    test('回答数が 36（全セッション完了）のとき SessionActionAllDone を返す', () async {
      // Arrange: 全3セッション × 12問 = 36問回答済み
      mockProgressRepo.answeredCount =
          QuizConstants.dailySessionCount * QuizConstants.dailyLimit; // 36

      // Act
      final result = await useCase.call(now: DateTime(2026, 1, 1, 23, 0));

      // Assert
      expect(result, isA<SessionActionAllDone>());
      final allDone = result as SessionActionAllDone;
      expect(allDone.completedSessions, equals(QuizConstants.dailySessionCount),
          reason: '全3セッション完了時は AllDone を返す');
    });

    test('unlockedExtraSessions=1, 6:00 のとき availableSessions=2 になる', () async {
      // Arrange: 1セッション完了 + 手動解放1
      mockProgressRepo.answeredCount = QuizConstants.dailyLimit; // 12
      mockSessionRepo.unlockedExtraSessions = 1;

      // Act: 6:00 時点（時間解放1）+ 手動解放1 = 合計2
      final result = await useCase.call(now: DateTime(2026, 1, 1, 6, 0));

      // Assert
      expect(result, isA<SessionActionDone>());
      final done = result as SessionActionDone;
      expect(done.completedSessions, equals(1));
      expect(done.availableSessions, equals(2),
          reason: '時間解放1 + 手動解放1 = 2 セッション利用可能');
    });

    test('早朝 3:00 で 12問回答済みのとき SessionActionDone(availableSessions=0) を返す', () async {
      // Arrange: 1セッション完了済み
      mockProgressRepo.answeredCount = QuizConstants.dailyLimit; // 12

      // Act: 3:00 時点では時間解放なし
      final result = await useCase.call(now: DateTime(2026, 1, 1, 3, 0));

      // Assert
      expect(result, isA<SessionActionDone>());
      final done = result as SessionActionDone;
      expect(done.completedSessions, equals(1));
      expect(done.availableSessions, equals(0),
          reason: '3:00 は最初の解放時刻 6:00 より前なので利用可能セッションなし');
    });
  });
}
