import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../home/home_view_model.dart'; // userProgressRepositoryProvider を再利用
import 'history_state.dart';

final historyViewModelProvider =
    AsyncNotifierProvider<HistoryViewModel, HistoryState>(HistoryViewModel.new);

class HistoryViewModel extends AsyncNotifier<HistoryState> {
  static const int _pageSize = 20;

  @override
  Future<HistoryState> build() async {
    // 初回ロード: offset=0, limit=20
    final repo = ref.read(userProgressRepositoryProvider);
    final result = await repo.getDailyStats(limit: _pageSize, offset: 0);
    return HistoryState(
      totalRequired: result.totalRequired,
      history: result.history,
      hasMore: result.hasMore,
    );
  }

  /// 追加ロード: 既存リストに追記する
  Future<void> loadMore() async {
    final current = state.value;
    if (current == null || current.isLoadingMore || !current.hasMore) return;

    state = AsyncData(current.copyWith(isLoadingMore: true));

    try {
      final repo = ref.read(userProgressRepositoryProvider);
      final result = await repo.getDailyStats(
        limit: _pageSize,
        offset: current.history.length,
      );
      state = AsyncData(
        current.copyWith(
          history: [...current.history, ...result.history],
          hasMore: result.hasMore,
          isLoadingMore: false,
        ),
      );
    } catch (e, st) {
      // isLoadingMore を false に戻してエラー状態にはしない（一覧は維持）
      // ignore: unused_local_variable
      final _ = st;
      state = AsyncData(current.copyWith(isLoadingMore: false));
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(userProgressRepositoryProvider);
      final result = await repo.getDailyStats(limit: _pageSize, offset: 0);
      return HistoryState(
        totalRequired: result.totalRequired,
        history: result.history,
        hasMore: result.hasMore,
      );
    });
  }
}
