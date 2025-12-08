#!/usr/bin/env node
/**
 * Mobile MCP Server - Entry Point
 *
 * This server supports multiple deployment modes:
 * - Local development: stdio mode or HTTP server mode
 * - Cloud Run: HTTP server with Streamable HTTP and SSE transports
 *
 * The server automatically detects the environment and applies appropriate settings.
 */

import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer, getAgentVersion } from "./server";
import { error, trace } from "./logger";
import { getServerConfig, logEnvironmentInfo, type ServerConfig } from "./config";
import { createCorsMiddleware } from "./cors";
import express from "express";
import { program } from "commander";
import { randomUUID } from "node:crypto";

const startHttpServer = async (
	port: number,
	transportType: "sse" | "streamable" | "both" = "both",
	configOverride?: Partial<ServerConfig>
) => {
	try {
		// 設定を取得（オーバーライド可能）
		const config = getServerConfig();
		if (configOverride) {
			Object.assign(config, configOverride);
		}

		// ポートをオーバーライド
		if (port) {
			config.port = port;
		}

		// 環境情報をログに出力
		logEnvironmentInfo(config);

		const app = express();
		app.use(express.json());

		// CORS設定（環境に応じて自動設定）
		app.use(createCorsMiddleware(config));

		// ヘルスチェック用エンドポイント（Cloud Run用）
		app.get("/health", (req, res) => {
			res.json({ status: "ok" });
		});

		const server = createMcpServer();

		// SSEトランスポート用（後方互換性のため）
		let sseTransport: SSEServerTransport | null = null;

		// Streamable HTTPトランスポート用（セッション管理）
		const streamableTransports: Record<string, StreamableHTTPServerTransport> = {};

		// Streamable HTTPトランスポートのハンドラー
		if (transportType === "streamable" || transportType === "both") {
			app.post("/mcp", async (req, res) => {
				try {
					// デバッグ用: 認証関連のヘッダーをログに記録
					if (config.logging.debugAuth) {
						trace(`POST /mcp - Headers: ${JSON.stringify({
							"mcp-session-id": req.headers["mcp-session-id"],
							"authorization": req.headers["authorization"] ? "present" : "missing",
							"method": req.body?.method,
							"origin": req.headers.origin,
							"user-agent": req.headers["user-agent"],
							"environment": config.environment
						})}`);
					}

					// Claude APIからのアクセスを許可（認証はオプショナル）
					// Authorizationヘッダーがなくてもアクセスを許可する
					const sessionId = req.headers["mcp-session-id"] as string | undefined;
					let transport: StreamableHTTPServerTransport;

					if (sessionId && streamableTransports[sessionId]) {
						// 既存セッションの再利用
						transport = streamableTransports[sessionId];
					} else if (!sessionId) {
						// セッションIDが提供されていない場合、新しいセッションを作成
						// StreamableHTTPServerTransportは、initializeリクエストを処理する際に
						// 自動的にセッションIDを生成し、onsessioninitializedコールバックを呼び出す
						transport = new StreamableHTTPServerTransport({
							sessionIdGenerator: () => randomUUID(),
							onsessioninitialized: (id: string) => {
								streamableTransports[id] = transport;
								if (config.logging.debugAuth) {
									trace(`Session initialized: ${id} (environment: ${config.environment})`);
								}
							}
						});

						transport.onclose = () => {
							if (transport.sessionId) {
								delete streamableTransports[transport.sessionId];
								if (config.logging.debugAuth) {
									trace(`Session closed: ${transport.sessionId} (environment: ${config.environment})`);
								}
							}
						};

						await server.connect(transport);
					} else {
						// セッションIDが提供されているが、そのセッションが存在しない
						if (config.logging.debugAuth) {
							trace(`Invalid session ID: ${sessionId}, available sessions: ${Object.keys(streamableTransports).join(", ")} (environment: ${config.environment})`);
						}
						res.status(400).json({
							jsonrpc: "2.0",
							error: { code: -32000, message: `Invalid session: session ${sessionId} not found` },
							id: req.body?.id ?? null
						});
						return;
					}

					await transport.handleRequest(req, res, req.body);
				} catch (err: any) {
					error(`Error handling POST /mcp: ${err.message}`);
					if (config.logging.debugAuth) {
						console.error("Full error:", err);
					}
					if (!res.headersSent) {
						res.status(500).json({
							jsonrpc: "2.0",
							error: { code: -32603, message: "Internal error" },
							id: req.body?.id ?? null
						});
					}
				}
			});

			app.get("/mcp", async (req, res) => {
				try {
					const sessionId = req.headers["mcp-session-id"] as string | undefined;
					const transport = sessionId ? streamableTransports[sessionId] : undefined;
					if (transport) {
						await transport.handleRequest(req, res);
					} else {
						res.status(400).json({
							jsonrpc: "2.0",
							error: { code: -32000, message: "Invalid session" },
							id: null
						});
					}
				} catch (err: any) {
					error(`Error handling GET /mcp: ${err.message}`);
					if (!res.headersSent) {
						res.status(500).json({
							jsonrpc: "2.0",
							error: { code: -32603, message: "Internal error" },
							id: null
						});
					}
				}
			});

			app.delete("/mcp", async (req, res) => {
				try {
					const sessionId = req.headers["mcp-session-id"] as string | undefined;
					const transport = sessionId ? streamableTransports[sessionId] : undefined;
					if (transport) {
						await transport.handleRequest(req, res);
					} else {
						res.status(400).json({
							jsonrpc: "2.0",
							error: { code: -32000, message: "Invalid session" },
							id: null
						});
					}
				} catch (err: any) {
					error(`Error handling DELETE /mcp: ${err.message}`);
					if (!res.headersSent) {
						res.status(500).json({
							jsonrpc: "2.0",
							error: { code: -32603, message: "Internal error" },
							id: null
						});
					}
				}
			});
		}

		// SSEトランスポートのハンドラー（後方互換性のため）
		if (transportType === "sse" || transportType === "both") {
			app.post("/sse", async (req, res) => {
				try {
					if (!sseTransport) {
						res.status(400).json({ error: "No SSE connection established. Please connect via GET /sse first." });
						return;
					}
					await sseTransport.handlePostMessage(req, res, req.body);
				} catch (err: any) {
					error(`Error handling POST /sse: ${err.message}`);
					if (!res.headersSent) {
						res.status(500).json({ error: "Internal server error" });
					}
				}
			});

			app.get("/sse", async (req, res) => {
				try {
					res.setHeader("Content-Type", "text/event-stream");
					res.setHeader("Cache-Control", "no-cache, no-transform");
					res.setHeader("Connection", "keep-alive");

					if (sseTransport) {
						await sseTransport.close();
					}

					sseTransport = new SSEServerTransport("/sse", res);
					await server.connect(sseTransport);
				} catch (err: any) {
					error(`Error handling GET /sse: ${err.message}`);
					if (!res.headersSent) {
						res.status(500).json({ error: "Internal server error" });
					}
				}
			});
		}

		app.listen(config.port, config.host, () => {
			const transportInfo = transportType === "both"
				? "Streamable HTTP & SSE"
				: transportType === "streamable"
					? "Streamable HTTP"
					: "SSE";
			error(`mobile-mcp ${getAgentVersion()} ${transportInfo} server listening on http://${config.host}:${config.port}/mcp`);
			error(`Environment: ${config.environment}`);
		}).on("error", (err: any) => {
			if (err.code === "EADDRINUSE") {
				error(`Port ${config.port} is already in use.`);
				error(`Please either:`);
				error(`  1. Stop the process using port ${config.port} (run: lsof -ti:${config.port} | xargs kill)`);
				error(`  2. Use a different port (run: node lib/index.js --port <different-port>)`);
				error(`  3. Set PORT environment variable to a different port`);
			} else {
				error(`Failed to start server: ${err.message}`);
				console.error("Server startup error:", err);
			}
			process.exit(1);
		});
	} catch (err: any) {
		error(`Fatal error in startHttpServer: ${err.message}`);
		console.error("Fatal error:", err);
		process.exit(1);
	}
};

const startStdioServer = async () => {
	try {
		const transport = new StdioServerTransport();

		const server = createMcpServer();
		await server.connect(transport);

		error("mobile-mcp server running on stdio");
	} catch (err: any) {
		console.error("Fatal error in main():", err);
		error("Fatal error in main(): " + JSON.stringify(err.stack));
		process.exit(1);
	}
};

const main = async () => {
	program
		.version(getAgentVersion())
		.option("--port <port>", "Start HTTP server on this port")
		.option("--stdio", "Start stdio server (default)")
		.option("--transport <type>", "Transport type: sse, streamable, or both (default: both)", "both")
		.parse(process.argv);

	const options = program.opts();

	// Cloud Runなどの環境では環境変数PORTが設定されている場合、HTTPサーバーを起動
	const port = options.port ? +options.port : (process.env.PORT ? +process.env.PORT : undefined);

	if (port) {
		const transportType = options.transport === "sse" ? "sse"
			: options.transport === "streamable" ? "streamable"
				: "both";
		await startHttpServer(port, transportType);
	} else if (options.stdio) {
		await startStdioServer();
	} else {
		// デフォルトはstdio（ローカル開発用）
		await startStdioServer();
	}
};

main().then();
