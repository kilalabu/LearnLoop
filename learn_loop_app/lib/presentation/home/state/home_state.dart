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
    required double completionRate, // 完了率 0.0 ~ 1.0
    required int newQuestionCount, // 新規問題数（learning_status='unanswered' の問題数）
  }) = _HomeData;
}
