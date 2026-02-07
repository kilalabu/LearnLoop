import { QuizRepository } from './quiz-repository';
import { FakeQuizRepository } from './fake-quiz-repository';

export function getQuizRepository(): QuizRepository | FakeQuizRepository {
  if (process.env.USE_FAKE_AI === 'true') {
    console.log('[getQuizRepository] USE_FAKE_AI=true → FakeQuizRepository を使用');
    return new FakeQuizRepository();
  }
  return new QuizRepository();
}
