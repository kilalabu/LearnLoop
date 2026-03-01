import 'package:freezed_annotation/freezed_annotation.dart';
import 'daily_answer_record.dart';

part 'daily_stats_result.freezed.dart';

/// daily-stats API のレスポンス全体
@freezed
abstract class DailyStatsResult with _$DailyStatsResult {
  const factory DailyStatsResult({
    required int totalRequired,
    required List<DailyAnswerRecord> history,
    required bool hasMore,
  }) = _DailyStatsResult;
}
