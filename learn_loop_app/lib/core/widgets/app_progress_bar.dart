import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// グラデーション進捗バー
class AppProgressBar extends StatelessWidget {
  const AppProgressBar({
    super.key,
    required this.progress,
    this.height = 10,
    this.gradient,
    this.backgroundColor,
  });

  /// 0.0 ~ 1.0
  final double progress;
  final double height;
  final Gradient? gradient;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final clampedProgress = progress.clamp(0.0, 1.0);

    return Container(
      height: height,
      decoration: BoxDecoration(
        color:
            backgroundColor ??
            theme.colorScheme.onSurface.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(height / 2),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(height / 2),
        child: AnimatedFractionallySizedBox(
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeOut,
          alignment: Alignment.centerLeft,
          widthFactor: clampedProgress,
          child: Container(
            decoration: BoxDecoration(
              gradient: gradient ?? AppColors.primaryGradient,
            ),
          ),
        ),
      ),
    );
  }
}

/// アニメーション付きFractionallySizedBox
class AnimatedFractionallySizedBox extends ImplicitlyAnimatedWidget {
  const AnimatedFractionallySizedBox({
    super.key,
    required super.duration,
    super.curve,
    this.alignment = Alignment.center,
    this.widthFactor,
    this.heightFactor,
    this.child,
  });

  final AlignmentGeometry alignment;
  final double? widthFactor;
  final double? heightFactor;
  final Widget? child;

  @override
  AnimatedFractionallySizedBoxState createState() =>
      AnimatedFractionallySizedBoxState();
}

class AnimatedFractionallySizedBoxState
    extends AnimatedWidgetBaseState<AnimatedFractionallySizedBox> {
  Tween<double>? _widthFactor;
  Tween<double>? _heightFactor;

  @override
  void forEachTween(TweenVisitor<dynamic> visitor) {
    _widthFactor =
        visitor(
              _widthFactor,
              widget.widthFactor ?? 1.0,
              (value) => Tween<double>(begin: value as double),
            )
            as Tween<double>?;
    _heightFactor =
        visitor(
              _heightFactor,
              widget.heightFactor ?? 1.0,
              (value) => Tween<double>(begin: value as double),
            )
            as Tween<double>?;
  }

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      alignment: widget.alignment,
      widthFactor: _widthFactor?.evaluate(animation),
      heightFactor: _heightFactor?.evaluate(animation),
      child: widget.child,
    );
  }
}
