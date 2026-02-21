import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/theme/app_theme.dart';
import 'data/repositories/quiz_session_repository_impl.dart';
import 'domain/usecases/reset_session_if_date_changed_use_case.dart';
import 'router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL'),
    anonKey: const String.fromEnvironment('SUPABASE_KEY'),
  );

  // アプリ起動時に日付が変わっていたらセッションをリセット
  final sessionRepo = QuizSessionRepositoryImpl();
  await ResetSessionIfDateChangedUseCase(sessionRepo).call();

  runApp(const ProviderScope(child: LearnLoopApp()));
}

class LearnLoopApp extends ConsumerWidget {
  const LearnLoopApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final goRouter = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'LearnLoop',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      routerConfig: goRouter,
    );
  }
}
