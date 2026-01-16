/**
 * Logger utility for consistent logging across the service
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: any): void;
}

export function createLogger(context: string): Logger {
  const prefix = `[${context}]`;
  const timestamp = () => new Date().toISOString();

  return {
    debug(message: string, data?: any) {
      if (process.env.LOG_LEVEL === 'debug') {
        console.debug(`${timestamp()} ${prefix} [DEBUG] ${message}`, data || '');
      }
    },
    info(message: string, data?: any) {
      console.log(`${timestamp()} ${prefix} [INFO] ${message}`, data || '');
    },
    warn(message: string, data?: any) {
      console.warn(`${timestamp()} ${prefix} [WARN] ${message}`, data || '');
    },
    error(message: string, error?: any) {
      console.error(`${timestamp()} ${prefix} [ERROR] ${message}`, error || '');
    },
  };
}
