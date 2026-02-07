import { QuizGenerator } from './quiz-generator';
import { FakeQuizGenerator } from './fake-quiz-generator';

export function getQuizGenerator(): QuizGenerator | FakeQuizGenerator {
  if (process.env.USE_FAKE_AI === 'true') {
    console.log('[getQuizGenerator] USE_FAKE_AI=true → FakeQuizGenerator を使用');
    return new FakeQuizGenerator();
  }
  return new QuizGenerator();
}
