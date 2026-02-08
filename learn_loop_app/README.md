# learn_loop_app

LearnLoop のモバイルアプリ（Flutter）です。

## はじめかた

### 環境変数の設定

Supabase と Google 認証の設定が必要です。

1. `learn_loop_app/.env` ファイルを作成します。
2. 以下の内容を記述し、自分の値を設定してください。

```env
# Supabase
SUPABASE_URL=xxxxxxxxxx
SUPABASE_KEY=xxxxxxxxxx

# Google Sign-In（Android で idToken を取得するために必要な Web Client ID）
GOOGLE_WEB_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
```

### アプリの起動

```bash
cd learn_loop_app
flutter run --dart-define-from-file=.env
```
