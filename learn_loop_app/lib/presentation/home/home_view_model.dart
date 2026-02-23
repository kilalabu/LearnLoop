import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/quiz_constants.dart';
import '../../domain/repositories/quiz_repository.dart';
import '../../domain/repositories/user_progress_repository.dart';
import '../../data/repositories/quiz_repository_impl.dart';
import '../../data/repositories/quiz_session_repository_impl.dart';
import '../../data/repositories/user_progress_repository_impl.dart';
import 'state/home_state.dart';

// Repository Providers
final quizRepositoryProvider = Provider<QuizRepository>(
  (ref) => QuizRepositoryImpl(),
);

final userProgressRepositoryProvider = Provider<UserProgressRepository>(
  (ref) => UserProgressRepositoryImpl(),
);

// ViewModel Provider
final homeViewModelProvider = AsyncNotifierProvider<HomeViewModel, HomeData>(
  HomeViewModel.new,
);

class HomeViewModel extends AsyncNotifier<HomeData> {
  @override
  Future<HomeData> build() async {
    return _loadHomeData();
  }

  Future<HomeData> _loadHomeData() async {
    final quizRepo = ref.read(quizRepositoryProvider);
    final sessionRepo = ref.read(quizSessionRepositoryProvider);

    final sw = Stopwatch()..start();
    final progress = await sessionRepo.getSessionProgress();

    debugPrint('[HOME] getSummary start: ${sw.elapsedMilliseconds}ms');
    final summary = await quizRepo.getSummary();
    debugPrint('[HOME] getSummary done: ${sw.elapsedMilliseconds}ms');

    // 完了率 = 回答済み問題数 / 1日の総問題数 (dailySessionCount * dailyLimit)
    final completed = progress?.completedSessions ?? 0;
    final remaining = progress?.remaining ?? QuizConstants.dailyLimit;
    final totalQuestions =
        QuizConstants.dailySessionCount * QuizConstants.dailyLimit; // 36
    final answeredSoFar =
        (completed * QuizConstants.dailyLimit) +
        (QuizConstants.dailyLimit - remaining);
    final completionRate = totalQuestions > 0
        ? answeredSoFar.clamp(0, totalQuestions) / totalQuestions
        : 0.0;
    final pendingCount =
        totalQuestions - answeredSoFar.clamp(0, totalQuestions);

    return HomeData(
      pendingCount: pendingCount,
      totalCount: summary.count,
      streak: summary.streak,
      accuracy: summary.accuracy,
      completionRate: completionRate,
    );
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _loadHomeData());
  }
}
