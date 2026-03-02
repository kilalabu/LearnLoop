import 'package:flutter_test/flutter_test.dart';
import 'package:learn_loop_app/core/constants/quiz_constants.dart';
import 'package:learn_loop_app/domain/models/daily_stats_result.dart';
import 'package:learn_loop_app/domain/models/session_action.dart';
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
// テスト本体
// ---------------------------------------------------------------------------

void main() {
  group('ResolveSessionUseCase', () {
    late MockUserProgressRepository mockProgressRepo;
    late ResolveSessionUseCase useCase;

    setUp(() {
      mockProgressRepo = MockUserProgressRepository();
      useCase = ResolveSessionUseCase(mockProgressRepo);
    });

    test('回答数が 0 のとき SessionActionStartNew を返す', () async {
      // Arrange: 今日まだ1問も回答していない
      mockProgressRepo.answeredCount = 0;

      // Act
      final result = await useCase.call();

      // Assert
      expect(result, isA<SessionActionStartNew>(),
          reason: '回答なしの場合は新規開始アクションを返す');
    });

    test('回答数が 5 のとき SessionActionResume(remaining=7) を返す', () async {
      // Arrange: 1セッション内で5問回答済み（12問中7問残り）
      mockProgressRepo.answeredCount = 5;

      // Act
      final result = await useCase.call();

      // Assert
      expect(result, isA<SessionActionResume>());
      final resume = result as SessionActionResume;
      expect(resume.remaining, equals(QuizConstants.dailyLimit - 5),
          reason: 'remaining = dailyLimit(12) - 5 = 7');
    });

    test('回答数が 12（1セッション境界）のとき SessionActionStartNew を返す', () async {
      mockProgressRepo.answeredCount = QuizConstants.dailyLimit; // 12
      final result = await useCase.call();
      expect(result, isA<SessionActionStartNew>(),
          reason: 'セッション境界は解放ロックなしで即新規開始');
    });

    test('回答数が 36（全セッション完了）のとき SessionActionAllDone を返す', () async {
      // Arrange: 全3セッション × 12問 = 36問回答済み
      mockProgressRepo.answeredCount =
          QuizConstants.dailySessionCount * QuizConstants.dailyLimit; // 36

      // Act
      final result = await useCase.call();

      // Assert
      expect(result, isA<SessionActionAllDone>());
      final allDone = result as SessionActionAllDone;
      expect(allDone.completedSessions, equals(QuizConstants.dailySessionCount),
          reason: '全3セッション完了時は AllDone を返す');
    });
  });
}
