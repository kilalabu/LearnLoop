import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_card.dart';

/// 統計カード行
class StatsRow extends StatelessWidget {
  const StatsRow({
    super.key,
    required this.streak,
    required this.accuracy,
    required this.totalCount,
  });

  final int streak;
  final int accuracy; // パーセント (0-100)
  final int totalCount;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            icon: Icons.local_fire_department,
            value: '$streak',
            label: '連続日数',
            color: AppColors.streak,
          ),
        ),
        AppSpacing.gapSm,
        Expanded(
          child: _StatCard(
            icon: Icons.auto_awesome,
            value: '$accuracy%',
            label: '正答率',
            color: AppColors.success,
          ),
        ),
        AppSpacing.gapSm,
        Expanded(
          child: _StatCard(
            icon: Icons.menu_book,
            value: '$totalCount',
            label: '総問題数',
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppCard(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      child: Column(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: AppRadius.borderLg,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          AppSpacing.gapSm,
          Text(
            value,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }
}
