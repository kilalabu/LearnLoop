import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../quiz_view_model.dart';

/// クイズ内容をクリップボードにコピーするボタン
class CopyQuizButton extends ConsumerWidget {
  const CopyQuizButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: () {
        ref.read(quizViewModelProvider.notifier).copyToClipboard();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: AppColors.success, size: 20),
                const SizedBox(width: 8),
                const Text('クリップボードにコピーしました'),
              ],
            ),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.only(bottom: 80, left: 20, right: 20),
            shape: RoundedRectangleBorder(borderRadius: AppRadius.borderMd),
            duration: const Duration(seconds: 2),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.1),
          borderRadius: AppRadius.borderXl,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'コピー',
              style: theme.textTheme.labelLarge?.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 4),
            Icon(Icons.copy, size: 16, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
