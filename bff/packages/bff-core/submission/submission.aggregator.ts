/**
 * Submission Data Aggregator
 * Processes and aggregates submission data for API responses
 */

import {
  FormSchemaData,
  SubmissionData,
  DraftData,
} from './submission.types';

export class SubmissionAggregator {
  /**
   * Enrich submission data with related schema information
   * Useful for displaying schema details alongside submission
   */
  static enrichSubmissionWithSchema(
    submission: SubmissionData,
    schema: FormSchemaData
  ): SubmissionData & { schema?: FormSchemaData } {
    return {
      ...submission,
      schema,
    };
  }

  /**
   * Format submission data for frontend display
   * Transforms field IDs to display names based on schema
   */
  static formatSubmissionForDisplay(
    submission: SubmissionData,
    schema: FormSchemaData
  ): Record<string, any> {
    const formattedData: Record<string, any> = {
      _id: submission._id,
      schemaId: submission.schemaId,
      formKey: submission.formKey,
      formTitle: schema.title,
      status: submission.status,
      createdAt: submission.createdAt,
      submittedBy: submission.createdBy,
      submissionData: {},
    };

    // Map field values using schema field labels
    const fieldMap = new Map(schema.fields.map((f) => [f.id, f]));

    for (const [fieldId, value] of Object.entries(submission.data)) {
      const field = fieldMap.get(fieldId);
      if (field) {
        formattedData.submissionData[field.label] = {
          value,
          type: field.type,
          fieldId,
        };
      }
    }

    if (submission.status !== 'SUBMITTED') {
      formattedData.reviewedBy = submission.reviewedBy;
      formattedData.reviewedAt = submission.reviewedAt;
      formattedData.notes = submission.notes;
    }

    return formattedData;
  }

  /**
   * Get submission statistics for a schema
   * Returns counts by status and other metrics
   */
  static getSubmissionStats(submissions: SubmissionData[]): Record<string, any> {
    const stats = {
      total: submissions.length,
      byStatus: {
        SUBMITTED: 0,
        REVIEWED: 0,
        APPROVED: 0,
        REJECTED: 0,
      },
      approvalRate: 0,
      rejectionRate: 0,
    };

    for (const submission of submissions) {
      stats.byStatus[submission.status]++;
    }

    const approved = stats.byStatus.APPROVED;
    const rejected = stats.byStatus.REJECTED;
    const reviewed = approved + rejected;

    if (reviewed > 0) {
      stats.approvalRate = (approved / reviewed) * 100;
      stats.rejectionRate = (rejected / reviewed) * 100;
    }

    return stats;
  }

  /**
   * Convert draft to submission format
   * Useful for submitting draft data as a new submission
   */
  static draftToSubmission(draft: DraftData): Partial<SubmissionData> {
    return {
      schemaId: draft.schemaId,
      formKey: draft.formKey,
      data: draft.data,
      status: 'SUBMITTED' as const,
      createdAt: new Date().toISOString(),
      createdBy: draft.createdBy,
    };
  }

  /**
   * Check if draft is stale (close to expiration)
   * Returns true if draft expires in less than 24 hours
   */
  static isDraftStale(draft: DraftData, hoursUntilExpiry: number = 24): boolean {
    const expiryDate = new Date(draft.expiresAt);
    const now = new Date();
    const hoursUntilExpiration = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiration < hoursUntilExpiry;
  }

  /**
   * Calculate form completion percentage from draft data
   * Based on required vs provided fields
   */
  static calculateCompletion(
    schema: FormSchemaData,
    draftData: Record<string, any>
  ): number {
    const requiredFields = schema.fields.filter((f) => f.required);
    if (requiredFields.length === 0) return 100;

    const filledFields = requiredFields.filter((f) => {
      const value = draftData[f.id];
      return value !== null && value !== undefined && value !== '';
    });

    return Math.round((filledFields.length / requiredFields.length) * 100);
  }

  /**
   * Get missing required fields from draft
   * Returns list of field labels that are still needed
   */
  static getMissingRequiredFields(
    schema: FormSchemaData,
    draftData: Record<string, any>
  ): Array<{ id: string; label: string }> {
    return schema.fields
      .filter((f) => f.required)
      .filter((f) => {
        const value = draftData[f.id];
        return value === null || value === undefined || value === '';
      })
      .map((f) => ({ id: f.id, label: f.label }));
  }

  /**
   * Validate submission data against schema field types
   * Basic validation without full Joi validation
   */
  static validateFieldTypes(
    schema: FormSchemaData,
    submissionData: Record<string, any>
  ): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const field of schema.fields) {
      const value = submissionData[field.id];

      if (field.required && (value === null || value === undefined || value === '')) {
        errors[field.id] = `${field.label} is required`;
        continue;
      }

      if (value !== null && value !== undefined && value !== '') {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(String(value))) {
              errors[field.id] = `${field.label} must be a valid email`;
            }
            break;

          case 'tel':
            const telRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            if (!telRegex.test(String(value))) {
              errors[field.id] = `${field.label} must be a valid phone number`;
            }
            break;

          case 'number':
            if (isNaN(Number(value))) {
              errors[field.id] = `${field.label} must be a number`;
            }
            break;

          case 'date':
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(String(value))) {
              errors[field.id] = `${field.label} must be a valid date (YYYY-MM-DD)`;
            }
            break;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
