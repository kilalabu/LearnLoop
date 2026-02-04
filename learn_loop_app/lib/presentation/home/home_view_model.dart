import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/problem_repository.dart';
import '../../domain/repositories/user_progress_repository.dart';
import '../../data/repositories/problem_repository_impl.dart';
import '../../data/repositories/user_progress_repository_impl.dart';
import 'state/home_state.dart';

// Repository Providers
final problemRepositoryProvider = Provider<ProblemRepository>(
  (ref) => FakeProblemRepository(),
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
    final problemRepo = ref.read(problemRepositoryProvider);
    final progressRepo = ref.read(userProgressRepositoryProvider);

    final problems = await problemRepo.getTodayProblems();
    final totalCount = await problemRepo.getTotalProblemCount();
    final stats = await progressRepo.getStats();

    return HomeData(
      pendingCount: problems.length,
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
