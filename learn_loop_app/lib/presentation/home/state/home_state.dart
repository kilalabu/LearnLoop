import 'package:freezed_annotation/freezed_annotation.dart';

part 'home_state.freezed.dart';

/// ホーム画面の状態
@freezed
sealed class HomeState with _$HomeState {
  const factory HomeState.loading() = HomeLoading;
  const factory HomeState.loaded(HomeData data) = HomeLoaded;
  const factory HomeState.error(String message) = HomeError;
}

/// ホーム画面の表示用データ
@freezed
abstract class HomeData with _$HomeData {
  const factory HomeData({
    required int pendingCount,
    required int totalCount,
    required int streak,
    required double accuracy, // 0.0 ~ 1.0
  }) = _HomeData;

  const HomeData._();

  /// 完了率
  double get completionRate =>
      totalCount > 0 ? (totalCount - pendingCount) / totalCount : 0.0;

  /// 正答率（パーセント表示用）
  int get accuracyPercent => (accuracy * 100).round();
}
