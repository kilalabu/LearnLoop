import 'package:flutter/material.dart';

import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_card.dart';
import '../../../domain/models/daily_answer_record.dart';
import 'achievement_icon.dart';

/// 履歴リストの1行アイテム
class HistoryListItem extends StatelessWidget {
  const HistoryListItem({
    super.key,
    required this.record,
    required this.totalRequired,
  });

  final DailyAnswerRecord record;
  final int totalRequired;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final rate = totalRequired > 0
        ? record.answeredCount / totalRequired
        : 0.0;
    final data = achievementData(rate);
    // 正答率（回答数が0の場合は0%）
    final accuracyPercent = record.answeredCount > 0
        ? (record.correctCount / record.answeredCount * 100).round()
        : 0;

    return AppCard(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      child: Row(
        children: [
          // 左: 日付と回答数
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  record.date,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${record.answeredCount} 問回答',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
          // 右: 正答数・正答率
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${record.correctCount} 問正解',
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 2),
              Text(
                '$accuracyPercent%',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                ),
              ),
            ],
          ),
          AppSpacing.gapSm,
          // 末尾: 達成アイコン
          AchievementIcon(data: data, size: 32),
        ],
      ),
    );
  }
}
