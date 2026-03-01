import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_button.dart';
import '../history_state.dart';
import '../history_view_model.dart';
import 'history_list_item.dart';
import 'today_summary_card.dart';

/// 回答履歴画面
class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(historyViewModelProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('回答履歴'),
      ),
      body: historyAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('エラーが発生しました', style: theme.textTheme.titleMedium),
              AppSpacing.gapSm,
              Text('$error', style: theme.textTheme.bodySmall),
              AppSpacing.gapMd,
              ElevatedButton(
                onPressed: () =>
                    ref.read(historyViewModelProvider.notifier).refresh(),
                child: const Text('再試行'),
              ),
            ],
          ),
        ),
        data: (state) => _buildContent(context, ref, state),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, HistoryState state) {
    final theme = Theme.of(context);

    // 今日のJST日付に一致するレコードを取得
    final today = _todayJST();
    final todayRecord = state.history.where((r) => r.date == today).firstOrNull;

    return RefreshIndicator(
      onRefresh: () => ref.read(historyViewModelProvider.notifier).refresh(),
      child: CustomScrollView(
        slivers: [
          // 今日のサマリーカード
          SliverToBoxAdapter(
            child: Padding(
              padding: AppSpacing.screenPadding.copyWith(
                top: AppSpacing.md,
                bottom: AppSpacing.md,
              ),
              child: TodaySummaryCard(
                record: todayRecord,
                totalRequired: state.totalRequired,
              ),
            ),
          ),

          // 履歴リスト（日付降順で表示）または空状態メッセージ
          if (state.history.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.history,
                      size: 48,
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
                    ),
                    AppSpacing.gapMd,
                    Text(
                      'まだ記録がありません',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else ...[
            // 「過去の記録」セクションヘッダー
            SliverToBoxAdapter(
              child: Padding(
                padding: AppSpacing.screenPadding.copyWith(
                  top: AppSpacing.sm,
                  bottom: AppSpacing.sm,
                ),
                child: Text(
                  '過去の記録',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            // 履歴リスト（日付降順で表示）
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final record = state.history[index];
                  return Padding(
                    padding: AppSpacing.screenPadding.copyWith(
                      top: AppSpacing.xs,
                      bottom: AppSpacing.xs,
                    ),
                    child: HistoryListItem(
                      record: record,
                      totalRequired: state.totalRequired,
                    ),
                  );
                },
                childCount: state.history.length,
              ),
            ),

            // 「もっと見る」ボタン（hasMore == true のときのみ表示）
            if (state.hasMore)
              SliverToBoxAdapter(
                child: Padding(
                  padding: AppSpacing.screenPadding.copyWith(
                    top: AppSpacing.md,
                    bottom: AppSpacing.xxl,
                  ),
                  child: AppButton(
                    isLoading: state.isLoadingMore,
                    onPressed: state.isLoadingMore
                        ? null
                        : () => ref
                            .read(historyViewModelProvider.notifier)
                            .loadMore(),
                    child: const Text('もっと見る'),
                  ),
                ),
              )
            else
              const SliverToBoxAdapter(
                child: SizedBox(height: AppSpacing.xxl),
              ),
          ],
        ],
      ),
    );
  }

  /// 今日のJST日付を 'YYYY-MM-DD' フォーマットで返す
  String _todayJST() {
    // UTCに+9時間を加算してJSTを算出
    final jst = DateTime.now().toUtc().add(const Duration(hours: 9));
    final y = jst.year.toString().padLeft(4, '0');
    final m = jst.month.toString().padLeft(2, '0');
    final d = jst.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }
}
