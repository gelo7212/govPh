import { BaseClient } from './base.client';

/**
 * Geo Service Client
 * Shared client for communicating with the geo-service microservice
 */
export class GeoServiceClient extends BaseClient {
  constructor(baseURL: string) {
    super(baseURL);
  }

  async getBoundaries(filters?: any) {
    try {
      const response = await this.client.get('/boundaries', { params: filters });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getBoundaryById(boundaryId: string) {
    try {
      const response = await this.client.get(`/boundaries/${boundaryId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async searchBoundaries(query: string) {
    try {
      const response = await this.client.get('/boundaries/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createBoundary(data: any) {
    try {
      const response = await this.client.post('/boundaries', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateBoundary(boundaryId: string, data: any) {
    try {
      const response = await this.client.patch(`/boundaries/${boundaryId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteBoundary(boundaryId: string) {
    try {
      const response = await this.client.delete(`/boundaries/${boundaryId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
