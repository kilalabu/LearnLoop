import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/models/daily_answer_record.dart';

part 'history_state.freezed.dart';

@freezed
abstract class HistoryState with _$HistoryState {
  const factory HistoryState({
    required int totalRequired,
    required List<DailyAnswerRecord> history,
    required bool hasMore,
    @Default(false) bool isLoadingMore,
  }) = _HistoryState;
}
