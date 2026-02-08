import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'data/auth/auth_providers.dart';
import 'presentation/home/ui/home_screen.dart';
import 'presentation/login/ui/login_screen.dart';
import 'presentation/quiz/ui/quiz_question_screen.dart';
import 'presentation/quiz/ui/quiz_result_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      // 認証状態がまだ読み込み中の場合はリダイレクトしない
      if (authState.isLoading) return null;

      final isLoggedIn = authState.when(
        data: (data) => data.session != null,
        loading: () => false,
        error: (error, stack) => false,
      );
      final isLoginRoute = state.matchedLocation == '/login';

      // 未認証で /login 以外 → /login へリダイレクト
      if (!isLoggedIn && !isLoginRoute) return '/login';
      // 認証済みで /login → / へリダイレクト
      if (isLoggedIn && isLoginRoute) return '/';
      return null;
    },
    routes: [
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
    ],
  );
});
