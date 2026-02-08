import '../../domain/models/quiz.dart';
import '../../domain/repositories/quiz_repository.dart';

/// Fakeクイズリポジトリ実装
class FakeQuizRepositoryImpl implements QuizRepository {
  final _fakeQuizzes = <Quiz>[
    Quiz(
      id: '1',
      question: 'Dockerに関する以下の説明のうち、正しいものをすべて選んでください。',
      options: [
        QuizOption(
          id: 'a',
          label: 'A',
          text: 'Dockerイメージはコンテナの実行可能なテンプレートである',
          isCorrect: true,
        ),
        QuizOption(
          id: 'b',
          label: 'B',
          text: 'Dockerコンテナは永続的なストレージを持つ',
          isCorrect: false,
        ),
        QuizOption(
          id: 'c',
          label: 'C',
          text: 'DockerfileはDockerイメージをビルドするための設定ファイルである',
          isCorrect: true,
        ),
        QuizOption(
          id: 'd',
          label: 'D',
          text: 'Dockerはハイパーバイザー型の仮想化技術を使用する',
          isCorrect: false,
        ),
      ],
      explanation:
          '''Dockerイメージはコンテナを実行するための読み取り専用のテンプレートです。イメージにはアプリケーションのコード、ランタイム、ライブラリ、環境変数、設定ファイルが含まれています。

DockerfileはイメージをビルドするYための設定ファイルで、ベースイメージの指定、必要なパッケージのインストール、ファイルのコピーなどを定義します。

Dockerコンテナは基本的にエフェメラル（一時的）であり、コンテナが削除されるとデータも失われます。永続化にはボリュームを使用します。

Dockerはコンテナ型の仮想化技術であり、ホストOSのカーネルを共有します。ハイパーバイザー型とは異なります。''',
      sourceUrl: 'https://docs.docker.com/get-started/',
      genre: 'Docker',
    ),
    Quiz(
      id: '2',
      question: 'Dockerfileの命令に関して、正しいものを選んでください。',
      options: [
        QuizOption(
          id: 'a',
          label: 'A',
          text: 'FROMは必ずDockerfileの最初に記述する必要がある',
          isCorrect: true,
        ),
        QuizOption(
          id: 'b',
          label: 'B',
          text: 'RUNは1つのDockerfileに1つしか使用できない',
          isCorrect: false,
        ),
        QuizOption(
          id: 'c',
          label: 'C',
          text: 'COPYはローカルファイルをイメージにコピーする',
          isCorrect: true,
        ),
        QuizOption(
          id: 'd',
          label: 'D',
          text: 'ENTRYPOINTはCMDで上書きできる',
          isCorrect: false,
        ),
      ],
      explanation:
          '''FROMはベースイメージを指定し、必ず最初に記述します。RUNは複数使用可能です。COPYはホストのファイルをイメージにコピーします。ENTRYPOINTは実行時に上書きできませんが、CMDはできます。''',
      sourceUrl: 'https://docs.docker.com/reference/dockerfile/',
      genre: 'Docker',
    ),
    Quiz(
      id: '3',
      question: 'Dockerネットワークについて、正しい説明を選んでください。',
      options: [
        QuizOption(
          id: 'a',
          label: 'A',
          text: 'bridgeネットワークはデフォルトのネットワークドライバーである',
          isCorrect: true,
        ),
        QuizOption(
          id: 'b',
          label: 'B',
          text: 'hostネットワークではコンテナがホストのネットワークを直接使用する',
          isCorrect: true,
        ),
        QuizOption(
          id: 'c',
          label: 'C',
          text: '同じネットワーク上のコンテナは互いに通信できない',
          isCorrect: false,
        ),
        QuizOption(
          id: 'd',
          label: 'D',
          text: 'noneネットワークではコンテナに完全なネットワーク機能がある',
          isCorrect: false,
        ),
      ],
      explanation:
          '''bridgeはDockerのデフォルトネットワークドライバーです。hostを使用するとコンテナはホストのネットワークスタックを直接使用します。同じネットワーク上のコンテナは相互に通信可能です。''',
      sourceUrl: 'https://docs.docker.com/network/',
      genre: 'Docker',
    ),
  ];

  @override
  Future<List<Quiz>> getTodayQuizzes() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _fakeQuizzes;
  }

  @override
  Future<Quiz?> getQuizById(String id) async {
    await Future.delayed(const Duration(milliseconds: 100));
    try {
      return _fakeQuizzes.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<int> getTotalQuizCount() async {
    return _fakeQuizzes.length;
  }
}
