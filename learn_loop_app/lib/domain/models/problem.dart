import 'package:freezed_annotation/freezed_annotation.dart';

part 'problem.freezed.dart';

/// 問題モデル
@freezed
abstract class Problem with _$Problem {
  const factory Problem({
    required String id,
    required String question,
    required List<ProblemOption> options,
    required String explanation,
    String? sourceText,
    String? sourceUrl,
    String? genre,
  }) = _Problem;
}

/// 問題の選択肢
@freezed
abstract class ProblemOption with _$ProblemOption {
  const factory ProblemOption({
    required String id,
    required String label,
    required String text,
    required bool isCorrect,
  }) = _ProblemOption;
}
