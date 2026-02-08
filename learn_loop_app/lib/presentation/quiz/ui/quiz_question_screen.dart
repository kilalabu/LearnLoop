import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_badge.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_progress_bar.dart';
import '../../../domain/models/quiz.dart';
import '../../home/home_view_model.dart';
import '../quiz_view_model.dart';
import '../state/quiz_state.dart';
import 'option_card.dart';

/// クイズ問題画面
class QuizQuestionScreen extends ConsumerWidget {
  const QuizQuestionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(quizViewModelProvider);
    final viewModel = ref.read(quizViewModelProvider.notifier);

    return Scaffold(
      body: SafeArea(
        child: switch (state) {
          QuizLoading() => const Center(child: CircularProgressIndicator()),
          QuizError(:final message) => Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('エラーが発生しました'),
                Text(message),
                ElevatedButton(
                  onPressed: viewModel.restart,
                  child: const Text('再試行'),
                ),
              ],
            ),
          ),
          QuizCompleted(:final correctCount, :final totalCount) =>
            _buildCompletedScreen(context, ref, correctCount, totalCount),
          QuizAnswering(
            :final quizzes,
            :final currentIndex,
            :final selectedOptionIds,
          ) =>
            _buildQuestionScreen(
              context,
              ref,
              quizzes,
              currentIndex,
              selectedOptionIds,
            ),
          QuizShowingResult() => const SizedBox(), // result画面で表示
        },
      ),
    );
  }

  Widget _buildQuestionScreen(
    BuildContext context,
    WidgetRef ref,
    List<Quiz> quizzes,
    int currentIndex,
    Set<String> selectedOptionIds,
  ) {
    final theme = Theme.of(context);
    final viewModel = ref.read(quizViewModelProvider.notifier);
    final quiz = quizzes[currentIndex];
    final progress = (currentIndex + 1) / quizzes.length;

    return Column(
      children: [
        // Header
        Padding(
          padding: AppSpacing.screenPadding.copyWith(top: 16, bottom: 12),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () => context.go('/'),
                    icon: const Icon(Icons.close),
                    style: IconButton.styleFrom(
                      foregroundColor: theme.colorScheme.onSurface.withValues(
                        alpha: 0.6,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: AppRadius.borderXl,
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.psychology,
                          size: 18,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${currentIndex + 1} / ${quizzes.length}',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
              AppSpacing.gapSm,
              AppProgressBar(progress: progress),
              AppSpacing.gapMd,
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (quiz.genre != null)
                    AppBadge(label: quiz.genre!)
                  else
                    const SizedBox(),
                  Text(
                    'じっくり考えよう!',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Question & Options
        Expanded(
          child: SingleChildScrollView(
            padding: AppSpacing.screenPadding,
            child: Column(
              children: [
                // Question Card
                AppCard(
                  topAccent: true,
                  padding: AppSpacing.cardPaddingLarge,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          gradient: AppColors.primaryGradient,
                          borderRadius: AppRadius.borderMd,
                        ),
                        child: const Icon(
                          Icons.auto_awesome,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      AppSpacing.gapMd,
                      Expanded(
                        child: Text(
                          quiz.question,
                          style: theme.textTheme.bodyLarge?.copyWith(
                            fontWeight: FontWeight.w500,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                AppSpacing.gapLg,

                // Options
                ...quiz.options.map<Widget>(
                  (option) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: OptionCard(
                      option: option,
                      isSelected: selectedOptionIds.contains(option.id),
                      onTap: () => viewModel.toggleOption(option.id),
                    ),
                  ),
                ),

                AppSpacing.gapMd,

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ...quiz.options.map<Widget>((option) {
                      final isSelected = selectedOptionIds.contains(option.id);
                      return Container(
                        width: 12,
                        height: 12,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.primary
                              : theme.colorScheme.onSurface.withValues(
                                  alpha: 0.2,
                                ),
                          shape: BoxShape.circle,
                        ),
                      );
                    }),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Submit Button
        Padding(
          padding: AppSpacing.screenPadding.copyWith(top: 16, bottom: 16),
          child: AppButton(
            onPressed: selectedOptionIds.isNotEmpty
                ? () {
                    viewModel.submitAnswer();
                    context.go('/quiz/result');
                  }
                : null,
            isFullWidth: true,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(selectedOptionIds.isNotEmpty ? '回答を確認する' : '選択肢を選んでください'),
                if (selectedOptionIds.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: AppRadius.borderXl,
                    ),
                    child: Text(
                      '${selectedOptionIds.length}個選択',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCompletedScreen(
    BuildContext context,
    WidgetRef ref,
    int correctCount,
    int totalCount,
  ) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: AppSpacing.screenPadding,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: AppColors.successGradient,
                borderRadius: AppRadius.borderXxl,
              ),
              child: const Icon(
                Icons.celebration,
                color: Colors.white,
                size: 40,
              ),
            ),
            AppSpacing.gapLg,
            Text(
              '完了!',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            AppSpacing.gapSm,
            Text(
              '$correctCount / $totalCount 問正解',
              style: theme.textTheme.titleLarge?.copyWith(
                color: AppColors.success,
              ),
            ),
            AppSpacing.gapXxl,
            AppButton(
              onPressed: () {
                ref.invalidate(homeViewModelProvider);
                context.go('/');
              },
              isFullWidth: true,
              child: const Text('ホームに戻る'),
            ),
          ],
        ),
      ),
    );
  }
}
