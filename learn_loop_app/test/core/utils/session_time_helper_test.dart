import 'package:flutter_test/flutter_test.dart';
import 'package:learn_loop_app/core/utils/session_time_helper.dart';

void main() {
  group('SessionTimeHelper.availableSessionsByTime', () {
    // -------------------------------------------------------------------------
    // 境界値: 5:59 → セッション解放なし（最初の解放時刻 6:00 の直前）
    // -------------------------------------------------------------------------
    test('5:59 では利用可能セッション数が 0 になる', () {
      final result = SessionTimeHelper.availableSessionsByTime(
        DateTime(2026, 1, 1, 5, 59),
      );
      expect(result, equals(0), reason: '6:00 未満なのでセッションは解放されていない');
    });

    // -------------------------------------------------------------------------
    // 境界値: 6:00 → 第1セッション解放（sessionUnlockHours[0] = 6）
    // -------------------------------------------------------------------------
    test('6:00 では利用可能セッション数が 1 になる', () {
      final result = SessionTimeHelper.availableSessionsByTime(
        DateTime(2026, 1, 1, 6, 0),
      );
      expect(result, equals(1), reason: '6:00 ちょうどで第1セッションが解放される');
    });

    // -------------------------------------------------------------------------
    // 境界値: 12:00 → 第2セッション解放（sessionUnlockHours[1] = 12）
    // -------------------------------------------------------------------------
    test('12:00 では利用可能セッション数が 2 になる', () {
      final result = SessionTimeHelper.availableSessionsByTime(
        DateTime(2026, 1, 1, 12, 0),
      );
      expect(result, equals(2), reason: '12:00 ちょうどで第2セッションが解放される');
    });

    // -------------------------------------------------------------------------
    // 境界値: 18:00 → 第3セッション解放（sessionUnlockHours[2] = 18）
    // -------------------------------------------------------------------------
    test('18:00 では利用可能セッション数が 3 になる', () {
      final result = SessionTimeHelper.availableSessionsByTime(
        DateTime(2026, 1, 1, 18, 0),
      );
      expect(result, equals(3), reason: '18:00 ちょうどで第3セッションが解放される');
    });

    // -------------------------------------------------------------------------
    // 23:59 → 上限の 3 のまま（1日の最大解放数は dailySessionCount=3）
    // -------------------------------------------------------------------------
    test('23:59 では利用可能セッション数が 3 になる', () {
      final result = SessionTimeHelper.availableSessionsByTime(
        DateTime(2026, 1, 1, 23, 59),
      );
      expect(result, equals(3), reason: '23:59 でも上限 3 を超えない');
    });
  });

  group('SessionTimeHelper.totalAvailableSessions', () {
    // -------------------------------------------------------------------------
    // 手動解放（unlockedExtra）が上乗せされても上限 3 で clamp されること
    // -------------------------------------------------------------------------
    test('手動解放数が多くても合計は dailySessionCount(3) を超えない', () {
      // 6:00 時点では時間解放が 1 セッション。手動解放 5 を加算しても上限 3 で clamp。
      final result = SessionTimeHelper.totalAvailableSessions(
        DateTime(2026, 1, 1, 6, 0),
        5,
      );
      expect(result, equals(3), reason: '時間解放1 + 手動解放5 = 6 だが上限 3 で clamp される');
    });

    // -------------------------------------------------------------------------
    // 手動解放なし（unlockedExtra=0）の場合は時間解放のみ
    // -------------------------------------------------------------------------
    test('手動解放なしの場合は時間解放のみが反映される', () {
      // 12:00 時点では時間解放が 2 セッション
      final result = SessionTimeHelper.totalAvailableSessions(
        DateTime(2026, 1, 1, 12, 0),
        0,
      );
      expect(result, equals(2));
    });

    // -------------------------------------------------------------------------
    // 手動解放が時間解放と合算されて上限未満になる通常ケース
    // -------------------------------------------------------------------------
    test('時間解放 1 + 手動解放 1 = 2 になる', () {
      // 6:00 時点での時間解放 1 + 手動解放 1 = 合計 2
      final result = SessionTimeHelper.totalAvailableSessions(
        DateTime(2026, 1, 1, 6, 0),
        1,
      );
      expect(result, equals(2));
    });
  });
}
