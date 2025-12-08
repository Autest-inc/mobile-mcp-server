import { appendFileSync } from "node:fs";

// Cloud Run環境を検出（K_SERVICEまたはK_REVISIONが設定されている）
export const isCloudRunEnvironment = (): boolean => {
	return !!(process.env.K_SERVICE || process.env.K_REVISION);
};

const writeLog = (message: string) => {
	if (process.env.LOG_FILE) {
		const logfile = process.env.LOG_FILE;
		const timestamp = new Date().toISOString();
		const levelStr = "INFO";
		const logMessage = `[${timestamp}] ${levelStr} ${message}`;
		appendFileSync(logfile, logMessage + "\n");
	}

	console.error(message);
};

export const trace = (message: string) => {
	writeLog(message);
};

// 警告レベルのログ（Cloud Run環境では抑制）
export const warn = (message: string) => {
	// Cloud Run環境では警告を抑制（デバイスにアクセスできないのは正常）
	if (!isCloudRunEnvironment()) {
		console.warn(message);
	}
};

export const error = (message: string) => {
	writeLog(message);
};
