// Cloudflare Workers用のエントリーポイント

interface ExecutionContext {
	waitUntil(promise: Promise<any>): void;
	passThroughOnException(): void;
}

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

			// SSEレスポンスを即座に返す
			const encoder = new TextEncoder();
			const stream = new ReadableStream({
				start(controller) {
					// エンドポイントイベントを送信
					const endpointEvent = `event: endpoint\ndata: /mcp?sessionId=${sessionId}\n\n`;
					controller.enqueue(encoder.encode(endpointEvent));

					// 接続確認メッセージ
					const pingEvent = `event: message\ndata: ${JSON.stringify({
						jsonrpc: "2.0",
						method: "notifications/initialized",
						params: {}
					})}\n\n`;
					controller.enqueue(encoder.encode(pingEvent));

					// ストリームを閉じない - クライアントが切断するまで維持
					// Cloudflare Workersでは長時間接続は制限があるため、
					// 初期イベント送信後に閉じる
					controller.close();
				}
			});

			return new Response(stream, {
				status: 200,
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache, no-transform",
					"Connection": "keep-alive",
					"Access-Control-Allow-Origin": "*",
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

			try {
				const body = await request.json() as { id?: string | number; method?: string };

				// MCPメッセージを処理してSSE形式でレスポンス
				let responseData: any;

				if (body.method === "initialize") {
					responseData = {
						jsonrpc: "2.0",
						id: body.id,
						result: {
							protocolVersion: "2024-11-05",
							capabilities: {
								tools: {}
							},
							serverInfo: {
								name: "mobile-mcp",
								version: "0.0.1"
							}
						}
					};
				} else if (body.method === "tools/list") {
					responseData = {
						jsonrpc: "2.0",
						id: body.id,
						result: {
							tools: []
						}
					};
				} else {
					responseData = {
						jsonrpc: "2.0",
						id: body.id,
						error: {
							code: -32601,
							message: "MCP server requires Node.js environment for mobile device operations."
						}
					};
				}

				// SSE形式でレスポンスを返す
				const encoder = new TextEncoder();
				const sseMessage = `event: message\ndata: ${JSON.stringify(responseData)}\n\n`;

				return new Response(encoder.encode(sseMessage), {
					status: 200,
					headers: {
						"Content-Type": "text/event-stream",
						"Cache-Control": "no-cache",
						"Access-Control-Allow-Origin": "*",
					},
				});
			} catch (error: any) {
				return new Response(JSON.stringify({ error: error.message }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			});
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
