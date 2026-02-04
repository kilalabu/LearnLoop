import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// ジャンルタグ用バッジ
class AppBadge extends StatelessWidget {
  const AppBadge({super.key, required this.label, this.color, this.gradient});

  final String label;
  final Color? color;
  final Gradient? gradient;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: gradient == null
            ? (color ?? AppColors.primary).withValues(alpha: 0.15)
            : null,
        gradient: gradient,
        borderRadius: AppRadius.borderXl,
      ),
      child: Text(
        label,
        style: theme.textTheme.labelMedium?.copyWith(
          color: color ?? AppColors.primary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
