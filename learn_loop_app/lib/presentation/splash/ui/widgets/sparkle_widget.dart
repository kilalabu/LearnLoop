import 'package:flutter/material.dart';

/// スパークルの設定値（位置・サイズ・遅延）
class SparkleConfig {
  final double? left;
  final double? right;
  final double? top;
  final double? bottom;
  final double size;
  final int delay;

  const SparkleConfig({
    this.left,
    this.right,
    this.top,
    this.bottom,
    required this.size,
    required this.delay,
  });
}

/// 個々のスパークルウィジェット
/// 親の AnimationController から派生した opacity アニメーションでフェードイン
class SparkleWidget extends StatelessWidget {
  final SparkleConfig config;
  final AnimationController controller;

  const SparkleWidget({
    super.key,
    required this.config,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    // delay に応じて Interval をずらして「ばらつき」を演出
    final start = (config.delay / 1400).clamp(0.0, 0.8);
    final end = (start + 0.4).clamp(0.0, 1.0);

    final opacity = Tween<double>(begin: 0.0, end: 0.6).animate(
      CurvedAnimation(
        parent: controller,
        curve: Interval(start, end, curve: Curves.easeInOut),
      ),
    );

    return Positioned(
      left: config.left,
      right: config.right,
      top: config.top,
      bottom: config.bottom,
      child: FadeTransition(
        opacity: opacity,
        child: Icon(
          Icons.auto_awesome,
          size: config.size,
          color: Colors.white.withValues(alpha: 0.7),
        ),
      ),
    );
  }
}
