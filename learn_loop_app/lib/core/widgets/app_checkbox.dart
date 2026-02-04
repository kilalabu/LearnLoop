import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// クイズ選択肢用チェックボックス付きカード
class AppCheckbox extends StatelessWidget {
  const AppCheckbox({
    super.key,
    required this.isSelected,
    required this.onTap,
    required this.label,
    required this.text,
  });

  final bool isSelected;
  final VoidCallback onTap;
  final String label;
  final String text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.1)
              : theme.cardColor,
          border: Border.all(
            color: isSelected ? AppColors.primary : theme.dividerColor,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: AppRadius.borderXl,
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.2),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.transparent,
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : theme.colorScheme.onSurface.withValues(alpha: 0.4),
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: isSelected
                  ? const Icon(Icons.check, size: 18, color: Colors.white)
                  : null,
            ),
            AppSpacing.gapMd,
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$label.',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: isSelected
                              ? AppColors.primary
                              : theme.colorScheme.onSurface.withValues(
                                  alpha: 0.6,
                                ),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(text, style: theme.textTheme.bodyLarge),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
