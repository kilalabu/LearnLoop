import 'package:firebase_messaging/firebase_messaging.dart';
import '../repositories/push_token_repository_impl.dart';

/// FCM Push通知の初期化とトークン管理を担うサービス
///
/// 呼び出しタイミング:
/// - ログイン成功時に initialize() を呼び出してトークンを DB に登録する
/// - アプリ起動時（認証済みの場合）にも initialize() を呼び出す
class PushNotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final PushTokenRepositoryImpl _repository = PushTokenRepositoryImpl();

  /// 初期化: 通知権限リクエスト → トークン取得 → DB 登録 → リフレッシュ監視
  Future<void> initialize() async {
    // システムの通知許可ダイアログを表示する（初回のみ表示される）
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      // ユーザーが拒否した場合はトークン登録しない
      return;
    }

    // FCM デバイストークンを取得して DB に登録
    final token = await _messaging.getToken();
    if (token != null) {
      await _registerToken(token);
    }

    // トークンが更新されたとき（アプリの再インストール等）に自動で再登録する
    _messaging.onTokenRefresh.listen(_registerToken);

    // フォアグラウンド受信: （バナー等は表示しない）
    FirebaseMessaging.onMessage.listen((_) {
      // 意図的に何もしない
    });

    // バックグラウンド状態から通知タップでフォアグラウンドに復帰したとき
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationOpen);

    // アプリがキルされた状態から通知タップでコールドスタートしたとき
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationOpen(initialMessage);
    }
  }

  Future<void> _registerToken(String token) async {
    // Android 固定（iOS対応は後回し）
    await _repository.upsertToken(token: token, deviceType: 'android');
  }

  /// 通知タップ時の共通ハンドラー（バックグラウンド復帰・コールドスタート両方で呼ばれる）
  void _handleNotificationOpen(RemoteMessage message) {
    // 受信した通知の内容をログに出力（デバッグ用）
    // ignore: avoid_print
    print('[PushNotification] tapped: title=${message.notification?.title}, data=${message.data}');
    // TODO: 必要に応じてナビゲーション処理を追加する
  }
}
