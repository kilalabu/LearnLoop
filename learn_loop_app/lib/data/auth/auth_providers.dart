import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/push_notification_service.dart';
import 'auth_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(Supabase.instance.client);
});

final authStateProvider = StreamProvider<AuthState>((ref) {
  final stream = ref.watch(authServiceProvider).authStateChanges;

  // サインイン成功時に FCM トークンを DB に登録する
  // Stream を map で変換し、副作用として PushNotificationService を呼び出す
  return stream.asyncMap((authState) async {
    // signedIn: 新規ログイン時
    // initialSession: アプリ起動時に既存セッションが復元された場合
    if (authState.event == AuthChangeEvent.signedIn ||
        authState.event == AuthChangeEvent.initialSession) {
      await PushNotificationService().initialize();
    }
    return authState;
  });
});
