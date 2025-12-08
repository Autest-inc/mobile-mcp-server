# デプロイメントガイド

このドキュメントでは、Mobile MCP Serverを様々な環境にデプロイする方法を説明します。

## 目次

- [ローカル開発環境](#ローカル開発環境)
- [Cloud Runへのデプロイ](#cloud-runへのデプロイ)
- [環境変数](#環境変数)
- [トラブルシューティング](#トラブルシューティング)

## ローカル開発環境

ローカル開発環境では、物理デバイスやエミュレーター/シミュレーターに直接アクセスできます。

### 前提条件

- Node.js v22以上
- iOS開発: XcodeとiOS Simulator（macOSのみ）
- Android開発: Android SDKと`ANDROID_HOME`環境変数

### 起動方法

#### 1. HTTPサーバーモード（推奨）

```bash
# ビルド
npm run build

# デフォルトポート8081で起動
npm start

# カスタムポートで起動
node lib/index.js --port 3000 --transport both
```

#### 2. stdioモード

MCPクライアントがサーバーを直接起動する場合：

```bash
node lib/index.js --stdio
```

### 環境検出

サーバーは自動的にローカル環境を検出し、以下の設定を適用します：

- **ポート**: デフォルト8081（`PORT`環境変数または`--port`オプションで変更可能）
- **ホスト**: `0.0.0.0`（すべてのインターフェースでリッスン）
- **CORS**: デフォルトで`*`（すべてのオリジンを許可）
- **デバイスアクセス**: 有効（ローカルの物理デバイスやエミュレーターにアクセス可能）

### MCPクライアント設定

```json
{
  "mcpServers": {
    "mobile-mcp": {
      "url": "http://localhost:8081/mcp",
      "transport": "streamable-http"
    }
  }
}
```

## Cloud Runへのデプロイ

Cloud Run環境では、ローカルの物理デバイスにはアクセスできません。リモートデバイス接続サービス（Firebase Test Lab、BrowserStackなど）を使用する必要があります。

### 前提条件

1. Google Cloud SDKのインストール
2. Google Cloudプロジェクトの作成
3. 必要なAPIの有効化：
   - Cloud Build API
   - Container Registry API
   - Cloud Run API

### デプロイ方法

#### 方法1: Makefileを使用（推奨）

```bash
# プロジェクトIDを設定
export PROJECT_ID=your-project-id

# デプロイ
make cloud-run-deploy
```

#### 方法2: スクリプトを使用

```bash
./cloud-run-deploy.sh
```

#### 方法3: 手動デプロイ

```bash
# Dockerイメージをビルド
docker build --platform linux/amd64 -t gcr.io/${PROJECT_ID}/mobile-mcp-server:latest .

# Container Registryにプッシュ
docker push gcr.io/${PROJECT_ID}/mobile-mcp-server:latest

# Cloud Runにデプロイ
gcloud run deploy mobile-mcp-server \
  --image gcr.io/${PROJECT_ID}/mobile-mcp-server:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 384Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300
```

### 環境検出

Cloud Run環境では、以下の環境変数が自動的に設定されます：

- `K_SERVICE`: Cloud Runサービス名
- `K_REVISION`: Cloud Runリビジョン名
- `PORT`: 8080（Cloud Runが自動設定）

サーバーはこれらの環境変数を検出し、Cloud Run環境として認識します。

### Cloud Run環境での設定

- **ポート**: 8080（Cloud Runが自動設定、変更不可）
- **ホスト**: `0.0.0.0`（必須）
- **CORS**: デフォルトで`*`（すべてのオリジンを許可）
- **デバイスアクセス**: 無効（ローカルデバイスにアクセス不可）

### MCPクライアント設定

```json
{
  "mcpServers": {
    "mobile-mcp": {
      "url": "https://your-service-url.run.app/mcp",
      "transport": "streamable-http"
    }
  }
}
```

## 環境変数

### 共通環境変数

| 変数名 | 説明 | デフォルト | ローカル | Cloud Run |
|--------|------|-----------|----------|-----------|
| `PORT` | サーバーのポート番号 | 8081 | 可 | 8080（固定） |
| `ALLOWED_ORIGINS` | CORSで許可するオリジン（カンマ区切り） | `*` | 可 | 可 |
| `DEBUG_AUTH` | 認証デバッグログを有効化 | `false` | 可 | 可 |
| `LOG_FILE` | ログファイルのパス | なし | 可 | 可 |

### Cloud Run専用環境変数

| 変数名 | 説明 | 設定方法 |
|--------|------|----------|
| `K_SERVICE` | Cloud Runサービス名 | 自動設定（読み取り専用） |
| `K_REVISION` | Cloud Runリビジョン名 | 自動設定（読み取り専用） |

### 環境変数の設定方法

#### ローカル環境

```bash
# 環境変数を設定して起動
PORT=3000 ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173 npm start

# または、.envファイルを使用（dotenvが必要）
```

#### Cloud Run環境

```bash
# デプロイ時に設定
gcloud run deploy mobile-mcp-server \
  --set-env-vars ALLOWED_ORIGINS=https://example.com,https://app.example.com \
  --set-env-vars DEBUG_AUTH=true \
  ...

# 既存サービスの更新
gcloud run services update mobile-mcp-server \
  --set-env-vars ALLOWED_ORIGINS=https://example.com \
  --region asia-northeast1
```

## トラブルシューティング

### ローカル環境

#### ポートが既に使用されている

```bash
# 使用中のポートを確認
lsof -ti:8081

# プロセスを停止
lsof -ti:8081 | xargs kill

# または、別のポートを使用
node lib/index.js --port 3000
```

#### デバイスが検出されない

**iOS Simulator:**
```bash
# シミュレーターの一覧を確認
xcrun simctl list

# シミュレーターを起動
xcrun simctl boot "iPhone 16"
```

**Android Emulator:**
```bash
# エミュレーターの一覧を確認
emulator -list-avds

# エミュレーターを起動
emulator -avd <AVD_NAME>
```

### Cloud Run環境

#### コンテナが起動しない

- ログを確認: `gcloud run services logs read mobile-mcp-server --region asia-northeast1`
- ポート8080でリッスンしているか確認
- ホストが`0.0.0.0`でリッスンしているか確認

#### CORSエラー

- `ALLOWED_ORIGINS`環境変数を適切に設定
- デバッグログを有効化: `DEBUG_AUTH=true`

#### セッションエラー

- セッション管理が正しく動作しているか確認
- デバッグログを有効化して詳細を確認

### デバッグ

デバッグログを有効化するには：

```bash
# ローカル環境
DEBUG_AUTH=true npm start

# Cloud Run環境
gcloud run services update mobile-mcp-server \
  --set-env-vars DEBUG_AUTH=true \
  --region asia-northeast1
```

デバッグログには以下の情報が含まれます：

- CORS設定
- セッション管理
- リクエストヘッダー
- エラー詳細

