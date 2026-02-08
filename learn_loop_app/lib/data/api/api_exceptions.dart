/// API通信の基底例外
class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException({required this.statusCode, required this.message});

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// 401 Unauthorized — セッション切れ・無効なトークン
class UnauthorizedException extends ApiException {
  UnauthorizedException()
      : super(statusCode: 401, message: '認証が必要です。再ログインしてください。');
}

/// ネットワーク接続エラー（オフライン・タイムアウト等）
class NetworkException implements Exception {
  final String message;
  NetworkException([this.message = 'ネットワークに接続できません。']);

  @override
  String toString() => 'NetworkException: $message';
}
