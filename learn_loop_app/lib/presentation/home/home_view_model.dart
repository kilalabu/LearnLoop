import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/quiz_repository.dart';
import '../../domain/repositories/user_progress_repository.dart';
import '../../data/repositories/quiz_repository_impl.dart';
import '../../data/repositories/user_progress_repository_impl.dart';
import 'state/home_state.dart';

// Repository Providers
final quizRepositoryProvider = Provider<QuizRepository>(
  (ref) => FakeQuizRepository(),
);

final userProgressRepositoryProvider = Provider<UserProgressRepository>(
  (ref) => FakeUserProgressRepository(),
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

    final quizzes = await quizRepo.getTodayQuizzes();
    final totalCount = await quizRepo.getTotalQuizCount();
    final stats = await progressRepo.getStats();

    return HomeData(
      pendingCount: quizzes.length,
      totalCount: totalCount,
      streak: stats.streak,
      accuracy: stats.accuracy,
    );
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _loadHomeData());
  }
}
