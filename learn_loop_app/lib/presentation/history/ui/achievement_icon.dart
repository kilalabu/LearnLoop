import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

/// 達成率に基づく5段階のアイコン・色を返す
/// rate = answeredCount / totalRequired（0.0〜1.0）
AchievementData achievementData(double rate) {
  if (rate >= 0.81) return AchievementData(Icons.star_rounded, AppColors.primary);
  if (rate >= 0.61) return AchievementData(Icons.sentiment_satisfied, AppColors.success);
  if (rate >= 0.41) {
    return AchievementData(
      Icons.sentiment_neutral,
      const Color(0xFFEAB308), // Yellow-500
    );
  }
  if (rate >= 0.21) return AchievementData(Icons.sentiment_dissatisfied, AppColors.streak);
  return AchievementData(Icons.sentiment_very_dissatisfied, AppColors.error);
}

/// 達成アイコンのデータクラス
class AchievementData {
  const AchievementData(this.icon, this.color);

  final IconData icon;
  final Color color;
}

/// 達成アイコン: 背景色付き丸コンテナ + Icon
/// stats_row.dart の _StatCard アイコン部分のパターンを踏襲
class AchievementIcon extends StatelessWidget {
  const AchievementIcon({super.key, required this.data, required this.size});

  final AchievementData data;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: data.color.withValues(alpha: 0.15),
        borderRadius: AppRadius.borderLg,
      ),
      child: Icon(
        data.icon,
        color: data.color,
        size: size * 0.6, // コンテナサイズの60%をアイコンサイズに
      ),
    );
  }
}
