import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/repositories/push_token_repository.dart';

/// Supabase の user_push_tokens テーブルへ FCM トークンを保存する実装
class PushTokenRepositoryImpl implements PushTokenRepository {
  final SupabaseClient _supabase;

  PushTokenRepositoryImpl() : _supabase = Supabase.instance.client;

  @override
  Future<void> upsertToken({
    required String token,
    required String deviceType,
  }) async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return; // 未認証の場合は何もしない

    await _supabase.from('user_push_tokens').upsert({
      'token': token,
      'user_id': userId,
      'device_type': deviceType,
    });
  }

  @override
  Future<void> deleteToken({required String token}) async {
    await _supabase.from('user_push_tokens').delete().eq('token', token);
  }
}
