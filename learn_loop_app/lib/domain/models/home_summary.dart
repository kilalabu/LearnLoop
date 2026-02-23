import 'package:freezed_annotation/freezed_annotation.dart';

part 'home_summary.freezed.dart';

/// サマリーデータ
@freezed
abstract class HomeSummary with _$HomeSummary {
  const factory HomeSummary({
    required int count,
    required int streak,
    required double accuracy,
    required int totalAnswered,
  }) = _HomeSummary;
}
