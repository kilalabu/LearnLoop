import 'package:supabase_flutter/supabase_flutter.dart';

import '../../domain/models/quiz.dart';
import '../../domain/repositories/quiz_repository.dart';
import '../api/api_client.dart';

/// API経由のクイズリポジトリ実装
class QuizRepositoryImpl implements QuizRepository {
  final ApiClient _apiClient;

  QuizRepositoryImpl()
    : _apiClient = ApiClient(supabase: Supabase.instance.client);

  List<Quiz>? _cachedQuizzes;

  @override
  Future<List<Quiz>> getTodayQuizzes() async {
    final data = await _apiClient.get('/api/quiz/today');
    final quizzes = (data['quizzes'] as List)
        .map(
          (json) => Quiz(
            id: json['id'],
            question: json['question'],
            options: (json['options'] as List)
                .map(
                  (o) => QuizOption(
                    id: o['id'],
                    label: o['label'],
                    text: o['text'],
                    isCorrect: o['isCorrect'],
                  ),
                )
                .toList(),
            explanation: json['explanation'],
            sourceUrl: json['sourceUrl'],
            genre: json['genre'],
            type: switch (json['type']) {
              'new' => QuizType.newQuiz,
              'review' => QuizType.review,
              _ => null,
            },
          ),
        )
        .toList();
    _cachedQuizzes = quizzes;
    return quizzes;
  }

  @override
  Future<Quiz?> getQuizById(String id) async {
    _cachedQuizzes ??= await getTodayQuizzes();
    return _cachedQuizzes!.where((q) => q.id == id).firstOrNull;
  }

  @override
  Future<int> getTotalQuizCount() async {
    final data = await _apiClient.get('/api/quiz/count');
    return data['count'] as int;
  }
}
