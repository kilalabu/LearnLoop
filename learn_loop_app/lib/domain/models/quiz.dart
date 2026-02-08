import 'package:freezed_annotation/freezed_annotation.dart';

part 'quiz.freezed.dart';

/// クイズモデル
@freezed
abstract class Quiz with _$Quiz {
  const factory Quiz({
    required String id,
    required String question,
    required List<QuizOption> options,
    required String explanation,
    String? sourceUrl,
    String? genre,
  }) = _Quiz;
}

/// クイズの選択肢
@freezed
abstract class QuizOption with _$QuizOption {
  const factory QuizOption({
    required String id,
    required String label,
    required String text,
    required bool isCorrect,
  }) = _QuizOption;
}
