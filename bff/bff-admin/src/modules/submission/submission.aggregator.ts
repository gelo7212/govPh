import { SubmissionServiceClient, SubmissionAggregator } from '@gov-ph/bff-core';
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

  constructor(submissionClient: SubmissionServiceClient) {
    this.submissionClient = submissionClient;
  }

  // ==================== SCHEMAS ====================

  /**
   * Get all form schemas for admin
   */
  async getAllSchemas(
    filters?: ListSchemasFilters,
    token?: string
  ): Promise<PaginatedResponse<FormSchemaData>> {
    return this.submissionClient.getAllSchemas(filters, token);
  }

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
   * Create new form schema
   */
  async createSchema(
    data: CreateFormSchemaRequest,
    token?: string
  ): Promise<any> {
    return this.submissionClient.createSchema(data, token);
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

  /**
   * Delete form schema
   */
  async deleteSchema(schemaId: string, token?: string): Promise<any> {
    return this.submissionClient.deleteSchema(schemaId, token);
  }

  /**
   * Publish form schema
   */
  async publishSchema(schemaId: string, token?: string): Promise<any> {
    return this.submissionClient.publishSchema(schemaId, token);
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
   * Get submission stats for dashboard
   */
  async getSubmissionStats(
    filters?: ListSubmissionsFilters,
    token?: string
  ): Promise<any> {
    const result = await this.submissionClient.getAllSubmissions(filters, token);
    
    if (!result.data || result.data.items.length === 0) {
      return {
        totalSubmissions: 0,
        submittedCount: 0,
        reviewedCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        approvalRate: 0,
        pendingReview: 0,
      };
    }

    const stats = SubmissionAggregator.getSubmissionStats(result.data.items);
    return {
      ...stats,
      totalSubmissions: result.data.meta?.total || result.data.items.length,
      pendingReview: result.data.items.filter((s: any) => s.status === 'SUBMITTED').length,
    };
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(
    submissionId: string,
    status: 'REVIEWED' | 'APPROVED' | 'REJECTED',
    notes?: string,
    token?: string
  ): Promise<any> {
    return this.submissionClient.updateSubmission(
      submissionId,
      { status, notes },
      token
    );
  }

  /**
   * Delete submission
   */
  async deleteSubmission(submissionId: string, token?: string): Promise<any> {
    return this.submissionClient.deleteSubmission(submissionId, token);
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
}
