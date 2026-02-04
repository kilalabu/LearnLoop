import 'package:flutter/material.dart';
import '../theme/app_spacing.dart';

/// アプリ共通カード - シャドウ付き角丸カード
class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.gradient,
    this.topAccent = false,
    this.accentColor,
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final Gradient? gradient;
  final bool topAccent;
  final Color? accentColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Widget card = Container(
      decoration: BoxDecoration(
        color: gradient == null ? theme.cardColor : null,
        gradient: gradient,
        borderRadius: AppRadius.borderLg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: AppRadius.borderLg,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (topAccent)
              Container(
                height: 4,
                decoration: BoxDecoration(
                  color: accentColor ?? theme.colorScheme.primary,
                  gradient: accentColor == null
                      ? LinearGradient(
                          colors: [
                            theme.colorScheme.primary,
                            theme.colorScheme.secondary,
                          ],
                        )
                      : null,
                ),
              ),
            Padding(padding: padding ?? AppSpacing.cardPadding, child: child),
          ],
        ),
      ),
    );

    if (onTap != null) {
      card = GestureDetector(onTap: onTap, child: card);
    }

    return card;
  }
}
