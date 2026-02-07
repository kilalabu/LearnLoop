import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_progress_bar.dart';
import '../quiz_view_model.dart';
import '../state/quiz_state.dart';
import 'option_card.dart';
import 'result_banner.dart';
import 'explanation_card.dart';

/// クイズ結果画面
class QuizResultScreen extends ConsumerWidget {
  const QuizResultScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(quizViewModelProvider);
    final viewModel = ref.read(quizViewModelProvider.notifier);
    final theme = Theme.of(context);

    // 結果画面以外の状態なら問題画面にリダイレクト
    if (state is! QuizShowingResult) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/quiz');
      });
      return const SizedBox();
    }

    final quiz = state.quizzes[state.currentIndex];
    final progress = (state.currentIndex + 1) / state.quizzes.length;
    final isLastQuestion = state.currentIndex >= state.quizzes.length - 1;

    return Scaffold(
      body: SafeArea(
        child: Column(
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
                        onPressed: () => context.go('/quiz'),
                        icon: const Icon(Icons.arrow_back),
                        style: IconButton.styleFrom(
                          foregroundColor: theme.colorScheme.onSurface
                              .withValues(alpha: 0.6),
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
                        child: Text(
                          '${state.currentIndex + 1} / ${state.quizzes.length}',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 48),
                    ],
                  ),
                  AppSpacing.gapSm,
                  AppProgressBar(progress: progress),
                ],
              ),
            ),

            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: AppSpacing.screenPadding,
                child: Column(
                  children: [
                    // Result Banner
                    ResultBanner(isCorrect: state.isCorrect),

                    AppSpacing.gapLg,

                    // Options with results
                    ...quiz.options.map(
                      (option) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: OptionCard(
                          option: option,
                          isSelected: false,
                          showResult: true,
                          wasSelected: state.selectedOptionIds.contains(
                            option.id,
                          ),
                          onTap: () {},
                        ),
                      ),
                    ),

                    AppSpacing.gapMd,

                    // Explanation
                    ExplanationCard(
                      explanation: quiz.explanation,
                      sourceUrl: quiz.sourceUrl,
                    ),

                    AppSpacing.gapLg,
                  ],
                ),
              ),
            ),

            // Next Button
            Padding(
              padding: AppSpacing.screenPadding.copyWith(top: 16, bottom: 16),
              child: AppButton(
                onPressed: () {
                  viewModel.nextQuestion();
                  if (isLastQuestion) {
                    context.go('/quiz');
                  } else {
                    context.go('/quiz');
                  }
                },
                isFullWidth: true,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.bolt, size: 20),
                    const SizedBox(width: 8),
                    Text(isLastQuestion ? '結果を見る' : '次の問題へ'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
