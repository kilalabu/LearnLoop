import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_button.dart';
import '../../../data/auth/auth_providers.dart';

/// ログイン画面
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  bool _isLoading = false;

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(authServiceProvider).signInWithGoogle();
    } on AuthException catch (e) {
      // ユーザーがキャンセルした場合はエラーを表示しない
      if (e.message == 'Google sign-in was cancelled') return;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('ログインに失敗しました: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: AppSpacing.screenPadding,
          child: Column(
            children: [
              const Spacer(flex: 2),
              // アプリロゴ
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: AppRadius.borderXxl,
                ),
                child: const Icon(
                  Icons.auto_awesome,
                  color: Colors.white,
                  size: 40,
                ),
              ),
              AppSpacing.gapMd,
              // アプリ名（グラデーションテキスト）
              Text(
                'LearnLoop',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  foreground: Paint()
                    ..shader = AppColors.primaryGradient.createShader(
                      const Rect.fromLTWH(0, 0, 200, 40),
                    ),
                ),
              ),
              AppSpacing.gapSm,
              Text(
                '毎日の学習をスマートに',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                ),
              ),
              const Spacer(flex: 3),
              // Google ログインボタン
              AppButton(
                onPressed: _isLoading ? null : _signInWithGoogle,
                isFullWidth: true,
                isLoading: _isLoading,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.login, size: 20, color: Colors.white),
                    AppSpacing.gapSm,
                    const Text('Google でログイン'),
                  ],
                ),
              ),
              AppSpacing.gapLg,
            ],
          ),
        ),
      ),
    );
  }
}
