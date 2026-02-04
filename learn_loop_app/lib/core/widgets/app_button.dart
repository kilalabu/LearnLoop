import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// アプリ共通ボタン - primary/secondary/outline variants
enum AppButtonVariant { primary, secondary, outline }

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.isFullWidth = false,
    this.height = 56,
  });

  final VoidCallback? onPressed;
  final Widget child;
  final AppButtonVariant variant;
  final bool isLoading;
  final bool isFullWidth;
  final double height;

  @override
  Widget build(BuildContext context) {
    final isDisabled = onPressed == null || isLoading;

    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: height,
      child: _buildButton(context, isDisabled),
    );
  }

  Widget _buildButton(BuildContext context, bool isDisabled) {
    switch (variant) {
      case AppButtonVariant.primary:
        return _buildPrimaryButton(context, isDisabled);
      case AppButtonVariant.secondary:
        return _buildSecondaryButton(context, isDisabled);
      case AppButtonVariant.outline:
        return _buildOutlineButton(context, isDisabled);
    }
  }

  Widget _buildPrimaryButton(BuildContext context, bool isDisabled) {
    return Container(
      decoration: BoxDecoration(
        gradient: isDisabled ? null : AppColors.primaryGradient,
        color: isDisabled ? Theme.of(context).disabledColor : null,
        borderRadius: AppRadius.borderXl,
        boxShadow: isDisabled
            ? null
            : [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isDisabled ? null : onPressed,
          borderRadius: AppRadius.borderXl,
          child: Center(
            child: isLoading
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : DefaultTextStyle(
                    style: Theme.of(context).textTheme.titleMedium!.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                    child: child,
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildSecondaryButton(BuildContext context, bool isDisabled) {
    return ElevatedButton(
      onPressed: isDisabled ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: Theme.of(context).colorScheme.surface,
        foregroundColor: Theme.of(context).colorScheme.onSurface,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.borderXl),
      ),
      child: isLoading
          ? const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : child,
    );
  }

  Widget _buildOutlineButton(BuildContext context, bool isDisabled) {
    return OutlinedButton(
      onPressed: isDisabled ? null : onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: Theme.of(context).colorScheme.onSurface,
        side: BorderSide(
          color: isDisabled
              ? Theme.of(context).disabledColor
              : Theme.of(context).dividerColor,
          width: 2,
        ),
        shape: RoundedRectangleBorder(borderRadius: AppRadius.borderXl),
      ),
      child: isLoading
          ? const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : child,
    );
  }
}
