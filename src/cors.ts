/**
 * CORS設定モジュール
 *
 * 環境に応じたCORS設定を提供します。
 */

import type { Request, Response, NextFunction } from "express";
import type { ServerConfig } from "./config";
import { trace } from "./logger";

/**
 * CORSミドルウェアを作成
 */
export const createCorsMiddleware = (config: ServerConfig) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const origin = req.headers.origin;

		// デバッグ用: CORS関連のヘッダーをログに記録
		if (config.logging.debugAuth) {
			trace(`CORS - Origin: ${origin}, Allowed: ${JSON.stringify(config.cors.allowedOrigins)}`);
		}

		// CORS設定: すべてのオリジンを許可するか、特定のオリジンを許可
		// 注意: Access-Control-Allow-Credentials: true と Access-Control-Allow-Origin: * は同時に設定できない
		if (config.cors.allowedOrigins.includes("*")) {
			// すべてのオリジンを許可（Claude APIなど外部からのアクセスに対応）
			res.setHeader("Access-Control-Allow-Origin", "*");
			// credentialsは*と同時に使用できないため設定しない
		} else if (origin && config.cors.allowedOrigins.includes(origin)) {
			// 特定のオリジンのみ許可
			res.setHeader("Access-Control-Allow-Origin", origin);
			if (config.cors.allowCredentials) {
				res.setHeader("Access-Control-Allow-Credentials", "true");
			}
		} else if (!origin) {
			// originヘッダーがない場合（Claude APIなど）も許可
			res.setHeader("Access-Control-Allow-Origin", "*");
			// credentialsは*と同時に使用できないため設定しない
		}

		res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
		// すべての必要なヘッダーを許可（Claude API対応）
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, Authorization, X-Requested-With");
		res.setHeader("Access-Control-Max-Age", "86400"); // 24時間

		if (req.method === "OPTIONS") {
			return res.sendStatus(204);
		}
		next();
	};
};
