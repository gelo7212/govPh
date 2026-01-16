export interface Logger {
  info(message: string, data?: any): void;
  error(message: string, error?: any): void;
  warn(message: string, data?: any): void;
  debug(message: string, data?: any): void;
}

export const createLogger = (context: string): Logger => {
  const timestamp = () => new Date().toISOString();

  return {
    info: (message: string, data?: any) => {
      console.log(`[${timestamp()}] [${context}] INFO: ${message}`, data || '');
    },
    error: (message: string, error?: any) => {
      console.error(`[${timestamp()}] [${context}] ERROR: ${message}`, error || '');
    },
    warn: (message: string, data?: any) => {
      console.warn(`[${timestamp()}] [${context}] WARN: ${message}`, data || '');
    },
    debug: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[${timestamp()}] [${context}] DEBUG: ${message}`, data || '');
      }
    },
  };
};
