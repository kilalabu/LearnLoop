import 'package:flutter/material.dart';
import 'package:flutter_markdown_plus/flutter_markdown_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_card.dart';
import 'copy_quiz_button.dart';
import 'source_link_button.dart';

/// 解説カード
class ExplanationCard extends StatelessWidget {
  const ExplanationCard({super.key, required this.explanation, this.sourceUrl});

  final String explanation;
  final String? sourceUrl;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppCard(
      topAccent: true,
      padding: AppSpacing.cardPaddingLarge,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.auto_awesome, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text(
                '解説',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          AppSpacing.gapMd,
          // マークダウン形式で解説を表示
          MarkdownBody(
            data: explanation,
            selectable: true,
            styleSheet: MarkdownStyleSheet(
              p: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
                height: 1.6,
              ),
            ),
            onTapLink: (text, href, title) async {
              if (href == null) return;
              final uri = Uri.parse(href);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            },
          ),
          AppSpacing.gapMd,
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (sourceUrl != null) SourceLinkButton(url: sourceUrl!),
              const CopyQuizButton(),
            ],
          ),
        ],
      ),
    );
  }
}
