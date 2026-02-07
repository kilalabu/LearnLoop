import '../models/quiz.dart';

/// クイズリポジトリ インターフェース
abstract interface class QuizRepository {
  /// 今日出題すべきクイズを取得
  Future<List<Quiz>> getTodayQuizzes();

  /// IDでクイズを取得
  Future<Quiz?> getQuizById(String id);

  /// 全クイズ数を取得
  Future<int> getTotalQuizCount();
}
