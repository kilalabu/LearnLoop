# Supabase Setup SQL 解説とスキーマ検証

## 1. 概要
本ドキュメントは、`docs/plan/supabase_setup.md` に記載されている SQL 文が、設計書 `docs/plan/database_schema.md` の要件を正しく満たしているかを検証し、各 SQL がどのような設定を行っているかを詳細に解説するものです。

結論として、**テーブル構造、外部キー制約、RLS（行レベルセキュリティ）、トリガー設定は設計通り正しく実装されています**。ただし、パフォーマンス最適化のためのインデックス設定が一部未定義であるため、追加実行を推奨します。

---

## 2. SQL 詳細解説

### 2.1 Profiles テーブル (`public.profiles`)
ユーザー情報を管理するテーブルです。Supabase の Auth 機能 (`auth.users`) と連携します。

```sql
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  created_at timestamptz default now(),
  primary key (id)
);
```

- **解説**:
    - `id`: `auth.users` テーブル（Supabase 管理のユーザーテーブル）の `id` を参照しています。`on delete cascade` により、認証ユーザーが削除されると、このプロファイルも自動的に削除されます。
    - **セキュリティ**: RLS を有効化 (`enable row level security`) し、`insert` と `select` のポリシーを設定することで、**「ユーザーは自分のプロファイルのみ作成・参照できる」** 状態を強制しています。

### 2.2 Quizzes テーブル (`public.quizzes`)
クイズデータを格納するメインテーブルです。

```sql
create table public.quizzes (
  -- ...カラム定義...
  options jsonb not null, -- Array of {id, text, isCorrect}
  -- ...
);
```

- **解説**:
    - `options jsonb`: 選択肢を別のテーブルに分けず、JSON 形式で保存します。これにより、選択肢の取得が高速になり、データ構造も Dart のモデルとマッピングしやすくなります。
    - `user_id`: 作成者を識別します。
    - **RLS**: `auth.uid() = user_id` という条件により、**「自分が作成したクイズのみ、全操作（閲覧・編集・削除）が可能」** となっています。他人のクイズは見えません。

### 2.3 Quiz Generation Batches テーブル (`public.quiz_generation_batches`)
OpenAI などの Batch API を利用した際のジョブ管理用テーブルです。

- **解説**:
    - `id`: UUID ではなく `text` 型です。これは API プロバイダー（OpenAI 等）が発行するバッチ ID を直接主キーとして利用するためです。
    - `status`: バッチ処理の進行状況を管理します。

### 2.4 User Progress テーブル (`public.user_progress`)
ユーザーの学習状況（忘却曲線のステータスなど）を管理します。

```sql
create table public.user_progress (
  -- ...
  unique(user_id, quiz_id)
);
```

- **解説**:
    - `unique(user_id, quiz_id)`: **「1人のユーザーは、1つのクイズに対して1つの進捗データしか持たない」** という制約を DB レベルで保証しています。重複データの発生を防ぎます。
    - `forgetting_step`, `next_review_at`: 学習アルゴリズムに必要なデータを保持します。

### 2.5 トリガーと関数
データの整合性を保ち、開発者の手間を減らすための自動処理です。

1.  **`moddatetime` による `updated_at` の自動更新**:
    ```sql
    create trigger handle_updated_at_quizzes
      before update on public.quizzes
      for each row execute procedure moddatetime (updated_at);
    ```
    - **解説**: PostgreSQL 拡張機能 `moddatetime` を利用しています。`quizzes` や `user_progress` テーブルの行が更新（UPDATE）される直前に、自動的に `updated_at` カラムを現在時刻に書き換えます。これにより、アプリ側で更新日時を意識して送信する必要がなくなります。

2.  **サインアップ時のプロフィール自動作成**:
    ```sql
    create or replace function public.handle_new_user() ...
    create trigger on_auth_user_created ...
    ```
    - **解説**: Supabase Auth (`auth.users`) に新しいユーザーが登録された直後、このトリガーが発動して `public.profiles` テーブルに同 ID のレコードを自動挿入します。これにより、「ユーザーはいるがプロフィールが存在しない」という不整合を防ぎます。 `security definer` 設定により、ユーザー自身に権限がなくてもシステム権限でテーブル操作を行えるようになっています。

### 2.6 インデックス (Performance Optimization)
大量のデータから特定の情報を高速に検索するための設定です。

```sql
create index if not exists idx_user_progress_user_next_review 
  on public.user_progress(user_id, next_review_at);
```

- **解説**:
    - **複合インデックス**: `user_id` と `next_review_at` の組み合わせに対してインデックスを作成しています。これにより、「特定のユーザーの、今日復習すべきクイズ」を取得するクエリが劇的に高速化されます。
    - **外部キーインデックス**: `quizzes(user_id)` や `user_progress(quiz_id)` などにもインデックスを貼っています。これにより、テーブル同士を結合（JOIN）して情報を取得する際の負荷が軽減されます。
    - **冪等性**: `if not exists` を付けているため、既にインデックスが存在する場合でもエラーにならず、安全にスクリプトを再実行できます。

---

## 3. 設計書 (`database_schema.md`) との整合性検証

| 対象 | 検証項目 | 判定 | 備考 |
|---|---|---|---|
| **Profiles** | カラム定義 (`id`, `created_at`) | ✅ 一致 | |
| | RLS 設定 | ✅ 一致 | 参照・作成制限 OK |
| **Quizzes** | カラム定義 | ✅ 一致 | JSONB 型や Enum 代わりの text も設計通り |
| | RLS 設定 | ✅ 一致 | 他人への共有機能なし (設計通り) |
| **User Progress** | カラム定義 | ✅ 一致 | |
| | ユニーク制約 | ✅ 一致 | `(user_id, quiz_id)` |
| **AI Generation Batches** | カラム定義 | ✅ 一致 | |
| **Study Logs** | 除外確認 | ✅ 一致 | Phase 1 (MVP) では作成しないため SQL に含まれないのは正解 |
| **Performance** | インデックス設定 | ✅ 網羅済 | `supabase_setup.md` に追記済み |

---

## 4. 結論

`docs/plan/supabase_setup.md` の SQL は、アプリケーションを正常に動作させるためのテーブル構造、セキュリティ設定、およびパフォーマンス最適化をすべて網羅しています。このまま実行して問題ありません。
