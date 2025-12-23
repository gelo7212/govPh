import axios, { AxiosInstance } from 'axios';

/**
 * Base HTTP Client
 * Provides common functionality for all service clients
 */
export abstract class BaseClient {
  protected client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
    });
  }

  protected async handleError(error: any): Promise<never> {
    if (axios.isAxiosError(error)) {
      throw new Error(`Service error: ${error.response?.statusText || error.message}`);
    }
    throw error;
  }
}
