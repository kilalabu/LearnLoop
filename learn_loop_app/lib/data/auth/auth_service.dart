import 'dart:io';

import 'package:google_sign_in/google_sign_in.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  AuthService(this._supabase);

  final SupabaseClient _supabase;

  Future<AuthResponse> signInWithGoogle() async {
    // Android は webClientId の指定が必要（Supabase がトークン検証に使用）
    final googleSignIn = GoogleSignIn(
      serverClientId: Platform.isAndroid
          ? const String.fromEnvironment('GOOGLE_WEB_CLIENT_ID')
          : null,
    );

    final googleUser = await googleSignIn.signIn();
    if (googleUser == null) {
      throw AuthException('Google sign-in was cancelled');
    }

    final googleAuth = await googleUser.authentication;
    final idToken = googleAuth.idToken;
    if (idToken == null) {
      throw AuthException('Failed to get ID token from Google');
    }

    return _supabase.auth.signInWithIdToken(
      provider: OAuthProvider.google,
      idToken: idToken,
    );
  }

  Future<void> signOut() async {
    await GoogleSignIn().signOut();
    await _supabase.auth.signOut();
  }

  Session? get currentSession => _supabase.auth.currentSession;

  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;
}
