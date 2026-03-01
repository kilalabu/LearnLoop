import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_card.dart';
import '../../../domain/models/daily_answer_record.dart';
import 'achievement_icon.dart';

/// 今日のサマリーカード
class TodaySummaryCard extends StatelessWidget {
  const TodaySummaryCard({
    super.key,
    required this.record,
    required this.totalRequired,
  });

  final DailyAnswerRecord? record;
  final int totalRequired;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final answeredCount = record?.answeredCount ?? 0;
    final correctCount = record?.correctCount ?? 0;
    final remaining = math.max(0, totalRequired - answeredCount);

    // 達成率（0除算を防ぐ）
    final rate = totalRequired > 0 ? answeredCount / totalRequired : 0.0;
    final data = achievementData(rate.toDouble());

    return AppCard(
      topAccent: true,
      accentColor: AppColors.primary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            '今日の達成状況',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          AppSpacing.gapMd,
          // 達成アイコン（中央）
          Center(
            child: AchievementIcon(
              data: data,
              size: 80,
            ),
          ),
          AppSpacing.gapMd,
          // 統計3列
          Row(
            children: [
              Expanded(
                child: StatItem(
                  label: '回答数',
                  value: '$answeredCount',
                ),
              ),
              Expanded(
                child: StatItem(
                  label: '正答数',
                  value: '$correctCount',
                ),
              ),
              Expanded(
                child: StatItem(
                  label: '残り問題',
                  value: '$remaining',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// 統計1項目（ラベル＋値）
class StatItem extends StatelessWidget {
  const StatItem({super.key, required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Text(
          value,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: theme.textTheme.labelSmall?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
          ),
        ),
      ],
    );
  }
}
