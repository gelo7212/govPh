import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import http from 'http';
import https from 'https';

/**
 * Service Error - Custom error class for service responses
 */
export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ServiceError';
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

/**
 * User context to be passed through service calls
 */
export interface UserContext {
  userId?: string;
  role?: string;
  cityId?: string;
  requestId?: string;
  actorType?: string;
  authorization?: string;
}

/**
 * Base HTTP Client
 * Provides common functionality for all service clients
 */
export abstract class BaseClient {
  protected client: AxiosInstance;
  protected userContext?: UserContext;

  constructor(baseURL: string, userContext?: UserContext) {
    this.userContext = userContext;
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      httpAgent: new http.Agent({ family: 4 }),
      httpsAgent: new https.Agent({ family: 4 }),
      headers: {
        // 'Authorization': 'Bearer service-token',
        'x-internal-token': process.env.INTERNAL_AUTH_TOKEN || '',
      },
    });

    // Add interceptor to include user context headers and log requests
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.userContext) {
        if (this.userContext.userId) {
          config.headers['x-user-id'] = this.userContext.userId;
        }
        if (this.userContext.role) {
          config.headers['x-user-role'] = this.userContext.role;
        }
        if (this.userContext.actorType) {
          config.headers['x-actor-type'] = this.userContext.actorType;
        }
        if (this.userContext.cityId) {
          config.headers['x-city-id'] = this.userContext.cityId;
        }
        if (this.userContext.requestId) {
          config.headers['x-request-id'] = this.userContext.requestId;
        }
        if(this.userContext.authorization){
          const token = this.userContext.authorization.startsWith('Bearer ') ? this.userContext.authorization.split(' ')[1] : this.userContext.authorization;
          
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Log all intercepted requests
      console.log('[BaseClient Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        body: config.data,
      });

      return config;
    });
  }

  /**
   * Set or update user context for subsequent requests
   */
  setUserContext(context?: UserContext): void {
    this.userContext = context;
  }

  protected async handleError(error: any): Promise<never> {
    if (axios.isAxiosError(error)) {


      // Handle HTTP response errors
      const status = error.response?.status || 500;
      const statusText = error.response?.statusText || '';
      const data = error.response?.data;

      console.log('Error response data:', data);

      // Extract error details from response
      let errorCode = 'SERVICE_ERROR';
      let errorMessage = 'An error occurred while processing your request';
      let details: Record<string, any> | undefined;

      if (data) {
        if (typeof data === 'object') {
          // Handle error response objects
          errorCode = data.error?.code || data.code || errorCode ;
          errorMessage = data.error?.message || data.message || data.error || errorMessage;

          // Include additional details for debugging (sanitized)
          if (data.error && typeof data.error === 'object') {
            details = { code: data.error.code, type: data.error.type };
          }
        } else if (typeof data === 'string') {
          // For string responses
          errorMessage = data;
        }

        console.error(`Service API Error [${status}]:`, {
          status,
          statusText,
          code: errorCode,
          message: errorMessage,
          url: error.config?.url,
          data: error.response?.data,
          details,
        });

        throw new ServiceError(errorCode, errorMessage, status, details);
      }

            // Handle network/connection errors
      if (error.code) {
        const code = error.code as string;
        let errorCode = 'SERVICE_UNAVAILABLE';
        let errorMessage = 'Service is currently unavailable';
        let statusCode = 503;

        switch (code) {
          case 'ECONNREFUSED':
            errorMessage = 'Cannot connect to service. Service may be unavailable.';
            break;
          case 'ENOTFOUND':
            errorMessage = 'Service host not found. Check service configuration.';
            break;
          case 'ETIMEDOUT':
          case 'ECONNABORTED':
            errorMessage = 'Service connection timed out.';
            break;
          case 'ERR_NETWORK':
            errorMessage = 'Network error while connecting to service.';
            break;
          default:
            errorMessage = `Service connection error: ${code}`;
        }

        console.error(`Service Connection Error [${code}]:`, {
          code,
          message: errorMessage,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });

        throw new ServiceError(errorCode, errorMessage, statusCode);
      }

    }

    // Handle non-axios errors
    console.error('Unexpected error:', error);
    throw error;
  }
}
