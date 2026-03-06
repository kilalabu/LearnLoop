import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_spacing.dart';
import 'widgets/loading_dots.dart';
import 'widgets/sparkle_widget.dart';
import 'widgets/splash_logo.dart';

/// アプリ起動時のスプラッシュ画面
/// Supabase のセッション復元中（authState.isLoading）に表示される
/// GoRouter の reactive redirect により、認証確定後に自動遷移する
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  // ロゴのスケール+フェード (0ms → 600ms)
  late Animation<double> _logoScale;
  late Animation<double> _logoOpacity;

  // テキストのスライドアップ+フェード (400ms → 900ms)
  late Animation<Offset> _textSlide;
  late Animation<double> _textOpacity;

  // サブタイトル+ローディングのフェード (700ms → 1200ms)
  late Animation<double> _subtitleOpacity;

  @override
  void initState() {
    super.initState();

    // 全体の duration: 1400ms
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    // ロゴ: 0.0 → 0.43 (0ms → 600ms / 1400ms)
    _logoScale = Tween<double>(begin: 0.3, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.43, curve: Curves.elasticOut),
      ),
    );
    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.25, curve: Curves.easeIn),
      ),
    );

    // テキスト: 0.29 → 0.64 (400ms → 900ms / 1400ms)
    _textSlide = Tween<Offset>(
      begin: const Offset(0, 0.5),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.29, 0.64, curve: Curves.easeOut),
      ),
    );
    _textOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.29, 0.64, curve: Curves.easeIn),
      ),
    );

    // サブタイトル+ローディング: 0.50 → 0.86 (700ms → 1200ms / 1400ms)
    _subtitleOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.50, 0.86, curve: Curves.easeIn),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // アクセシビリティ: 省アニメーションモードでは静的表示
    final reduceMotion = MediaQuery.of(context).disableAnimations;

    return Scaffold(
      body: Container(
        // 全画面グラデーション背景（縦方向: Indigo-700 → Violet-700）
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF4338CA), Color(0xFF7C3AED)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Stack(
          children: [
            // --- スパークルエフェクト（省アニメーション時は非表示）---
            if (!reduceMotion) ..._buildSparkles(),

            // --- メインコンテンツ ---
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // ロゴアイコン
                  reduceMotion
                      ? const SplashLogo()
                      : ScaleTransition(
                          scale: _logoScale,
                          child: FadeTransition(
                            opacity: _logoOpacity,
                            child: const SplashLogo(),
                          ),
                        ),
                  const SizedBox(height: AppSpacing.md),

                  // "LearnLoop" テキスト
                  reduceMotion
                      ? _buildTitle(context)
                      : SlideTransition(
                          position: _textSlide,
                          child: FadeTransition(
                            opacity: _textOpacity,
                            child: _buildTitle(context),
                          ),
                        ),
                  const SizedBox(height: AppSpacing.sm),

                  // サブタイトル
                  reduceMotion
                      ? _buildSubtitle(context)
                      : FadeTransition(
                          opacity: _subtitleOpacity,
                          child: _buildSubtitle(context),
                        ),
                  const SizedBox(height: AppSpacing.xl),

                  // ローディングドット
                  reduceMotion
                      ? const LoadingDots()
                      : FadeTransition(
                          opacity: _subtitleOpacity,
                          child: const LoadingDots(),
                        ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTitle(BuildContext context) {
    return Text(
      'LearnLoop',
      style: Theme.of(context).textTheme.headlineLarge?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
    );
  }

  Widget _buildSubtitle(BuildContext context) {
    return Text(
      '毎日の学習をスマートに',
      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: Colors.white.withValues(alpha: 0.8),
          ),
    );
  }

  /// スパークルエフェクト: 5個の小さな星アイコンを画面上に配置
  List<Widget> _buildSparkles() {
    const sparkles = [
      SparkleConfig(left: 40, top: 120, size: 14, delay: 0),
      SparkleConfig(right: 60, top: 200, size: 10, delay: 300),
      SparkleConfig(left: 80, bottom: 250, size: 18, delay: 150),
      SparkleConfig(right: 40, bottom: 300, size: 12, delay: 450),
      SparkleConfig(left: 160, top: 300, size: 10, delay: 600),
    ];
    return sparkles
        .map((s) => SparkleWidget(config: s, controller: _controller))
        .toList();
  }
}
