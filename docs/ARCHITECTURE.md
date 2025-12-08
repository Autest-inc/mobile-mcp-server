# アーキテクチャドキュメント

このドキュメントでは、Mobile MCP Serverのアーキテクチャと設計思想を説明します。

## 目次

- [概要](#概要)
- [環境検出](#環境検出)
- [設定管理](#設定管理)
- [トランスポート](#トランスポート)
- [セッション管理](#セッション管理)
- [CORS設定](#cors設定)

## 概要

Mobile MCP Serverは、以下の環境で動作するように設計されています：

- **ローカル環境**: 物理デバイスやエミュレーター/シミュレーターに直接アクセス
- **Cloud Run環境**: リモートデバイス接続サービスを使用

サーバーは自動的に環境を検出し、適切な設定を適用します。

## 環境検出

### 検出方法

環境は以下の環境変数で検出されます：

- **Cloud Run**: `K_SERVICE`または`K_REVISION`が設定されている
- **ローカル**: 上記の環境変数が設定されていない

### 実装

```typescript
// src/config.ts
export const detectEnvironment = (): Environment => {
	if (process.env.K_SERVICE || process.env.K_REVISION) {
		return "cloud-run";
	}
	return "local";
};
```

## 設定管理

### 設定構造

```typescript
interface ServerConfig {
	environment: Environment;
	port: number;
	host: string;
	cors: {
		allowedOrigins: string[];
		allowCredentials: boolean;
	};
	transport: {
		streamable: boolean;
		sse: boolean;
	};
	logging: {
		debugAuth: boolean;
		logFile?: string;
	};
}
```

### 設定の取得

```typescript
const config = getServerConfig();
```

設定は環境変数から自動的に読み込まれ、環境に応じて適切なデフォルト値が設定されます。

## トランスポート

### サポートされているトランスポート

1. **Streamable HTTP**: 双方向HTTP通信（Cloud Run推奨）
2. **SSE (Server-Sent Events)**: 一方向イベントストリーム（後方互換性）
3. **stdio**: 標準入出力（ローカル開発用）

### トランスポートの選択

- **Cloud Run**: Streamable HTTP（デフォルト）
- **ローカルHTTP**: Streamable HTTP & SSE（デフォルト）
- **ローカルstdio**: stdio（MCPクライアントが直接起動する場合）

## セッション管理

### Streamable HTTPのセッション管理

Streamable HTTPトランスポートでは、各クライアント接続に対してセッションIDが生成されます。

1. **セッション初期化**: クライアントが最初のリクエストを送信
2. **セッションID生成**: サーバーがUUIDを生成
3. **セッション登録**: セッションIDとトランスポートをマッピング
4. **セッション再利用**: 後続のリクエストでセッションIDを使用
5. **セッション終了**: クライアントが切断またはタイムアウト

### 実装

```typescript
const streamableTransports: Record<string, StreamableHTTPServerTransport> = {};

// セッション初期化
transport = new StreamableHTTPServerTransport({
	sessionIdGenerator: () => randomUUID(),
	onsessioninitialized: (id: string) => {
		streamableTransports[id] = transport;
	}
});
```

## CORS設定

### 環境ごとのCORS設定

#### ローカル環境

- デフォルト: すべてのオリジンを許可（`*`）
- カスタム: `ALLOWED_ORIGINS`環境変数で指定
- Credentials: 特定のオリジンが指定されている場合のみ許可

#### Cloud Run環境

- デフォルト: すべてのオリジンを許可（`*`）
- カスタム: `ALLOWED_ORIGINS`環境変数で指定
- Credentials: `*`と同時に使用できないため、常に無効

### 実装

```typescript
// src/cors.ts
export const createCorsMiddleware = (config: ServerConfig) => {
	return (req: Request, res: Response, next: NextFunction) => {
		// 環境に応じたCORS設定を適用
		if (config.cors.allowedOrigins.includes("*")) {
			res.setHeader("Access-Control-Allow-Origin", "*");
		} else if (origin && config.cors.allowedOrigins.includes(origin)) {
			res.setHeader("Access-Control-Allow-Origin", origin);
			if (config.cors.allowCredentials) {
				res.setHeader("Access-Control-Allow-Credentials", "true");
			}
		}
		// ...
	};
};
```

## ファイル構造

```
src/
├── index.ts          # エントリーポイント
├── config.ts         # 環境検出と設定管理
├── cors.ts           # CORS設定
├── logger.ts         # ログ管理
├── server.ts         # MCPサーバー実装
├── android.ts        # Android実装
├── ios.ts            # iOS実装
└── ...
```

## データフロー

### HTTPリクエストの処理フロー

```
1. リクエスト受信
   ↓
2. CORSミドルウェア（環境に応じた設定を適用）
   ↓
3. セッション管理（Streamable HTTPの場合）
   ↓
4. MCPサーバーで処理
   ↓
5. レスポンス送信
```

### 環境検出フロー

```
1. サーバー起動
   ↓
2. 環境変数を確認（K_SERVICE, K_REVISION）
   ↓
3. 環境を判定（local / cloud-run）
   ↓
4. 環境に応じた設定を適用
   ↓
5. サーバー起動
```

## エラーハンドリング

### エラーの種類

1. **セッションエラー**: 無効なセッションID
2. **CORSエラー**: 許可されていないオリジン
3. **ポートエラー**: ポートが既に使用されている
4. **デバイスエラー**: デバイスにアクセスできない（Cloud Run環境）

### エラーレスポンス

すべてのエラーはJSON-RPC 2.0形式で返されます：

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32000,
    "message": "Invalid session"
  },
  "id": null
}
```

## パフォーマンス

### 最適化

1. **セッション管理**: メモリ内でセッションを管理（高速）
2. **CORS設定**: 環境に応じた最適な設定を適用
3. **ログ**: デバッグモードでのみ詳細ログを出力

### リソース使用量

- **メモリ**: セッション数に比例
- **CPU**: リクエスト処理に比例
- **ネットワーク**: トランスポートタイプに依存

## セキュリティ

### 考慮事項

1. **CORS**: 本番環境では適切なオリジンを指定
2. **認証**: 必要に応じて認証トークンを検証
3. **セッション**: セッションタイムアウトの実装を検討

### 推奨事項

- 本番環境では`ALLOWED_ORIGINS`を適切に設定
- 認証が必要な場合は、認証ミドルウェアを追加
- 定期的にセッションをクリーンアップ

