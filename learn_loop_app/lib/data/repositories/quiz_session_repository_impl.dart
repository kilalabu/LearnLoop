import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:learn_loop_app/domain/repositories/quiz_session_repository.dart';

/// インメモリのクイズセッションリポジトリ実装
/// DB 移行後は unlock 状態のみをメモリ管理する（SharedPreferences 依存ゼロ）
/// アプリ再起動後は unlockedExtraSessions がリセットされるが、これは許容済み
class QuizSessionRepositoryImpl implements QuizSessionRepository {
  // インメモリで管理（永続化しない）
  int _unlockedExtraSessions = 0;

  @override
  Future<int> getUnlockedExtraSessions() async {
    return _unlockedExtraSessions;
  }

  @override
  Future<void> unlockNextSession() async {
    _unlockedExtraSessions++;
  }

}

/// クイズセッションリポジトリのプロバイダー
final quizSessionRepositoryProvider = Provider<QuizSessionRepository>(
  (ref) => QuizSessionRepositoryImpl(),
);
