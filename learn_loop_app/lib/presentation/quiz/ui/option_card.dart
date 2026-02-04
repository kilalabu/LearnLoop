import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_checkbox.dart';
import '../../../domain/models/problem.dart';

/// クイズ選択肢カード
class OptionCard extends StatelessWidget {
  const OptionCard({
    super.key,
    required this.option,
    required this.isSelected,
    required this.onTap,
    this.showResult = false,
    this.wasSelected = false,
  });

  final ProblemOption option;
  final bool isSelected;
  final VoidCallback onTap;
  final bool showResult;
  final bool wasSelected;

  @override
  Widget build(BuildContext context) {
    if (!showResult) {
      return AppCheckbox(
        isSelected: isSelected,
        onTap: onTap,
        label: option.label,
        text: option.text,
      );
    }

    // 結果表示モード
    return _buildResultCard(context);
  }

  Widget _buildResultCard(BuildContext context) {
    final theme = Theme.of(context);
    final isCorrectOption = option.isCorrect;
    final showSuccess = isCorrectOption;
    final showError = wasSelected && !isCorrectOption;

    Color borderColor;
    Color? backgroundColor;
    Widget? icon;

    if (showSuccess) {
      borderColor = AppColors.success;
      backgroundColor = AppColors.success.withValues(alpha: 0.1);
      icon = Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          gradient: AppColors.successGradient,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.check, size: 18, color: Colors.white),
      );
    } else if (showError) {
      borderColor = AppColors.error;
      backgroundColor = AppColors.error.withValues(alpha: 0.1);
      icon = Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          color: AppColors.error,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.close, size: 18, color: Colors.white),
      );
    } else {
      borderColor = theme.dividerColor;
      backgroundColor = null;
      icon = Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          border: Border.all(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
            width: 2,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: backgroundColor ?? theme.cardColor,
        border: Border.all(
          color: borderColor,
          width: showSuccess || showError ? 2 : 1,
        ),
        borderRadius: AppRadius.borderXl,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          icon,
          AppSpacing.gapMd,
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${option.label}.',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: showSuccess
                        ? AppColors.success
                        : showError
                        ? AppColors.error
                        : theme.colorScheme.onSurface.withValues(alpha: 0.5),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    option.text,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: !showSuccess && !showError
                          ? theme.colorScheme.onSurface.withValues(alpha: 0.5)
                          : null,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
