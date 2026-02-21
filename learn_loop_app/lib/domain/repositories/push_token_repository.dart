/// FCM トークン管理のリポジトリインターフェース
abstract class PushTokenRepository {
  /// FCM トークンを Supabase の user_push_tokens テーブルに Upsert する
  Future<void> upsertToken({required String token, required String deviceType});

  /// 無効になったトークンを DB から削除する
  Future<void> deleteToken({required String token});
}
