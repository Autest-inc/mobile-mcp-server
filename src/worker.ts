// Cloudflare Workers用のエントリーポイント
// 注意: このプロジェクトはNode.js固有の機能（fs、os、crypto、child_processなど）を
// 使用しているため、Cloudflare Workersでは完全に動作しない可能性があります。

// ExecutionContext型の定義（Cloudflare Workers用）
interface ExecutionContext {
	waitUntil(promise: Promise<any>): void;
	passThroughOnException(): void;
}

// セッション管理用のMap
const sessions = new Map<string, { writer: WritableStreamDefaultWriter; encoder: TextEncoder }>();

export default {
	async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// ヘルスチェック用のエンドポイント
		if (url.pathname === "/health") {
			return new Response(JSON.stringify({ status: "ok" }), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		// MCPエンドポイント - GET: SSE接続開始
		if (url.pathname === "/mcp" && request.method === "GET") {
			const sessionId = crypto.randomUUID();

			const { readable, writable } = new TransformStream();
			const writer = writable.getWriter();
			const encoder = new TextEncoder();

			// セッションを保存
			sessions.set(sessionId, { writer, encoder });

			// エンドポイントイベントを送信
			const endpointEvent = `event: endpoint\ndata: /mcp?sessionId=${sessionId}\n\n`;
			await writer.write(encoder.encode(endpointEvent));

			// クリーンアップ（タイムアウト後にセッションを削除）
			ctx.waitUntil(
				new Promise<void>((resolve) => {
					setTimeout(() => {
						sessions.delete(sessionId);
						writer.close().catch(() => {});
						resolve();
					}, 30 * 60 * 1000) // 30分後にクリーンアップ
				})
			);

			return new Response(readable, {
				status: 200,
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache, no-transform",
					"Connection": "keep-alive",
				},
			});
		}

		// MCPエンドポイント - POST: メッセージ受信
		if (url.pathname === "/mcp" && request.method === "POST") {
			const sessionId = url.searchParams.get("sessionId");

			if (!sessionId) {
				return new Response(JSON.stringify({ error: "Missing sessionId" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			const session = sessions.get(sessionId);
			if (!session) {
				return new Response(JSON.stringify({ error: "Session not found. Please establish SSE connection first via GET /mcp" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			try {
				const body = await request.json();

				// 注意: ここでMCPメッセージを処理する必要がありますが、
				// Node.js固有の機能（fs、child_processなど）が必要なため、
				// Cloudflare Workersでは完全なMCP機能は動作しません。

				// 基本的なレスポンスを返す
				const responseMessage = {
					jsonrpc: "2.0",
					id: body.id,
					error: {
						code: -32601,
						message: "MCP server requires Node.js environment. Mobile device operations are not available in Cloudflare Workers."
					}
				};

				// SSEでレスポンスを送信
				const sseMessage = `event: message\ndata: ${JSON.stringify(responseMessage)}\n\n`;
				await session.writer.write(session.encoder.encode(sseMessage));

				return new Response("Accepted", {
					status: 202,
				});
			} catch (error: any) {
				return new Response(JSON.stringify({ error: error.message }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// その他のリクエスト
		return new Response("mobile-mcp server", {
			status: 200,
			headers: {
				"Content-Type": "text/plain",
			},
		});
	},
};
