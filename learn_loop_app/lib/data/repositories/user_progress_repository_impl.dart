import 'package:supabase_flutter/supabase_flutter.dart';

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
  Future<UserStats> getStats() async {
    final data = await _apiClient.get('/api/quiz/stats');
    return UserStats(
      streak: data['streak'] as int,
      accuracy: (data['accuracy'] as num).toDouble(),
      totalAnswered: data['totalAnswered'] as int,
    );
  }
}
