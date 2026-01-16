import { BaseClient, UserContext } from './base.client';
import {
  FormSchemaData,
  FormSchemaResponse,
  CreateFormSchemaRequest,
  UpdateFormSchemaRequest,
  PaginatedResponse,
  ListSchemasFilters,
  SubmissionData,
  SubmissionResponse,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  ListSubmissionsFilters,
  DraftData,
  DraftResponse,
  CreateDraftRequest,
  UpdateDraftRequest,
  ListDraftsFilters,
  ValidationResponse,
  ValidateFormDataRequest,
} from '../submission/submission.types';

/**
 * Submission Service Client
 * Manages form schemas, submissions, drafts, and form validation
 */
export class SubmissionServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
    console.log(`SubmissionServiceClient initialized with baseURL: ${baseURL}`);
  }

  // ==================== SCHEMAS ====================

  /**
   * Get all form schemas with optional filtering
   * GET /api/schemas
   */
  async getAllSchemas(
    filters?: ListSchemasFilters,
    token?: string
  ): Promise<PaginatedResponse<FormSchemaData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.get('/api/schemas', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a specific form schema by ID
   * GET /api/schemas/:id
   */
  async getSchemaById(
    schemaId: string,
    token?: string
  ): Promise<FormSchemaResponse<FormSchemaData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.get(`/api/schemas/${schemaId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new form schema
   * POST /api/schemas
   */
  async createSchema(
    data: CreateFormSchemaRequest,
    token?: string
  ): Promise<FormSchemaResponse<FormSchemaData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.post('/api/schemas', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update a form schema
   * PUT /api/schemas/:id
   */
  async updateSchema(
    schemaId: string,
    data: UpdateFormSchemaRequest,
    token?: string
  ): Promise<FormSchemaResponse<FormSchemaData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.put(`/api/schemas/${schemaId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a form schema
   * DELETE /api/schemas/:id
   */
  async deleteSchema(schemaId: string, token?: string): Promise<FormSchemaResponse> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.delete(`/api/schemas/${schemaId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Publish a form schema
   * POST /api/schemas/:id/publish
   */
  async publishSchema(
    schemaId: string,
    token?: string
  ): Promise<FormSchemaResponse<FormSchemaData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.post(`/api/schemas/${schemaId}/publish`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== SUBMISSIONS ====================

  /**
   * Get all form submissions with optional filtering
   * GET /api/submissions
   */
  async getAllSubmissions(
    filters?: ListSubmissionsFilters,
    token?: string
  ): Promise<PaginatedResponse<SubmissionData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.get('/api/submissions', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a specific form submission by ID
   * GET /api/submissions/:id
   */
  async getSubmissionById(
    submissionId: string,
    token?: string
  ): Promise<SubmissionResponse<SubmissionData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.get(`/api/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new form submission
   * POST /api/submissions
   */
  async createSubmission(
    data: CreateSubmissionRequest,
    token?: string
  ): Promise<SubmissionResponse<SubmissionData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.post('/api/submissions', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update a form submission (change status, add notes)
   * PUT /api/submissions/:id
   */
  async updateSubmission(
    submissionId: string,
    data: UpdateSubmissionRequest,
    token?: string
  ): Promise<SubmissionResponse<SubmissionData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.put(
        `/api/submissions/${submissionId}`,
        data
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a form submission
   * DELETE /api/submissions/:id
   */
  async deleteSubmission(submissionId: string, token?: string): Promise<SubmissionResponse> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.delete(`/api/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== DRAFTS ====================

  /**
   * Get all draft submissions with optional filtering
   * GET /api/drafts
   */
  async getAllDrafts(
    filters?: ListDraftsFilters,
    token?: string
  ): Promise<PaginatedResponse<DraftData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.get('/api/drafts', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a specific draft by ID
   * GET /api/drafts/:id
   */
  async getDraftById(draftId: string, token?: string): Promise<DraftResponse<DraftData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.get(`/api/drafts/${draftId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Save a draft (creates new or updates existing)
   * POST /api/drafts
   */
  async saveDraft(
    data: CreateDraftRequest,
    token?: string
  ): Promise<DraftResponse<DraftData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.post('/api/drafts', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update a draft
   * PUT /api/drafts/:id
   */
  async updateDraft(
    draftId: string,
    data: UpdateDraftRequest,
    token?: string
  ): Promise<DraftResponse<DraftData>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.put(`/api/drafts/${draftId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a draft
   * DELETE /api/drafts/:id
   */
  async deleteDraft(draftId: string, token?: string): Promise<DraftResponse> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.delete(`/api/drafts/${draftId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== VALIDATIONS ====================

  /**
   * Validate form data against a schema
   * POST /api/validations/validate
   */
  async validateFormData(
    data: ValidateFormDataRequest,
    token?: string
  ): Promise<ValidationResponse> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.post('/api/validations/validate', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
