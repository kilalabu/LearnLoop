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

  @override
  Future<int> getTodayAnsweredCount() async {
    // 今日の日付を JST で 'YYYY-MM-DD' 形式に変換
    // Flutter 側で UTC+9 に変換する（サーバーの JST 基準と合わせるため）
    final now = DateTime.now();
    final jstNow = now.toUtc().add(const Duration(hours: 9));
    final todayJst =
        '${jstNow.year.toString().padLeft(4, '0')}'
        '-${jstNow.month.toString().padLeft(2, '0')}'
        '-${jstNow.day.toString().padLeft(2, '0')}';

    final data = await _apiClient.get(
      '/api/quiz/daily-stats?limit=1&offset=0&date=$todayJst',
    );
    final history = data['history'] as List;
    if (history.isEmpty) return 0;

    // 今日のデータが存在すれば answeredCount を返す
    return (history.first['answeredCount'] as int);
  }
}
