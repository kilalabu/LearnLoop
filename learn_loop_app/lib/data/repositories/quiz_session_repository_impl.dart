import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/repositories/quiz_session_repository.dart';

/// SharedPreferences を使ったクイズセッションリポジトリ実装
class QuizSessionRepositoryImpl implements QuizSessionRepository {
  // SharedPreferences のキー定数
  static const _keyDate = 'quiz_session_date';
  static const _keyRemaining = 'quiz_session_remaining';
  static const _keyCompleted = 'quiz_session_completed';
  static const _keyUnlocked = 'quiz_session_unlocked';

  @override
  Future<QuizSessionProgress?> getSessionProgress() async {
    final prefs = await SharedPreferences.getInstance();
    final date = prefs.getInt(_keyDate);

    // 日付が保存されていなければセッションなし
    if (date == null) return null;

    return QuizSessionProgress(
      sessionDateMs: date,
      remaining: prefs.getInt(_keyRemaining) ?? 0,
      completedSessions: prefs.getInt(_keyCompleted) ?? 0,
      unlockedExtraSessions: prefs.getInt(_keyUnlocked) ?? 0,
    );
  }

  @override
  Future<void> saveSession({required int remainingCount}) async {
    final prefs = await SharedPreferences.getInstance();

    // 今日の深夜0時の millisecondsSinceEpoch を保存
    final now = DateTime.now();
    final todayMidnight = DateTime(
      now.year,
      now.month,
      now.day,
    ).millisecondsSinceEpoch;

    await prefs.setInt(_keyDate, todayMidnight);
    await prefs.setInt(_keyRemaining, remainingCount);
  }

  @override
  Future<void> decrementRemaining() async {
    final prefs = await SharedPreferences.getInstance();
    final current = prefs.getInt(_keyRemaining) ?? 0;
    if (current > 0) {
      await prefs.setInt(_keyRemaining, current - 1);
    }
  }

  @override
  Future<void> incrementCompletedSessions() async {
    final prefs = await SharedPreferences.getInstance();
    final current = prefs.getInt(_keyCompleted) ?? 0;
    await prefs.setInt(_keyCompleted, current + 1);
  }

  @override
  Future<void> unlockNextSession() async {
    final prefs = await SharedPreferences.getInstance();
    final current = prefs.getInt(_keyUnlocked) ?? 0;
    await prefs.setInt(_keyUnlocked, current + 1);
  }

  @override
  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyDate);
    await prefs.remove(_keyRemaining);
    await prefs.remove(_keyCompleted);
    await prefs.remove(_keyUnlocked);
  }
}

/// クイズセッションリポジトリのプロバイダー
final quizSessionRepositoryProvider = Provider<QuizSessionRepository>(
  (ref) => QuizSessionRepositoryImpl(),
);
