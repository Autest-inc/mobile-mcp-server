// Cloudflare Workers用のエントリーポイント
// 注意: このプロジェクトはNode.js固有の機能（fs、os、crypto、child_processなど）を
// 使用しているため、Cloudflare Workersでは完全に動作しない可能性があります。

// ExecutionContext型の定義（Cloudflare Workers用）
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
		
		// MCPエンドポイント
		if (url.pathname === "/mcp") {
			// 注意: SSEServerTransportはExpressのreq/resオブジェクトを期待しているため、
			// Cloudflare Workersでは直接使用できません。
			// この実装は基本的なエントリーポイントのエラーを解決するためのものです。
			return new Response(JSON.stringify({ 
				error: "MCP server requires Node.js environment. Cloudflare Workers deployment may not be fully supported." 
			}), {
				status: 501,
				headers: {
					"Content-Type": "application/json",
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

