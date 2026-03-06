import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'data/auth/auth_providers.dart';
import 'presentation/history/ui/history_screen.dart';
import 'presentation/home/ui/home_screen.dart';
import 'presentation/login/ui/login_screen.dart';
import 'presentation/quiz/ui/quiz_question_screen.dart';
import 'presentation/quiz/ui/quiz_result_screen.dart';
import 'presentation/splash/ui/splash_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isSplashRoute = state.matchedLocation == '/splash';

      // 認証状態が未確定（読み込み中）の場合はスプラッシュ画面へ
      // すでに /splash にいるなら null（リダイレクトしない）
      if (authState.isLoading) return isSplashRoute ? null : '/splash';

      final isLoggedIn = authState.when(
        data: (data) => data.session != null,
        loading: () => false,
        error: (error, stack) => false,
      );
      final isLoginRoute = state.matchedLocation == '/login';

      // ロード完了後に /splash に残っている場合は適切な画面へ遷移
      if (isSplashRoute) return isLoggedIn ? '/' : '/login';

      // 未認証で /login 以外 → /login へリダイレクト
      if (!isLoggedIn && !isLoginRoute) return '/login';
      // 認証済みで /login → / へリダイレクト
      if (isLoggedIn && isLoginRoute) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/quiz',
        builder: (context, state) => const QuizQuestionScreen(),
      ),
      GoRoute(
        path: '/quiz/result',
        builder: (context, state) => const QuizResultScreen(),
      ),
      GoRoute(
        path: '/history',
        builder: (context, state) => const HistoryScreen(),
      ),
    ],
  );
});
