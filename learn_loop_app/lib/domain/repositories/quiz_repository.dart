import '../models/quiz.dart';

/// クイズリポジトリ インターフェース
abstract interface class QuizRepository {
  /// 今日出題すべきクイズを取得
  /// [limit] 取得件数（必須）
  Future<List<Quiz>> getTodayQuizzes({required int limit});

  /// IDでクイズを取得
  Future<Quiz?> getQuizById(String id);

  /// 全クイズ数を取得
  Future<int> getTotalQuizCount();
}
