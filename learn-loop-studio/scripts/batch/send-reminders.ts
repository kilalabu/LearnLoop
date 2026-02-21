// scripts/batch/send-reminders.ts
// Push通知 Phase 1: FCM リマインダー配信バッチ
// GitHub Actions の cron（UTC 23:00, 03:00, 10:00）から実行される
// JST 08:00, 12:00, 19:00 に相当

import { loadEnvConfig } from '@next/env';
// tsconfig の paths 解決のため、ルートディレクトリを指定
loadEnvConfig(process.cwd());

import * as admin from 'firebase-admin';
import { createServiceClient } from '@/lib/supabase/client';
import { SlackNotifier } from '../lib/slack-notifier';

// 配信枠の幅（分）: cron 実行から何分前まで「同じ枠」とみなすか
// 二重送信防止の判定に使用する
const WINDOW_MINUTES = 60;

// RPC get_reminder_targets の戻り値型
// streak は TypeScript 側で計算して後から付与するため含まれない
type ReminderTarget = {
  user_id: string;
  token: string;
  unanswered_count: number;
};

// ストリーク計算ユーティリティ
// progress-repository.ts の calculateStreak と同じロジックをポートしている
// アプリのストリーク表示と通知文言が常に一致するよう、同一アルゴリズムを使用する
function calculateStreak(lastAnsweredDates: string[]): number {
  if (lastAnsweredDates.length === 0) return 0;

  // JST の「今日」と「昨日」の日付文字列を算出
  const nowJST = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
  const today = toDateStr(nowJST);
  const yesterday = toDateStr(new Date(nowJST.getTime() - 86400000));

  // 重複を排除して降順ソート（最新日が先頭）
  const uniqueDays = [...new Set(lastAnsweredDates)].sort().reverse();

  // 直近の学習が今日か昨日でなければストリーク 0
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

async function main() {
  const DRY_RUN = process.argv.includes('--dry-run');
  const slack = new SlackNotifier();

  // Firebase Admin 初期化
  // FCM_SERVICE_ACCOUNT_JSON_B64 は Base64 エンコードされたサービスアカウント JSON
  // GitHub Actions secrets でのYAMLパースエラーを避けるため Base64 を採用
  const fcmJson = Buffer.from(process.env.FCM_SERVICE_ACCOUNT_JSON_B64 ?? 'e30=', 'base64').toString('utf8');
  const serviceAccount = JSON.parse(fcmJson);
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  const supabase = createServiceClient();
  const now = new Date();
  // 配信枠の開始時刻: 現在時刻から WINDOW_MINUTES 前
  // この時刻以降に通知済みのユーザーは今回の配信から除外される（二重送信防止）
  const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);

  console.log(`=== Reminder Batch Started (${DRY_RUN ? 'DRY-RUN' : 'LIVE'}) ===`);
  console.log(`Time: ${now.toISOString()}`);
  console.log(`Window Start: ${windowStart.toISOString()}`);

  // Step 1: 配信対象取得（RPC 呼び出し）
  // user_id, token, unanswered_count を返す。ストリークは含まれない
  const { data: targets, error } = await supabase.rpc('get_reminder_targets', {
    p_current_time: now.toISOString(),
    p_window_start: windowStart.toISOString(),
  }) as { data: ReminderTarget[] | null; error: unknown };

  if (error) {
    console.error('RPC エラー:', error);
    await slack.notifyFatalError(new Error(`get_reminder_targets failed: ${JSON.stringify(error)}`));
    process.exit(1);
  }

  if (!targets || targets.length === 0) {
    console.log('配信対象者なし。終了します。');
    return;
  }

  console.log(`配信対象: ${targets.length} 件`);

  // Step 2: 対象ユーザーの last_answered_at を一括取得してストリークを計算
  // N+1 を避けるため WHERE user_id IN (...) で1クエリにまとめる
  const targetUserIds = targets.map((t) => t.user_id);
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('user_id, last_answered_at')
    .in('user_id', targetUserIds)
    .not('last_answered_at', 'is', null);

  // user_id ごとに last_answered_at の JST 日付リストを集約
  // 同一ユーザーの複数問題から日付一覧を作成し、ストリーク計算に使用する
  const answeredDatesByUser = new Map<string, string[]>();
  for (const row of progressData ?? []) {
    // UTC の last_answered_at を JST 日付文字列（YYYY-MM-DD）に変換
    const jstDate = new Date(new Date(row.last_answered_at).getTime() + 9 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);
    if (!answeredDatesByUser.has(row.user_id)) {
      answeredDatesByUser.set(row.user_id, []);
    }
    answeredDatesByUser.get(row.user_id)!.push(jstDate);
  }

  // 各ターゲットにストリークを付与
  const targetsWithStreak = targets.map((t) => ({
    ...t,
    streak: calculateStreak(answeredDatesByUser.get(t.user_id) ?? []),
  }));

  const successUserIds: string[] = [];
  const invalidTokens: string[] = [];

  // Step 3: FCM 送信ループ
  for (const target of targetsWithStreak) {
    const message: admin.messaging.Message = {
      token: target.token,
      notification: {
        title: '学習の時間です',
        body: `今日で ${target.streak} 日連続！未回答が ${target.unanswered_count} 問あります`,
      },
      android: {
        notification: {
          // タップ時にアプリのホーム画面を起動する
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
    };

    if (DRY_RUN) {
      console.log(`[DRY-RUN] Would send to user ${target.user_id}: streak=${target.streak}, count=${target.unanswered_count}`);
      successUserIds.push(target.user_id);
      continue;
    }

    try {
      await admin.messaging().send(message);
      successUserIds.push(target.user_id);
      console.log(`送信成功: user=${target.user_id}`);
    } catch (err: unknown) {
      const fcmError = err as { code?: string };
      if (fcmError.code === 'messaging/registration-token-not-registered') {
        // 無効なトークンは後で削除対象としてマーク
        invalidTokens.push(target.token);
        console.warn(`無効トークン検出: token=${target.token.slice(0, 20)}...`);
      } else {
        console.error(`送信失敗: user=${target.user_id}`, err);
      }
    }
  }

  // Step 4: last_notified_at 更新（送信成功ユーザーのみ）
  // 次の配信枠で二重送信されないよう記録する
  if (successUserIds.length > 0 && !DRY_RUN) {
    const { error: upsertError } = await supabase
      .from('user_notification_settings')
      .upsert(
        successUserIds.map((userId) => ({
          user_id: userId,
          last_notified_at: now.toISOString(),
        })),
        { onConflict: 'user_id' }
      );
    if (upsertError) {
      console.error('last_notified_at 更新エラー:', upsertError);
    }
  }

  // Step 5: 無効トークン削除
  // FCM から "registration-token-not-registered" が返ったトークンを DB から削除する
  if (invalidTokens.length > 0 && !DRY_RUN) {
    const { error: deleteError } = await supabase
      .from('user_push_tokens')
      .delete()
      .in('token', invalidTokens);
    if (deleteError) {
      console.error('無効トークン削除エラー:', deleteError);
    } else {
      console.log(`無効トークン削除: ${invalidTokens.length} 件`);
    }
  }

  console.log(`=== 完了: 成功=${successUserIds.length}, 無効トークン削除=${invalidTokens.length} ===`);
}

main().catch(async (err) => {
  console.error('Fatal Error:', err);
  const slack = new SlackNotifier();
  await slack.notifyFatalError(err instanceof Error ? err : new Error(String(err)));
  process.exit(1);
});
