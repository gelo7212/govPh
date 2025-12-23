import { BaseClient } from './base.client';

/**
 * SOS Service Client
 * Shared client for communicating with the sos-service microservice
 */
export class SosServiceClient extends BaseClient {
  constructor(baseURL: string) {
    super(baseURL);
  }

  async createSosRequest(data: any) {
    try {
      const response = await this.client.post('/sos', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSosRequest(sosId: string) {
    try {
      const response = await this.client.get(`/sos/${sosId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSosRequestsByUser(userId: string) {
    try {
      const response = await this.client.get(`/sos/user/${userId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllSosRequests(filters?: any) {
    try {
      const response = await this.client.get('/sos', { params: filters });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserSosRequests(userId: string) {
    try {
      const response = await this.client.get(`/sos/user/${userId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateSosRequest(sosId: string, data: any) {
    try {
      const response = await this.client.patch(`/sos/${sosId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateSosStatus(sosId: string, status: string) {
    try {
      const response = await this.client.patch(`/sos/${sosId}/status`, { status });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async cancelSosRequest(sosId: string) {
    try {
      const response = await this.client.delete(`/sos/${sosId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async assignRescuer(sosId: string, rescuerId: string) {
    try {
      const response = await this.client.post(`/sos/${sosId}/assign`, { rescuerId });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async trackSosRequest(sosId: string) {
    try {
      const response = await this.client.get(`/sos/${sosId}/tracking`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
