/**
 * Simple Logger Utility
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: any): void;
}

export function createLogger(moduleName: string): Logger {
  const currentLevel =
    LogLevel[
      (process.env.LOG_LEVEL || 'INFO') as keyof typeof LogLevel
    ] ?? LogLevel.INFO;

  const formatLog = (
    level: string,
    message: string,
    data?: any
  ) => {
    const timestamp = new Date().toISOString();
    const logData = data ? ` | ${JSON.stringify(data)}` : '';
    console.log(
      `[${timestamp}] [${level}] [${moduleName}] ${message}${logData}`
    );
  };

  return {
    debug: (message, meta) => {
      if (currentLevel <= LogLevel.DEBUG) {
        formatLog('DEBUG', message, meta);
      }
    },
    info: (message, meta) => {
      if (currentLevel <= LogLevel.INFO) {
        formatLog('INFO', message, meta);
      }
    },
    warn: (message, meta) => {
      if (currentLevel <= LogLevel.WARN) {
        formatLog('WARN', message, meta);
      }
    },
    error: (message, error) => {
      if (currentLevel <= LogLevel.ERROR) {
        const errorData = error instanceof Error ? error.message : error;
        formatLog('ERROR', message, errorData);
      }
    },
  };
}
