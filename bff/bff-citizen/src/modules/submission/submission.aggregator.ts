import { SubmissionServiceClient, SubmissionAggregator, FileServiceClient, UploadFileRequest } from '@gov-ph/bff-core';
import {
  FormSchemaData,
  SubmissionData,
  DraftData,
  ListSchemasFilters,
  ListSubmissionsFilters,
  ListDraftsFilters,
  CreateFormSchemaRequest,
  UpdateFormSchemaRequest,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  CreateDraftRequest,
  UpdateDraftRequest,
  ValidateFormDataRequest,
  PaginatedResponse,
} from '@gov-ph/bff-core';

/**
 * Admin Submission Service Aggregator
 * Wraps SubmissionServiceClient for admin form management
 */
export class AdminSubmissionAggregator {
  private submissionClient: SubmissionServiceClient;
  private fileServiceClient: FileServiceClient;

  constructor(submissionClient: SubmissionServiceClient) {
    this.submissionClient = submissionClient;
    this.fileServiceClient = new FileServiceClient( process.env.FILE_SERVICE_URL || 'http://govph-file-management-service:3000');
  }

  // ==================== SCHEMAS ====================

  /**
   * Get schema by ID
   */
  async getSchemaById(
    schemaId: string,
    token?: string
  ): Promise<any> {
    return this.submissionClient.getSchemaById(schemaId, token);
  }

  /**
   * Update form schema
   */
  async updateSchema(
    schemaId: string,
    data: UpdateFormSchemaRequest,
    token?: string
  ): Promise<any> {
    return this.submissionClient.updateSchema(schemaId, data, token);
  }

  // ==================== SUBMISSIONS ====================

  /**
   * Get all submissions with filtering
   */
  async getAllSubmissions(
    filters?: ListSubmissionsFilters,
    token?: string
  ): Promise<PaginatedResponse<SubmissionData>> {
    return this.submissionClient.getAllSubmissions(filters, token);
  }

  /**
   * Get submission by ID with schema context
   */
  async getSubmissionByIdWithContext(
    submissionId: string,
    token?: string
  ): Promise<any> {
    const submission = await this.submissionClient.getSubmissionById(submissionId, token);
    return submission;
  }

  /**
   * Submit a new submission
   */
  async submitSubmission(
    data: CreateSubmissionRequest,
    token?: string
  ): Promise<any> {
    return this.submissionClient.createSubmission(data, token);
  }

  // ==================== DRAFTS ====================

  /**
   * Get all drafts
   */
  async getAllDrafts(
    filters?: ListDraftsFilters,
    token?: string
  ): Promise<PaginatedResponse<DraftData>> {
    return this.submissionClient.getAllDrafts(filters, token);
  }

  /**
   * Get draft by ID
   */
  async getDraftById(draftId: string, token?: string): Promise<any> {
    return this.submissionClient.getDraftById(draftId, token);
  }

  async saveDraft(
    data: CreateDraftRequest,
    token?: string
  ): Promise<any> {
    return this.submissionClient.saveDraft(data, token);
  }

  /**
   * Delete draft
   */
  async deleteDraft(draftId: string, token?: string): Promise<any> {
    return this.submissionClient.deleteDraft(draftId, token);
  }

  // ==================== VALIDATIONS ====================

  /**
   * Validate form data
   */
  async validateFormData(
    data: ValidateFormDataRequest,
    token?: string
  ): Promise<any> {
    return this.submissionClient.validateFormData(data, token);
  }

  /**
   * Get missing required fields
   */
  getMissingRequiredFields(schema: FormSchemaData, draftData: Record<string, any>): any[] {
    return SubmissionAggregator.getMissingRequiredFields(schema, draftData);
  }

  /**
   * Calculate completion percentage
   */
  calculateCompletion(schema: FormSchemaData, draftData: Record<string, any>): number {
    return SubmissionAggregator.calculateCompletion(schema, draftData);
  }

  // ==================== FILES ====================
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string, token?: string,  ownerId?: string) {
    if(!token) {
      throw new Error('Authorization token is required to upload file');
    }
    const file : UploadFileRequest = {
      filename: fileName,
      mimeType: mimeType || 'application/octet-stream',
      size: fileBuffer.length,
      buffer: fileBuffer,
      ownerType: 'FORM',
      ownerId: ownerId || '',
      visibility: 'PRIVATE',
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      uploadedBy: 'system', // Placeholder, replace as needed
    }
    const response = await this.fileServiceClient.uploadFile(file, token );
    return response.data;
  }
}
