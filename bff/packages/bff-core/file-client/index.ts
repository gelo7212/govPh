import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  File,
  FileServiceClientConfig,
  ListFilesQuery,
  ListFilesResponse,
  UploadFileResponse,
  ApiResponse,
} from './types';

export class FileServiceClient {
  private client: AxiosInstance;
  private config: FileServiceClientConfig;

  constructor(config: FileServiceClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
    });

    // Add interceptor to inject token
    this.client.interceptors.request.use(async (config) => {
      const token = await this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Upload a file
   * @param formData FormData containing file and metadata
   */
  async uploadFile(formData: FormData): Promise<UploadFileResponse> {
    try {
      const response = await this.client.post<ApiResponse<UploadFileResponse>>(
        '/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to upload file');
      }

      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get file metadata
   * @param fileId File ID
   */
  async getFileMetadata(fileId: string): Promise<File> {
    try {
      const response = await this.client.get<ApiResponse<File>>(`/${fileId}`);

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to get file metadata');
      }

      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download a file
   * @param fileId File ID
   * @returns File buffer
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.client.get<ArrayBuffer>(
        `/${fileId}/download`,
        {
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List files with optional filters
   * @param query Query parameters
   */
  async listFiles(query?: ListFilesQuery): Promise<ListFilesResponse> {
    try {
      const response = await this.client.get<ApiResponse<ListFilesResponse>>(
        '/',
        { params: query }
      );

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to list files');
      }

      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a file
   * @param fileId File ID
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      const response = await this.client.delete<ApiResponse<{ deleted: boolean }>>(
        `/${fileId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to delete file');
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get list of files for a specific owner
   * @param ownerType Type of owner (INCIDENT, USER, etc.)
   * @param ownerId Owner ID
   */
  async getFilesForOwner(
    ownerType: string,
    ownerId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<ListFilesResponse> {
    return this.listFiles({
      ownerType: ownerType as any,
      ownerId,
      limit,
      skip,
    });
  }

  /**
   * Get the current authorization token
   */
  private async getToken(): Promise<string | undefined> {
    if (this.config.token) {
      return this.config.token;
    }

    if (this.config.getToken) {
      return this.config.getToken();
    }

    return undefined;
  }

  /**
   * Handle axios errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      const { data, status } = error.response;
      const message = data?.error?.message || error.message;
      const code = data?.error?.code || 'UNKNOWN_ERROR';

      const err = new Error(message);
      (err as any).code = code;
      (err as any).statusCode = status;

      return err;
    }

    if (error.request) {
      return new Error('No response from file service');
    }

    return error;
  }
}

export { FileServiceAggregator } from './aggregator';
export type { File, UploadFileResponse, ListFilesResponse, ListFilesQuery, FileServiceClientConfig, ApiResponse } from './types';

export default FileServiceClient;
