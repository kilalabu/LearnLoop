import { QuizImporter } from './quiz-importer';
import { FakeQuizImporter } from './fake-quiz-importer';

export function getQuizImporter(): QuizImporter | FakeQuizImporter {
  if (process.env.USE_FAKE_AI === 'true') {
    console.log('[getQuizImporter] USE_FAKE_AI=true → FakeQuizImporter を使用');
    return new FakeQuizImporter();
  }
  return new QuizImporter();
}
