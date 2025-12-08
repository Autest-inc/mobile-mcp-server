/**
 * 環境設定と検出ロジック
 *
 * このモジュールは、ローカル環境とCloud Run環境を検出し、
 * 環境ごとに適切な設定を提供します。
 */

export type Environment = "local" | "cloud-run";

export interface ServerConfig {
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

/**
 * 実行環境を検出
 */
export const detectEnvironment = (): Environment => {
	// Cloud Run環境の検出
	// K_SERVICEとK_REVISIONはCloud Runが自動的に設定する環境変数
	if (process.env.K_SERVICE || process.env.K_REVISION) {
		return "cloud-run";
	}

	// ローカル環境
	return "local";
};

/**
 * 環境に応じた設定を取得
 */
export const getServerConfig = (): ServerConfig => {
	const environment = detectEnvironment();
	const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8081;

	// CORS設定
	const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
	const allowedOrigins = allowedOriginsEnv
		? allowedOriginsEnv.split(",").map(o => o.trim())
		: ["*"]; // デフォルトはすべてのオリジンを許可

	// Cloud Run環境では、credentialsと*を同時に使用できない
	// ローカル環境では、特定のオリジンが指定されている場合のみcredentialsを許可
	const allowCredentials = environment === "local"
		&& !allowedOrigins.includes("*")
		&& allowedOrigins.length > 0;

	return {
		environment,
		port,
		host: environment === "cloud-run" ? "0.0.0.0" : "0.0.0.0", // 両方とも0.0.0.0でリッスン
		cors: {
			allowedOrigins,
			allowCredentials,
		},
		transport: {
			streamable: true,
			sse: true,
		},
		logging: {
			debugAuth: process.env.DEBUG_AUTH === "true",
			logFile: process.env.LOG_FILE,
		},
	};
};

/**
 * 環境情報をログに出力（デバッグ用）
 */
export const logEnvironmentInfo = (config: ServerConfig): void => {
	if (config.logging.debugAuth) {
		console.log(`[Config] Environment: ${config.environment}`);
		console.log(`[Config] Port: ${config.port}`);
		console.log(`[Config] Host: ${config.host}`);
		console.log(`[Config] CORS Allowed Origins: ${config.cors.allowedOrigins.join(", ")}`);
		console.log(`[Config] CORS Allow Credentials: ${config.cors.allowCredentials}`);
	}
};
