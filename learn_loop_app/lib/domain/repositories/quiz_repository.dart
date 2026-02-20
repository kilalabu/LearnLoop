import '../models/quiz.dart';

/// クイズリポジトリ インターフェース
abstract interface class QuizRepository {
  /// 今日出題すべきクイズを取得
  /// [limit] を指定すると取得件数を制限できる
  Future<List<Quiz>> getTodayQuizzes({int? limit});

  /// IDでクイズを取得
  Future<Quiz?> getQuizById(String id);

  /// 全クイズ数を取得
  Future<int> getTotalQuizCount();
}
