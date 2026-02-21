import 'package:learn_loop_app/domain/repositories/quiz_session_repository.dart';

/// アプリ起動時に日付が変わっていたらセッションをリセットするユースケース
class ResetSessionIfDateChangedUseCase {
  final QuizSessionRepository _sessionRepo;

  const ResetSessionIfDateChangedUseCase(this._sessionRepo);

  Future<void> call() async {
    final progress = await _sessionRepo.getSessionProgress();
    if (progress == null) return;

    final now = DateTime.now();
    final todayMidnight = DateTime(now.year, now.month, now.day)
        .millisecondsSinceEpoch;

    if (todayMidnight > progress.sessionDateMs) {
      await _sessionRepo.clearSession();
    }
  }
}
