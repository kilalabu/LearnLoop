import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

/// 正解/不正解バナー
class ResultBanner extends StatelessWidget {
  const ResultBanner({super.key, required this.isCorrect});

  final bool isCorrect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final message = isCorrect ? 'すばらしい!' : '惜しい!';

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isCorrect
              ? [
                  AppColors.success.withValues(alpha: 0.2),
                  AppColors.accent.withValues(alpha: 0.1),
                ]
              : [
                  AppColors.error.withValues(alpha: 0.2),
                  AppColors.accent.withValues(alpha: 0.1),
                ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadius.borderXxl,
      ),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isCorrect
                    ? [AppColors.success, AppColors.accent]
                    : [AppColors.error, AppColors.accent],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: AppRadius.borderLg,
              boxShadow: [
                BoxShadow(
                  color: (isCorrect ? AppColors.success : AppColors.error)
                      .withValues(alpha: 0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(
              isCorrect ? Icons.celebration : Icons.trending_up,
              color: Colors.white,
              size: 32,
            ),
          ),
          AppSpacing.gapMd,
          Text(
            message,
            style: theme.textTheme.headlineSmall?.copyWith(
              color: isCorrect ? AppColors.success : AppColors.error,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
