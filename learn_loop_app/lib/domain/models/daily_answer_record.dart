import 'package:freezed_annotation/freezed_annotation.dart';

part 'daily_answer_record.freezed.dart';

/// 1日分の回答統計
@freezed
abstract class DailyAnswerRecord with _$DailyAnswerRecord {
  const factory DailyAnswerRecord({
    required String date, // 'YYYY-MM-DD'（JST）
    required int answeredCount,
    required int correctCount,
  }) = _DailyAnswerRecord;
}
