import 'package:supabase_flutter/supabase_flutter.dart';

import '../../domain/models/daily_answer_record.dart';
import '../../domain/models/daily_stats_result.dart';
import '../../domain/repositories/user_progress_repository.dart';
import '../api/api_client.dart';

/// API経由のユーザー進捗リポジトリ実装
class UserProgressRepositoryImpl implements UserProgressRepository {
  final ApiClient _apiClient;

  UserProgressRepositoryImpl()
    : _apiClient = ApiClient(supabase: Supabase.instance.client);

  @override
  Future<void> recordAnswer({
    required String quizId,
    required bool isCorrect,
  }) async {
    await _apiClient.post('/api/quiz/answer', {
      'quizId': quizId,
      'isCorrect': isCorrect,
    });
  }

  @override
  Future<void> hideQuiz({required String quizId}) async {
    await _apiClient.patch('/api/quiz/$quizId/progress', {'isHidden': true});
  }

  @override
  Future<UserStats> getStats() async {
    final data = await _apiClient.get('/api/quiz/stats');
    return UserStats(
      streak: data['streak'] as int,
      accuracy: (data['accuracy'] as num).toDouble(),
      totalAnswered: data['totalAnswered'] as int,
    );
  }

  @override
  Future<DailyStatsResult> getDailyStats({
    int limit = 20,
    int offset = 0,
  }) async {
    final data = await _apiClient.get(
      '/api/quiz/daily-stats?limit=$limit&offset=$offset',
    );
    return DailyStatsResult(
      totalRequired: data['totalRequired'] as int,
      history: (data['history'] as List)
          .map(
            (e) => DailyAnswerRecord(
              date: e['date'] as String,
              answeredCount: e['answeredCount'] as int,
              correctCount: e['correctCount'] as int,
            ),
          )
          .toList(),
      hasMore: data['hasMore'] as bool,
    );
  }
}
