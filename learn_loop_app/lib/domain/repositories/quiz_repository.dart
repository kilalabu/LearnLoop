import '../models/home_summary.dart';
import '../models/quiz.dart';

/// クイズリポジトリ インターフェース
abstract interface class QuizRepository {
  /// 今日出題すべきクイズを取得
  /// [limit] 取得件数（必須）
  Future<List<Quiz>> getTodayQuizzes({required int limit});

  /// IDでクイズを取得
  Future<Quiz?> getQuizById(String id);

  /// サマリーを1リクエストで取得
  Future<HomeSummary> getSummary();
}
