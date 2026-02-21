import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_button.dart';
import 'progress_ring.dart';

/// 今日の問題カード
class TodayCard extends StatelessWidget {
  const TodayCard({
    super.key,
    required this.completionRate,
    required this.onStartPressed,
  });

  final double completionRate;
  final VoidCallback onStartPressed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppCard(
      padding: AppSpacing.cardPaddingLarge,
      child: Column(
        children: [
          Text(
            '今日も一歩前進しよう!',
            style: theme.textTheme.titleSmall?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
          AppSpacing.gapSm,
          Text(
            '今日のクイズ',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
          AppSpacing.gapMd,
          ProgressRing(
            progress: completionRate,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${(completionRate * 100).round()}%',
                  style: theme.textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '完了',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
          AppSpacing.gapLg,
          AppButton(
            onPressed: completionRate < 1.0 ? onStartPressed : null,
            isFullWidth: true,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.bolt, size: 20),
                const SizedBox(width: 8),
                Text(completionRate < 1.0 ? '学習を始める' : '完了しました'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
