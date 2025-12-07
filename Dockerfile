# Cloud Run用のDockerfile
FROM node:22-slim AS builder

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# すべての依存関係をインストール（ビルドに必要）
RUN npm ci

# ソースコードをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# 本番用イメージ
FROM node:22-slim

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 本番用の依存関係のみをインストール
# --ignore-scripts で prepare スクリプト（husky）をスキップ（本番環境では不要）
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# 不要なファイルを削除してイメージサイズを削減
RUN rm -rf /tmp/* /var/tmp/* /root/.npm /root/.cache

# ビルド済みファイルをコピー
COPY --from=builder /app/lib ./lib

# ポート8080を公開（Cloud Runのデフォルト）
EXPOSE 8080

# 環境変数PORTを設定（Cloud Runが自動的に設定するが、デフォルト値を提供）
ENV PORT=8080
ENV NODE_ENV=production

# ヘルスチェック用のエンドポイント
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Streamable HTTPトランスポートでサーバーを起動
CMD ["node", "lib/index.js", "--port", "8080", "--transport", "streamable"]

