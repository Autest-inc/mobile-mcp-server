# ローカル開発ガイド

このドキュメントでは、Mobile MCP Serverをローカル環境で開発・実行する方法を説明します。

## 目次

- [セットアップ](#セットアップ)
- [開発モード](#開発モード)
- [デバイスへのアクセス](#デバイスへのアクセス)
- [デバッグ](#デバッグ)
- [トラブルシューティング](#トラブルシューティング)

## セットアップ

### 前提条件

1. **Node.js v22以上**
   ```bash
   node --version  # v22以上であることを確認
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **ビルド**
   ```bash
   npm run build
   ```

### iOS開発環境（macOSのみ）

1. **Xcodeのインストール**
   ```bash
   xcode-select --install
   ```

2. **iOS Simulatorの確認**
   ```bash
   xcrun simctl list
   ```

3. **シミュレーターの起動**
   ```bash
   xcrun simctl boot "iPhone 16"
   ```

### Android開発環境

1. **Android SDKのインストール**
   - Android Studioをインストール
   - または、コマンドラインツールを使用

2. **環境変数の設定**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **エミュレーターの確認**
   ```bash
   emulator -list-avds
   ```

4. **エミュレーターの起動**
   ```bash
   emulator -avd <AVD_NAME>
   ```

## 開発モード

### HTTPサーバーモード

MCPクライアントからHTTP経由で接続する場合：

```bash
# デフォルトポート8081で起動
npm start

# カスタムポートで起動
node lib/index.js --port 3000 --transport both

# デバッグログを有効化
DEBUG_AUTH=true npm start
```

### stdioモード

MCPクライアントがサーバーを直接起動する場合：

```bash
node lib/index.js --stdio
```

### 開発用スクリプト

`package.json`に以下のスクリプトが用意されています：

- `npm start`: ポート8081でHTTPサーバーを起動（Streamable HTTP & SSE）
- `npm run start:stdio`: stdioモードで起動
- `npm run start:sse`: SSEのみで起動
- `npm run start:streamable`: Streamable HTTPのみで起動
- `npm run watch`: TypeScriptの変更を監視して自動ビルド

### TypeScriptの直接実行

開発中は、TypeScriptを直接実行することもできます：

```bash
# ts-nodeをインストール（開発時のみ）
npm install -D ts-node

# TypeScriptを直接実行
npx ts-node src/index.ts --port 8081 --transport both
```

## デバイスへのアクセス

### 利用可能なデバイスの確認

サーバーを起動したら、MCPクライアントから以下のツールを使用：

1. **`mobile_list_available_devices`**: 利用可能なデバイスを一覧表示

### iOS Simulator

```bash
# シミュレーターの一覧
xcrun simctl list devices

# シミュレーターの起動
xcrun simctl boot "iPhone 16"

# シミュレーターの停止
xcrun simctl shutdown "iPhone 16"
```

### Android Emulator

```bash
# エミュレーターの一覧
emulator -list-avds

# エミュレーターの起動
emulator -avd Pixel_5_API_33

# エミュレーターの停止
adb emu kill
```

### 物理デバイス

#### iOS

1. USBケーブルでデバイスを接続
2. デバイスで「このコンピューターを信頼」を選択
3. `xcrun devicectl list devices`で確認

#### Android

1. USBケーブルでデバイスを接続
2. デバイスでUSBデバッグを有効化
3. `adb devices`で確認

```bash
# 接続されているデバイスを確認
adb devices

# デバイスが表示されない場合
adb kill-server
adb start-server
adb devices
```

## デバッグ

### デバッグログの有効化

```bash
DEBUG_AUTH=true npm start
```

デバッグログには以下の情報が含まれます：

- CORS設定
- セッション管理
- リクエストヘッダー
- エラー詳細

### ログファイルの設定

```bash
LOG_FILE=./logs/server.log npm start
```

### 環境情報の確認

サーバー起動時に、以下の情報が表示されます：

```
mobile-mcp 0.0.1 Streamable HTTP & SSE server listening on http://0.0.0.0:8081/mcp
Environment: local
```

デバッグモードでは、より詳細な情報が表示されます：

```
[Config] Environment: local
[Config] Port: 8081
[Config] Host: 0.0.0.0
[Config] CORS Allowed Origins: *
[Config] CORS Allow Credentials: false
```

## トラブルシューティング

### ポートが既に使用されている

```bash
# 使用中のポートを確認
lsof -ti:8081

# プロセスを停止
lsof -ti:8081 | xargs kill

# または、別のポートを使用
node lib/index.js --port 3000
```

### デバイスが検出されない

#### iOS Simulator

- Xcodeがインストールされているか確認
- シミュレーターが起動しているか確認
- `xcrun simctl list`で利用可能なシミュレーターを確認

#### Android Emulator

- Android SDKがインストールされているか確認
- `ANDROID_HOME`環境変数が設定されているか確認
- エミュレーターが起動しているか確認
- `adb devices`でデバイスが表示されるか確認

#### 物理デバイス

- USBケーブルが正しく接続されているか確認
- デバイスでUSBデバッグが有効になっているか確認
- `adb devices`でデバイスが表示されるか確認

### CORSエラー

```bash
# 許可するオリジンを環境変数で指定
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173 npm start
```

### セッションエラー

- デバッグログを有効化して詳細を確認
- セッションIDが正しく送信されているか確認
- サーバーを再起動してセッションをリセット

### ビルドエラー

```bash
# TypeScriptの型チェック
npm run type-check

# ビルド
npm run build

# クリーンビルド
npm run clean
npm run build
```

## 開発のベストプラクティス

1. **環境変数の使用**: 設定は環境変数で管理
2. **デバッグログの活用**: 問題発生時は`DEBUG_AUTH=true`を設定
3. **型チェック**: 変更後は`npm run type-check`で確認
4. **自動ビルド**: `npm run watch`で開発効率を向上
5. **ログファイル**: 本番環境では`LOG_FILE`を設定

