import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/quiz_constants.dart';
import '../../domain/models/home_summary.dart';
import '../../domain/repositories/quiz_repository.dart';
import '../../domain/repositories/user_progress_repository.dart';
import '../../data/repositories/quiz_repository_impl.dart';
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
    final progressRepo = ref.read(userProgressRepositoryProvider);

    // DB から今日の回答数と問題サマリーを並列取得
    final results = await Future.wait([
      progressRepo.getTodayAnsweredCount(),
      quizRepo.getSummary(),
    ]);
    final answeredCount = results[0] as int;
    final summary = results[1] as HomeSummary;

    // 完了率 = 今日の回答済み問題数 / 1日の総問題数 (36)
    const totalQuestions =
        QuizConstants.dailySessionCount * QuizConstants.dailyLimit;
    final completionRate =
        answeredCount.clamp(0, totalQuestions) / totalQuestions;

    return HomeData(
      pendingCount: totalQuestions - answeredCount.clamp(0, totalQuestions),
      totalCount: summary.count,
      streak: summary.streak,
      accuracy: summary.accuracy,
      completionRate: completionRate,
      newQuestionCount: summary.unansweredCount,
    );
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _loadHomeData());
  }
}
