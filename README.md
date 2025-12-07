# Mobile Next - MCP server for Mobile Development and Automation | iOS, Android, Simulator, Emulator, and Real Devices

This is a [Model Context Protocol (MCP) server](https://github.com/modelcontextprotocol) that enables scalable mobile automation, development through a platform-agnostic interface, eliminating the need for distinct iOS or Android knowledge. You can run it on emulators, simulators, and real devices (iOS and Android).
This server allows Agents and LLMs to interact with native iOS/Android applications and devices through structured accessibility snapshots or coordinate-based taps based on screenshots.

<h4 align="center">
  <a href="https://github.com/mobile-next/mobile-mcp">
    <img src="https://img.shields.io/github/stars/mobile-next/mobile-mcp" alt="Mobile Next Stars" />
  </a>
  <a href="https://github.com/mobile-next/mobile-mcp">
    <img src="https://img.shields.io/github/contributors/mobile-next/mobile-mcp?color=green" alt="Mobile Next Downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mobilenext/mobile-mcp">
    <img src="https://img.shields.io/npm/dm/@mobilenext/mobile-mcp?logo=npm&style=flat&color=red" alt="npm" />
  </a>
  <a href="https://github.com/mobile-next/mobile-mcp/releases">
    <img src="https://img.shields.io/github/release/mobile-next/mobile-mcp" />
  </a>
  <a href="https://github.com/mobile-next/mobile-mcp/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-Apache 2.0-blue.svg" alt="Mobile MCP is released under the Apache-2.0 License" />
  </a>
  <a href="https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22mobile-mcp%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40mobilenext%2Fmobile-mcp%40latest%22%5D%7D">
    <img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code" />
  </a>
</h4>

<h4 align="center">
  <a href="https://github.com/mobile-next/mobile-mcp/wiki">
    <img src="https://img.shields.io/badge/documentation-wiki-blue" alt="wiki" />
  </a>
  <a href="http://mobilenexthq.com/join-slack">
    <img src="https://img.shields.io/badge/join-Slack-blueviolet?logo=slack&style=flat" alt="join on Slack" />
  </a>
</h4>

https://github.com/user-attachments/assets/c4e89c4f-cc71-4424-8184-bdbc8c638fa1

<p align="center">
    <a href="https://github.com/mobile-next/">
        <img alt="mobile-mcp" src="https://raw.githubusercontent.com/mobile-next/mobile-next-assets/refs/heads/main/mobile-mcp-banner.png" width="600" />
    </a>
</p>

### 🚀 Mobile MCP Roadmap: Building the Future of Mobile

Join us on our journey as we continuously enhance Mobile MCP!
Check out our detailed roadmap to see upcoming features, improvements, and milestones. Your feedback is invaluable in shaping the future of mobile automation.

👉 [Explore the Roadmap](https://github.com/orgs/mobile-next/projects/3)


### Main use cases

How we help to scale mobile automation:

- 📲 Native app automation (iOS and Android) for testing or data-entry scenarios.
- 📝 Scripted flows and form interactions without manually controlling simulators/emulators or real devices (iPhone, Samsung, Google Pixel etc)
- 🧭 Automating multi-step user journeys driven by an LLM
- 👆 General-purpose mobile application interaction for agent-based frameworks
- 🤖 Enables agent-to-agent communication for mobile automation usecases, data extraction

## Main Features

- 🚀 **Fast and lightweight**: Uses native accessibility trees for most interactions, or screenshot based coordinates where a11y labels are not available.
- 🤖 **LLM-friendly**: No computer vision model required in Accessibility (Snapshot).
- 🧿 **Visual Sense**: Evaluates and analyses what’s actually rendered on screen to decide the next action. If accessibility data or view-hierarchy coordinates are unavailable, it falls back to screenshot-based analysis.
- 📊 **Deterministic tool application**: Reduces ambiguity found in purely screenshot-based approaches by relying on structured data whenever possible.
- 📺 **Extract structured data**: Enables you to extract structred data from anything visible on screen.

## 🔧 Available MCP Tools

<details>
<summary>📱 <strong>Click to expand tool list</strong> - List of Mobile MCP tools for automation and development</summary>

> For detailed implementation and parameter specifications, see [`src/server.ts`](src/server.ts)

### Device Management
- **`mobile_list_available_devices`** - List all available devices (simulators, emulators, and real devices)
- **`mobile_get_screen_size`** - Get the screen size of the mobile device in pixels
- **`mobile_get_orientation`** - Get the current screen orientation of the device
- **`mobile_set_orientation`** - Change the screen orientation (portrait/landscape)

### App Management
- **`mobile_list_apps`** - List all installed apps on the device
- **`mobile_launch_app`** - Launch an app using its package name
- **`mobile_terminate_app`** - Stop and terminate a running app
- **`mobile_install_app`** - Install an app from file (.apk, .ipa, .app, .zip)
- **`mobile_uninstall_app`** - Uninstall an app using bundle ID or package name

### Screen Interaction
- **`mobile_take_screenshot`** - Take a screenshot to understand what's on screen
- **`mobile_save_screenshot`** - Save a screenshot to a file
- **`mobile_list_elements_on_screen`** - List UI elements with their coordinates and properties
- **`mobile_click_on_screen_at_coordinates`** - Click at specific x,y coordinates
- **`mobile_double_tap_on_screen`** - Double-tap at specific coordinates
- **`mobile_long_press_on_screen_at_coordinates`** - Long press at specific coordinates
- **`mobile_swipe_on_screen`** - Swipe in any direction (up, down, left, right)

### Input & Navigation
- **`mobile_type_keys`** - Type text into focused elements with optional submit
- **`mobile_press_button`** - Press device buttons (HOME, BACK, VOLUME_UP/DOWN, ENTER, etc.)
- **`mobile_open_url`** - Open URLs in the device browser

### Platform Support
- **iOS**: Simulators and real devices via native accessibility and WebDriverAgent
- **Android**: Emulators and real devices via ADB and UI Automator
- **Cross-platform**: Unified API works across both iOS and Android

</details>

## 🏗️ Mobile MCP Architecture

<p align="center">
    <a href="https://raw.githubusercontent.com/mobile-next/mobile-next-assets/refs/heads/main/mobile-mcp-arch-1.png">
        <img alt="mobile-mcp" src="https://raw.githubusercontent.com/mobile-next/mobile-next-assets/refs/heads/main/mobile-mcp-arch-1.png" width="600">
    </a>
</p>


## 📚 Wiki page

More details in our [wiki page](https://github.com/mobile-next/mobile-mcp/wiki) for setup, configuration and debugging related questions.


## Installation and configuration

**Standard config** works in most of the tools:

```json
{
  "mcpServers": {
    "mobile-mcp": {
      "command": "npx",
      "args": ["-y", "@mobilenext/mobile-mcp@latest"]
    }
  }
}
```

<details>
<summary>Cline</summary>

To setup Cline, just add the json above to your MCP settings file.

[More in our wiki](https://github.com/mobile-next/mobile-mcp/wiki/Cline)

</details>

<details>
<summary>Claude Code</summary>

Use the Claude Code CLI to add the Mobile MCP server:

```bash
claude mcp add mobile-mcp -- npx -y @mobilenext/mobile-mcp@latest
```

</details>

<details>
<summary>Cursor</summary>

#### Click the button to install:

[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor">](https://cursor.com/en/install-mcp?name=Mobile%20MCP&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2JpbGVuZXh0L21vYmlsZS1tY3BAbGF0ZXN0Il19)

#### Or install manually:

Go to `Cursor Settings` -> `MCP` -> `Add new MCP Server`. Name to your liking, use `command` type with the command `npx -y @mobilenext/mobile-mcp@latest`. You can also verify config or add command like arguments via clicking `Edit`.

</details>

<details>
<summary>Gemini CLI</summary>

Use the Gemini CLI to add the Mobile MCP server:

```bash
gemini mcp add mobile-mcp npx -y @mobilenext/mobile-mcp@latest
```

</details>

<details>
<summary>Goose</summary>

#### Click the button to install:

[![Install in Goose](https://block.github.io/goose/img/extension-install-dark.svg)](https://block.github.io/goose/extension?cmd=npx&arg=-y&arg=%40mobilenext%2Fmobile-mcp%40latest&id=mobile-mcp&name=Mobile%20MCP&description=Mobile%20automation%20and%20development%20for%20iOS%2C%20Android%2C%20simulators%2C%20emulators%2C%20and%20real%20devices)

#### Or install manually:

Go to `Advanced settings` -> `Extensions` -> `Add custom extension`. Name to your liking, use type `STDIO`, and set the `command` to `npx -y @mobilenext/mobile-mcp@latest`. Click "Add Extension".

</details>

<details>
<summary>Qodo Gen</summary>

Open [Qodo Gen](https://docs.qodo.ai/qodo-documentation/qodo-gen) chat panel in VSCode or IntelliJ → Connect more tools → + Add new MCP → Paste the standard config above.

Click <code>Save</code>.

</details>

[Read more in our wiki](https://github.com/mobile-next/mobile-mcp/wiki)! 🚀


### 🛠️ How to Use 📝

After adding the MCP server to your IDE/Client, you can instruct your AI assistant to use the available tools.
For example, in Cursor's agent mode, you could use the prompts below to quickly validate, test and iterate on UI intereactions, read information from screen, go through complex workflows.
Be descriptive, straight to the point.

### ✨ Example Prompts

#### Workflows

You can specifiy detailed workflows in a single prompt, verify business logic, setup automations. You can go crazy:

**Search for a video, comment, like and share it.**
```
Find the video called " Beginner Recipe for Tonkotsu Ramen" by Way of
Ramen, click on like video, after liking write a comment " this was
delicious, will make it next Friday", share the video with the first
contact in your whatsapp list.
```

**Download a successful step counter app, register, setup workout and 5-star the app**
```
Find and Download a free "Pomodoro" app that has more than 1k stars.
Launch the app, register with my email, after registration find how to
start a pomodoro timer. When the pomodoro timer started, go back to the
app store and rate the app 5 stars, and leave a comment how useful the
app is.
```

**Search in Substack, read, highlight, comment and save an article**
```
Open Substack website, search for "Latest trends in AI automation 2025",
open the first article, highlight the section titled "Emerging AI trends",
and save article to reading list for later review, comment a random
paragraph summary.
```

**Reserve a workout class, set timer**
```
Open ClassPass, search for yoga classes tomorrow morning within 2 miles,
book the highest-rated class at 7 AM, confirm reservation,
setup a timer for the booked slot in the phone
```

**Find a local event, setup calendar event**
```
Open Eventbrite, search for AI startup meetup events happening this
weekend in "Austin, TX", select the most popular one, register and RSVP
yes to the event, setup a calendar event as a reminder.
```

**Check weather forecast and send a Whatsapp/Telegram/Slack message**
```
Open Weather app, check tomorrow's weather forecast for "Berlin", and
send the summary via Whatsapp/Telegram/Slack to contact "Lauren Trown",
thumbs up their response.
```

- **Schedule a meeting in Zoom and share invite via email**
```
Open Zoom app, schedule a meeting titled "AI Hackathon" for tomorrow at
10AM with a duration of 1 hour, copy the invitation link, and send it via
Gmail to contacts "team@example.com".
```
[More prompt examples can be found here.](https://github.com/mobile-next/mobile-mcp/wiki/Prompt-Example-repo-list)

## Prerequisites

What you will need to connect MCP with your agent and mobile devices:

- [Xcode command line tools](https://developer.apple.com/xcode/resources/)
- [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools)
- [node.js](https://nodejs.org/en/download/) v22+
- [MCP](https://modelcontextprotocol.io/introduction) supported foundational models or agents, like [Claude MCP](https://modelcontextprotocol.io/quickstart/server), [OpenAI Agent SDK](https://openai.github.io/openai-agents-python/mcp/), [Copilot Studio](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/introducing-model-context-protocol-mcp-in-copilot-studio-simplified-integration-with-ai-apps-and-agents/)

### Simulators, Emulators, and Real Devices

When launched, Mobile MCP can connect to:
- iOS Simulators on macOS/Linux
- Android Emulators on Linux/Windows/macOS
- iOS or Android real devices (requires proper platform tools and drivers)

Make sure you have your mobile platform SDKs (Xcode, Android SDK) installed and configured properly before running Mobile Next Mobile MCP.

### Running in "headless" mode on Simulators/Emulators

When you do not have a real device connected to your machine, you can run Mobile MCP with an emulator or simulator in the background.

For example, on Android:
1. Start an emulator (avdmanager / emulator command).
2. Run Mobile MCP with the desired flags

On iOS, you'll need Xcode and to run the Simulator before using Mobile MCP with that simulator instance.
- `xcrun simctl list`
- `xcrun simctl boot "iPhone 16"`

## 🚀 Cloud Run へのデプロイ

Mobile MCPサーバーをGoogle Cloud Runにデプロイして、リモートからアクセスできるようにすることができます。

### 前提条件

1. **Google Cloud SDKのインストール**
   ```bash
   # macOS
   brew install google-cloud-sdk

   # または公式インストーラーを使用
   # https://cloud.google.com/sdk/docs/install
   ```

2. **Google Cloud プロジェクトの作成**
   - [Google Cloud Console](https://console.cloud.google.com/) にアクセス
   - 新しいプロジェクトを作成、または既存のプロジェクトを選択
   - プロジェクトIDをメモしておく

3. **認証とプロジェクト設定**
   ```bash
   # Google Cloudにログイン
   gcloud auth login

   # プロジェクトを設定
   gcloud config set project YOUR_PROJECT_ID

   # Docker認証を設定（Container Registry用）
   gcloud auth configure-docker gcr.io

   # 現在の設定を確認
   gcloud config list
   ```

4. **必要なAPIの有効化**
   ```bash
   # Cloud Build API
   gcloud services enable cloudbuild.googleapis.com

   # Container Registry API
   gcloud services enable containerregistry.googleapis.com

   # Cloud Run API
   gcloud services enable run.googleapis.com

   # すべてのAPIが有効か確認
   gcloud services list --enabled
   ```

5. **必要な権限の確認**
   - Cloud Build Editor ロール
   - Cloud Run Admin ロール
   - Service Account User ロール
   - Storage Admin ロール（Container Registry用）

### デプロイ方法

#### 方法1: Makefileを使用（推奨）

最も簡単で推奨される方法です。

**ステップ1: プロジェクトIDの設定**
```bash
# 環境変数で設定（このセッションのみ有効）
export PROJECT_ID=your-project-id

# または、gcloud configで永続的に設定
gcloud config set project your-project-id
```

**ステップ2: 利用可能なコマンドの確認**
```bash
make help
```

**ステップ3: Dockerイメージのビルド**
```bash
# ローカルでDockerイメージをビルド
make docker-build

# ビルドが成功したことを確認
docker images | grep mobile-mcp-server
```

**ステップ4: ローカルでのテスト（オプション）**
```bash
# ローカルでDockerコンテナを実行してテスト
make docker-run

# 別のターミナルでヘルスチェック
curl http://localhost:8080/health
```

**ステップ5: Container Registryへのプッシュ**
```bash
# DockerイメージをContainer Registryにプッシュ
make docker-push

# プッシュが成功したことを確認
gcloud container images list --repository=gcr.io/$(gcloud config get-value project)
```

**ステップ6: Cloud Runへのデプロイ**
```bash
# Cloud Runにデプロイ（ビルド済みイメージを使用）
make cloud-run-deploy

# デプロイが完了すると、サービスURLが表示されます
# 例: https://mobile-mcp-server-xxxxx-an.a.run.app
```

**ステップ7: デプロイの確認**
```bash
# サービス情報を確認
make cloud-run-describe

# ログを確認
make cloud-run-logs

# ヘルスチェック
curl https://your-service-url.run.app/health
```

**代替: Cloud Buildを使用した一括デプロイ**
```bash
# Cloud Buildでビルド、プッシュ、デプロイを一括実行
make cloud-run-build
```

#### 方法2: デプロイスクリプトを使用

シェルスクリプトを使用した簡単なデプロイ方法です。

```bash
# プロジェクトIDを設定
export GOOGLE_CLOUD_PROJECT=your-project-id

# デプロイスクリプトに実行権限を付与（初回のみ）
chmod +x cloud-run-deploy.sh

# デプロイスクリプトを実行
./cloud-run-deploy.sh
```

このスクリプトは以下を自動的に実行します：
1. Dockerイメージのビルド
2. Container Registryへのプッシュ
3. Cloud Runへのデプロイ

#### 方法3: Cloud Buildを使用

Cloud Buildを使用して、GCP上でビルドとデプロイを一括実行します。

```bash
# プロジェクトIDを設定
gcloud config set project your-project-id

# Cloud Buildでビルドとデプロイを実行
gcloud builds submit --config cloudbuild.yaml

# または、Makefileを使用
make cloud-run-build
```

この方法の利点：
- ローカルにDockerをインストールする必要がない
- ビルドがGCP上で実行されるため、一貫性が保たれる
- CI/CDパイプラインに組み込みやすい

#### 方法4: 手動でデプロイ（詳細な制御が必要な場合）

各ステップを手動で実行する方法です。細かい制御が必要な場合に使用します。

**ステップ1: Dockerイメージのビルド**
```bash
# プロジェクトIDを取得
PROJECT_ID=$(gcloud config get-value project)

# Dockerイメージをビルド
docker build -t gcr.io/${PROJECT_ID}/mobile-mcp-server:latest .
```

**ステップ2: Container Registryへのプッシュ**
```bash
# Docker認証を設定（初回のみ、または認証エラーが発生した場合）
gcloud auth configure-docker gcr.io

# イメージをプッシュ
docker push gcr.io/${PROJECT_ID}/mobile-mcp-server:latest
```

**ステップ3: Cloud Runへのデプロイ**
```bash
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
  --timeout 300 \
  --set-env-vars PORT=8080
```

**カスタム設定の例**
```bash
# CORSを制限する場合
gcloud run deploy mobile-mcp-server \
  --image gcr.io/${PROJECT_ID}/mobile-mcp-server:latest \
  --set-env-vars ALLOWED_ORIGINS=https://example.com,https://app.example.com \
  --memory 512Mi \
  --min-instances 1 \
  --max-instances 20 \
  ...
```

### MCPクライアントからの接続

Cloud Runにデプロイしたサーバーに接続するには、MCPクライアントの設定でHTTPエンドポイントを指定します：

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

### 環境変数

Cloud Runで以下の環境変数を設定できます：

- `PORT`: サーバーのポート番号（デフォルト: 8080）
- `ALLOWED_ORIGINS`: CORSで許可するオリジンをカンマ区切りで指定（例: `https://example.com,https://app.example.com`）。未設定の場合は`*`（すべてのオリジンを許可）

**環境変数の設定方法**

方法1: デプロイ時に設定
```bash
gcloud run deploy mobile-mcp-server \
  --set-env-vars ALLOWED_ORIGINS=https://example.com,https://app.example.com \
  --set-env-vars PORT=8080 \
  ...
```

方法2: 既存サービスの更新
```bash
gcloud run services update mobile-mcp-server \
  --set-env-vars ALLOWED_ORIGINS=https://example.com \
  --region asia-northeast1
```

方法3: Makefileで設定
```bash
# Makefileのcloud-run-deployターゲットを編集して環境変数を追加
# または、直接gcloudコマンドを実行
```

### デプロイ後の確認とトラブルシューティング

**1. サービスURLの確認**
```bash
# サービスURLを取得
gcloud run services describe mobile-mcp-server \
  --region asia-northeast1 \
  --format 'value(status.url)'
```

**2. ヘルスチェック**
```bash
# ヘルスチェックエンドポイントをテスト
curl https://your-service-url.run.app/health

# 期待されるレスポンス: {"status":"ok"}
```

**3. ログの確認**
```bash
# リアルタイムでログを確認
gcloud run services logs tail mobile-mcp-server \
  --region asia-northeast1

# または、Makefileを使用
make cloud-run-logs
```

**4. サービスの詳細情報**
```bash
# サービスの設定とステータスを確認
make cloud-run-describe

# または、直接gcloudコマンドを使用
gcloud run services describe mobile-mcp-server \
  --region asia-northeast1
```

**5. トラブルシューティング**

問題: デプロイが失敗する
```bash
# ビルドログを確認
gcloud builds list --limit=5

# 特定のビルドのログを確認
gcloud builds log BUILD_ID
```

問題: サービスが起動しない
```bash
# ログを確認してエラーを特定
make cloud-run-logs

# メモリ不足の場合は、メモリを増やす
gcloud run services update mobile-mcp-server \
  --memory 512Mi \
  --region asia-northeast1
```

問題: CORSエラーが発生する
```bash
# ALLOWED_ORIGINS環境変数を設定
gcloud run services update mobile-mcp-server \
  --set-env-vars ALLOWED_ORIGINS=https://your-domain.com \
  --region asia-northeast1
```

### サービスの更新と削除

**サービスの更新**
```bash
# 新しいイメージをビルドしてプッシュ
make docker-build
make docker-push

# サービスを更新
make cloud-run-deploy
```

**サービスの削除**
```bash
# 確認付きで削除
make cloud-run-delete

# または、直接gcloudコマンドを使用
gcloud run services delete mobile-mcp-server \
  --region asia-northeast1 \
  --quiet
```

### リソース設定とコスト最適化

**デフォルト設定（コスト最適化済み）**
- **メモリ**: 384Mi（MCPサーバーには十分）
- **CPU**: 1コア
- **最小インスタンス**: 0（コールドスタートを許容、コスト削減）
- **最大インスタンス**: 10
- **タイムアウト**: 300秒（5分）

**パフォーマンス重視の設定**
```bash
gcloud run deploy mobile-mcp-server \
  --memory 512Mi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 20 \
  ...
```

**コスト削減の設定**
```bash
gcloud run deploy mobile-mcp-server \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  ...
```

**コスト見積もり**
- Cloud Runはリクエスト数と実行時間に基づいて課金されます
- 無料枠: 月200万リクエスト、360,000 GB秒、180,000 vCPU秒
- 詳細: [Cloud Run の料金](https://cloud.google.com/run/pricing)

### 注意事項

- **トランスポート**: Cloud Runでは、Streamable HTTPトランスポートのみがサポートされています（stdioトランスポートは使用できません）
- **デフォルト動作**: サーバーはStreamable HTTPトランスポートで起動します
- **ヘルスチェック**: `https://your-service-url.run.app/health` で確認可能
- **セキュリティ**: 本番環境では`ALLOWED_ORIGINS`環境変数でCORSを制限することを強く推奨します
- **認証**: 本番環境では`--no-allow-unauthenticated`を使用して認証を有効にすることを検討してください
- **リージョン**: デフォルトは`asia-northeast1`（東京）です。ユーザーに近いリージョンを選択することでレイテンシを削減できます

### 参考リンク

- [Google Cloud Run のドキュメント](https://docs.cloud.google.com/run/docs/host-mcp-servers?hl=ja)
- [Cloud Run で MCP サーバーをホストする](https://docs.cloud.google.com/run/docs/host-mcp-servers?hl=ja)
- [Cloud Run の料金](https://cloud.google.com/run/pricing)
- [Cloud Build のドキュメント](https://cloud.google.com/build/docs)

# Thanks to all contributors ❤️

### We appreciate everyone who has helped improve this project.

  <a href = "https://github.com/mobile-next/mobile-mcp/graphs/contributors">
   <img src = "https://contrib.rocks/image?repo=mobile-next/mobile-mcp"/>
 </a>

