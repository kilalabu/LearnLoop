import '../models/problem.dart';

/// 問題リポジトリ インターフェース
abstract interface class ProblemRepository {
  /// 今日出題すべき問題を取得
  Future<List<Problem>> getTodayProblems();

  /// IDで問題を取得
  Future<Problem?> getProblemById(String id);

  /// 全問題数を取得
  Future<int> getTotalProblemCount();
}
