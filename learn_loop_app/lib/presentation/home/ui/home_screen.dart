import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../home_view_model.dart';
import 'today_card.dart';
import 'stats_row.dart';

/// ホーム画面
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeViewModelProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: homeAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('エラーが発生しました', style: theme.textTheme.titleMedium),
                const SizedBox(height: 8),
                Text('$error', style: theme.textTheme.bodySmall),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () =>
                      ref.read(homeViewModelProvider.notifier).refresh(),
                  child: const Text('再試行'),
                ),
              ],
            ),
          ),
          data: (data) => _buildContent(context, ref, data),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, homeData) {
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
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
                    const SizedBox(width: 8),
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
                  onPressed: () {
                    // TODO: Settings
                  },
                  icon: Icon(
                    Icons.settings_outlined,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),

          AppSpacing.gapMd,

          // Today's Questions Card
          TodayCard(
            pendingCount: homeData.pendingCount,
            completionRate: homeData.completionRate,
            onStartPressed: () => context.go('/quiz'),
          ),

          AppSpacing.gapLg,

          // Stats Row
          StatsRow(
            streak: homeData.streak,
            accuracy: homeData.accuracyPercent,
            totalCount: homeData.totalCount,
          ),

          AppSpacing.gapXxl,
        ],
      ),
    );
  }
}
