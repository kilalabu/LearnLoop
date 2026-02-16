# Android 署名と Google Sign-In のトラブルシューティング

## 概要

CI（GitHub Actions）でビルドした APK で Google Sign-In が失敗する問題の調査・解決記録。

## エラー内容

```
PlatformException(sign_in_failed, r0.e: 10: , null, null)
```

- エラーコード `10` = `DEVELOPER_ERROR`
- Google Sign-In の認証情報（SHA-1 フィンガープリント）が一致しない場合に発生

## 原因

Gradle がプロジェクト内の debug.keystore ではなく、**CI 環境で自動生成された別の debug.keystore** で APK に署名していた。

`build.gradle.kts` で `signingConfigs.getByName("debug")` を使っていたが、デフォルトの debug 署名設定は `~/.android/debug.keystore` を参照する。CI 環境では Java の `user.home` プロパティが指すパスと、シェルの `~` が一致しない場合があり、復元したキーストアが使われなかった。

## 解決策

### 1. キーストアをプロジェクト内に配置

`build.gradle.kts` で相対パスを明示指定：

```kotlin
signingConfigs {
    getByName("debug") {
        storeFile = file("debug.keystore")  // android/app/ からの相対パス
        storePassword = "android"
        keyAlias = "androiddebugkey"
        keyPassword = "android"
    }
}

buildTypes {
    release {
        signingConfig = signingConfigs.getByName("debug")
    }
}
```

### 2. CI でキーストアを直接プロジェクト内に復元

```yaml
- name: Restore debug keystore
  run: |
    echo "${{ secrets.DEBUG_KEYSTORE_BASE64 }}" | tr -d '\n\r ' | base64 --decode > learn_loop_app/android/app/debug.keystore
```

### 3. `.gitignore` でキーストアを除外

```
/android/app/debug.keystore
```

## Google Sign-In に必要な設定チェックリスト

### Google Cloud Console

- [ ] **Android OAuth クライアント** が登録されている
  - パッケージ名: `com.learnloop.learn_loop_app`
  - SHA-1: APK 署名に使うキーストアのフィンガープリント
  - ローカルと CI で異なるキーストアを使う場合、それぞれの SHA-1 を登録する
- [ ] **Web OAuth クライアント** が登録されている
  - このクライアント ID を `GOOGLE_WEB_CLIENT_ID` として使用
  - Android クライアント ID ではなく **Web クライアント ID** を使うこと

### GitHub Secrets

- [ ] `DEBUG_KEYSTORE_BASE64`: キーストアの base64 エンコード値
  - エンコード方法: `base64 -i debug.keystore | tr -d '\n'`
  - macOS の `base64` は改行を含むため `tr -d '\n'` が必要
- [ ] `GOOGLE_WEB_CLIENT_ID`: Web OAuth クライアント ID（`.apps.googleusercontent.com` で終わる）

### Flutter アプリ側

- [ ] `GoogleSignIn(serverClientId: ...)` に **Web クライアント ID** を渡している
- [ ] `--dart-define=GOOGLE_WEB_CLIENT_ID=...` でビルド時に値を注入している

## デバッグ用コマンド集

### キーストアの SHA-1 を確認

```bash
keytool -list -v -keystore <keystore-path> -alias androiddebugkey -storepass android 2>&1 | grep SHA1
```

### ビルド済み APK の署名 SHA-1 を確認

```bash
# Android SDK の apksigner を使用
$ANDROID_HOME/build-tools/<version>/apksigner verify --print-certs app-release.apk | grep SHA-1
```

### Gradle の署名設定を確認

```bash
cd android && ./gradlew signingReport
```

### キーストアを base64 エンコード（macOS）

```bash
base64 -i debug.keystore | tr -d '\n'
```

## 重要な注意点

- **SHA-1 フィンガープリントは公開情報**であり、Git にコミットしても問題ない（APK から誰でも取得できる）
- **キーストアファイル自体は秘密情報**なので `.gitignore` で除外する
- **debug.keystore のパスワード等（`android` / `androiddebugkey`）は Android SDK の標準値**であり、Git にコミットしても問題ない
- CI でキーストアを復元する際、**base64 デコード前に `tr -d '\n\r '` で改行・空白を除去**すると安全
- APK の署名 SHA-1 とキーストアの SHA-1 が**一致しない場合**、Gradle が意図しないキーストアを使っている

---

*作成日: 2026-02-16*
*対象: learn_loop_app (Flutter Android)*
