import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

import 'api_exceptions.dart';

class ApiClient {
  // API ベース URL（dart-define で上書き可能、デフォルトは localhost）
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );

  final SupabaseClient _supabase;

  ApiClient({required SupabaseClient supabase}) : _supabase = supabase;

  Map<String, String> get _headers => {
    'Authorization': 'Bearer ${_supabase.auth.currentSession?.accessToken}',
    'Content-Type': 'application/json',
  };

  /// GETリクエスト
  Future<Map<String, dynamic>> get(String path) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl$path'),
        headers: _headers,
      );
      return _handleResponse(response);
    } on SocketException catch (e) {
      debugPrint('ApiClient: SocketException for $_baseUrl$path: $e');
      throw NetworkException();
    } on TimeoutException {
      debugPrint('ApiClient: TimeoutException for $_baseUrl$path');
      throw NetworkException('リクエストがタイムアウトしました。');
    }
  }

  /// POSTリクエスト
  Future<Map<String, dynamic>> post(
    String path,
    Map<String, dynamic> body,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl$path'),
        headers: _headers,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } on SocketException catch (e) {
      debugPrint('ApiClient: SocketException for $_baseUrl$path: $e');
      throw NetworkException();
    } on TimeoutException {
      debugPrint('ApiClient: TimeoutException for $_baseUrl$path');
      throw NetworkException('リクエストがタイムアウトしました。');
    }
  }

  /// レスポンス共通処理
  Map<String, dynamic> _handleResponse(http.Response response) {
    switch (response.statusCode) {
      case 200:
        return jsonDecode(response.body) as Map<String, dynamic>;
      case 401:
        throw UnauthorizedException();
      default:
        throw ApiException(
          statusCode: response.statusCode,
          message: 'サーバーエラーが発生しました。',
        );
    }
  }
}
