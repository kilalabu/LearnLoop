import 'package:go_router/go_router.dart';
import 'presentation/home/ui/home_screen.dart';
import 'presentation/quiz/ui/quiz_question_screen.dart';
import 'presentation/quiz/ui/quiz_result_screen.dart';

final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
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
