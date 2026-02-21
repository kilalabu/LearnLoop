# データベーステーブル構成書 (最終版)

このドキュメントでは、`src/lib/supabase/sql_query` の変更履歴（v1.0 〜 v1.6）に基づいた、最終的なデータベーステーブル構成をまとめます。

## 1. テーブル定義

### 1.1 `profiles` (プロフィール)
ユーザー管理用のテーブル。Supabase Auth と連携します。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, FK (auth.users) | ユーザーID |
| `created_at` | `timestamptz` | DEFAULT now() | 作成日時 |

### 1.2 `quizzes` (クイズ)
クイズのコンテンツ本体を保持するテーブル。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, DEFAULT gen_random() | クイズID |
| `user_id` | `uuid` | FK (profiles.id) | 所有者ID |
| `question` | `text` | NOT NULL | 問題文 |
| `options` | `jsonb` | NOT NULL | 選択肢リスト (`{id, text, isCorrect}` の配列) |
| `explanation` | `text` | NOT NULL | 解説文 |
| `source_url` | `text` | | 参照元URL (任意) |
| `source_type` | `text` | DEFAULT 'manual' | 取得元種類 (`manual`, `notion`, `url`) |
| `category` | `text` | NOT NULL | カテゴリ名 |
| `created_at` | `timestamptz` | DEFAULT now() | 作成日時 |
| `updated_at` | `timestamptz` | DEFAULT now() | 更新日時 (Trigger) |

### 1.3 `user_progress` (ユーザー進捗)
各ユーザーのクイズに対する学習進捗と忘却曲線（SM-2アルゴリズム）のパラメータを管理します。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, DEFAULT gen_random() | 進捗ID |
| `user_id` | `uuid` | FK (profiles.id) | ユーザーID |
| `quiz_id` | `uuid` | FK (quizzes.id) | クイズID |
| `is_correct` | `boolean` | DEFAULT false | 直近の回答が正解か |
| `attempt_count` | `int` | DEFAULT 0 | 総回答回数 |
| `interval` | `int` | DEFAULT 0 | 次回復習までの間隔 (日数) |
| `current_streak` | `int` | DEFAULT 0 | 連続正解数 |
| `ease_factor` | `float` | DEFAULT 2.5 | 難易度係数 (EF) |
| `learning_status` | `text` | GENERATED | 学習状態 (`hidden`, `unanswered`, `learning`) |
| `last_answered_at`| `timestamptz` | DEFAULT now() | 最終回答日時 |
| `next_review_at` | `timestamptz` | DEFAULT now() | 次回復習予定日時 |
| `is_hidden` | `boolean` | DEFAULT false | 非表示フラグ |
| `created_at` | `timestamptz` | DEFAULT now() | 作成日時 |
| `updated_at` | `timestamptz` | DEFAULT now() | 更新日時 (Trigger) |

- **計算済みカラム (`learning_status`)**:
  - `is_hidden = true` -> `'hidden'`
  - `attempt_count = 0` -> `'unanswered'`
  - その他 -> `'learning'`

### 1.4 `quiz_batch_requests` (バッチリクエスト)
AIによるクイズ一括生成のリクエストを管理します。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, DEFAULT gen_random() | リクエストID |
| `user_id` | `uuid` | FK (profiles.id) | ユーザーID |
| `status` | `text` | DEFAULT 'pending' | 状態 (`pending`, `processing`, `completed`, `failed`) |
| `source_name` | `text` | NOT NULL | ソース名 (ファイル名等) |
| `source_content` | `text` | NOT NULL | 生成元コンテンツ |
| `batch_id` | `text` | | Provider(OpenAI等) のバッチID |
| `error_message` | `text` | | 失敗時のエラー内容 |
| `created_at` | `timestamptz` | DEFAULT now() | 作成日時 |
| `updated_at` | `timestamptz` | DEFAULT now() | 更新日時 (Trigger) |

---

## 2. ビュー (Views)

### 2.1 `quiz_view`
`quizzes` と `user_progress` を外部結合し、アプリケーションから利用しやすい形式にまとめたビューです。

- **取得データ**: クイズの基本情報に加え、`learning_status`, `attempt_count`, `current_streak` (正解数として), `next_review_at`, `last_answered_at` を含みます。
- **補完**: 進捗データが無い場合は `learning_status = 'unanswered'`, `attempt_count = 0` 等として返却されます。
- **セキュリティ**: `security_invoker = true`（v1.4〜）。ビューのクエリは呼び出し元ユーザーの権限で実行され、RLS が正しく適用されます。

---

## 3. テーブル定義（Push通知関連）

### 3.1 `user_push_tokens` (FCMトークン管理)
ユーザーのデバイス Push 通知トークンを管理するテーブル。RLS 有効。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `token` | `text` | PK | FCM デバイストークン |
| `user_id` | `uuid` | FK (auth.users), NOT NULL | ユーザーID |
| `device_type` | `text` | NOT NULL, CHECK ('ios', 'android') | デバイス種別 |
| `updated_at` | `timestamptz` | DEFAULT now() | 更新日時 (Trigger) |

- **RLS ポリシー**: ユーザー自身のトークンのみ操作可能。バッチは `service_role` でバイパス。

### 3.2 `user_notification_settings` (通知設定・履歴)
Push 通知の二重送信防止のための最終通知日時を管理するテーブル。RLS なし（`service_role` 専用）。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `user_id` | `uuid` | PK, FK (auth.users) | ユーザーID |
| `last_notified_at` | `timestamptz` | | 最終通知日時 |

---

## 4. RPC (ストアドプロシージャ)

### 4.1 `get_reminder_targets(p_current_time, p_window_start)`
バッチスクリプトから1クエリで「配信対象者・未回答数・FCMトークン」を取得する RPC。

- **セキュリティ**: `SECURITY DEFINER`
- **引数**:
  - `p_current_time TIMESTAMPTZ`: 配信実行時刻 (UTC)
  - `p_window_start TIMESTAMPTZ`: 配信枠開始時刻 (UTC)。この時刻以降に通知済みのユーザーは除外（二重送信防止）
- **戻り値**: `user_id`, `token`, `unanswered_count`
- **フィルタ条件**:
  - JST 当日 23:59:59 までに `next_review_at` が到来しており、`is_hidden = false` の進捗を持つユーザー
  - `user_push_tokens` にトークンが登録されているユーザーのみ
  - `last_notified_at >= p_window_start` のユーザーを除外

---

## 5. インデックス構成

パフォーマンス最適化のため、以下のインデックスが設定されています。

- `idx_user_progress_user_next_review`: ユーザーごとの復習スケジュール検索
- `idx_quizzes_user_category`: ユーザー・カテゴリ別のフィルタリング
- `idx_user_progress_user_quiz`: ユーザーとクイズの紐付け検索 (JOIN最適化)
- `idx_user_progress_learning_status`: 学習ステータス別のフィルタリング
- `idx_user_push_tokens_user_id`: FCMトークンのユーザー検索
- `idx_user_progress_next_review_user`: 復習期限・ユーザー複合検索（`is_hidden = false` 部分インデックス）
- その他、外部キー制約に基づくインデックス

---

## 6. 変更履歴まとめ

| バージョン | 主な変更内容 |
| :--- | :--- |
| **v1.0** | 初期構成作成 (`profiles`, `quizzes`, `user_progress`, `quiz_generation_batches`) |
| **v1.1** | 忘却曲線 (SM-2) 対応。`forgetting_step` -> `interval` への変更、`current_streak`, `ease_factor` 追加。 |
| **v1.2** | Batch API 対応。旧 `quiz_generation_batches` を削除し、`quiz_batch_requests` を新規作成。 |
| **v1.3** | フィルタリング・ページネーション最適化。`learning_status` 計算済みカラムの追加と `quiz_view` の作成。 |
| **v1.4** | `quiz_view` に `security_invoker = true` を設定。RLS が呼び出し元権限で正しく適用されるよう修正。 |
| **v1.5** | Push通知対応。`user_push_tokens`, `user_notification_settings` テーブル追加。`get_reminder_targets` RPC 追加。 |
| **v1.6** | `get_reminder_targets` RPC のバグ修正。`AT TIME ZONE` 演算子優先順位の問題を括弧追加で修正。 |
