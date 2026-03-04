import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:learn_loop_app/presentation/home/state/home_state.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../home_view_model.dart';
import 'today_card.dart';
import 'stats_row.dart';
import '../../../data/auth/auth_providers.dart';

/// ホーム画面
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeViewModelProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: homeAsync.hasError
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('エラーが発生しました', style: theme.textTheme.titleMedium),
                    AppSpacing.gapSm,
                    Text(
                      '${homeAsync.error}',
                      style: theme.textTheme.bodySmall,
                    ),
                    AppSpacing.gapMd,
                    ElevatedButton(
                      onPressed: () =>
                          ref.read(homeViewModelProvider.notifier).refresh(),
                      child: const Text('再試行'),
                    ),
                  ],
                ),
              )
            : _buildContent(
                context,
                ref,
                // データ取得中は初期値を表示、取得後は実データに更新
                homeAsync.asData?.value ?? HomeDataExtension.initial(),
              ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, HomeData homeData) {
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Padding(
            padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: AppRadius.borderLg,
                      ),
                      child: const Icon(
                        Icons.auto_awesome,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                    AppSpacing.gapSm,
                    Text(
                      'LearnLoop',
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        foreground: Paint()
                          ..shader = AppColors.primaryGradient.createShader(
                            const Rect.fromLTWH(0, 0, 150, 30),
                          ),
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () async {
                    // ログアウト確認ダイアログを表示
                    final confirmed = await showDialog<bool>(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('ログアウト'),
                        content: const Text('ログアウトしますか？'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(false),
                            child: const Text('キャンセル'),
                          ),
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(true),
                            child: const Text('ログアウト'),
                          ),
                        ],
                      ),
                    );
                    // 確認された場合のみログアウト実行
                    if (confirmed == true) {
                      await ref.read(authServiceProvider).signOut();
                    }
                  },
                  icon: Icon(
                    Icons.logout,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),

          AppSpacing.gapMd,

          // Today's Questions Card
          TodayCard(
            completionRate: homeData.completionRate,
            onStartPressed: () => context.go('/quiz'),
          ),

          AppSpacing.gapLg,

          // Stats Row
          StatsRow(
            streak: homeData.streak,
            newQuestionCount: homeData.newQuestionCount,
            totalCount: homeData.totalCount,
            // 連続日数カードをタップで回答履歴画面へ遷移
            onStreakTap: () => context.push('/history'),
          ),

          AppSpacing.gapXxl,
        ],
      ),
    );
  }
}
