import { SubmissionModel, ISubmission } from './submissions.mongo.schema';
import {
  SubmissionNotFoundError,
  DatabaseError,
  ValidationError,
} from '../../errors';
import { createLogger } from '../../utils/logger';

const logger = createLogger('SubmissionsService');

export class SubmissionsService {
  /**
   * Get all submissions with optional filtering
   */
  async getAllSubmissions(
    schemaId?: string,
    status?: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<any> {
    try {
      const filter: any = {};
      if (schemaId) filter.schemaId = schemaId;
      if (status) filter.status = status;

      const submissions = await SubmissionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await SubmissionModel.countDocuments(filter);

      return {
        items: submissions,
        meta: {
          page: Math.floor(skip / limit) + 1,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get all submissions', error);
      throw new DatabaseError('Failed to fetch submissions');
    }
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(id: string): Promise<ISubmission> {
    try {
      const submission = await SubmissionModel.findById(id);

      if (!submission) {
        throw new SubmissionNotFoundError(id);
      }

      return submission;
    } catch (error) {
      if (error instanceof SubmissionNotFoundError) {
        throw error;
      }
      logger.error('Failed to get submission by ID', error);
      throw new DatabaseError('Failed to fetch submission');
    }
  }

  /**
   * Create new submission
   */
  async createSubmission(data: Partial<ISubmission>): Promise<ISubmission> {
    try {
      if (!data.schemaId || !data.formKey || !data.data) {
        throw new ValidationError('Missing required fields', {
          schemaId: !data.schemaId ? 'Required' : '',
          formKey: !data.formKey ? 'Required' : '',
          data: !data.data ? 'Required' : '',
        });
      }

      const submission = new SubmissionModel({
        ...data,
        status: 'SUBMITTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await submission.save();
      logger.info(`Submission created: ${submission._id}`);

      return submission;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('Failed to create submission', error);
      throw new DatabaseError('Failed to create submission');
    }
  }

  /**
   * Update submission
   */
  async updateSubmission(
    id: string,
    updates: Partial<ISubmission>
  ): Promise<ISubmission> {
    try {
      const submission = await SubmissionModel.findById(id);

      if (!submission) {
        throw new SubmissionNotFoundError(id);
      }

      Object.assign(submission, updates, { updatedAt: new Date() });
      await submission.save();
      logger.info(`Submission updated: ${id}`);

      return submission;
    } catch (error) {
      if (error instanceof SubmissionNotFoundError) {
        throw error;
      }
      logger.error('Failed to update submission', error);
      throw new DatabaseError('Failed to update submission');
    }
  }

  /**
   * Delete submission
   */
  async deleteSubmission(id: string): Promise<void> {
    try {
      const submission = await SubmissionModel.findById(id);

      if (!submission) {
        throw new SubmissionNotFoundError(id);
      }

      await SubmissionModel.findByIdAndDelete(id);
      logger.info(`Submission deleted: ${id}`);
    } catch (error) {
      if (error instanceof SubmissionNotFoundError) {
        throw error;
      }
      logger.error('Failed to delete submission', error);
      throw new DatabaseError('Failed to delete submission');
    }
  }

  /**
   * Get submissions by schema
   */
  async getSubmissionsBySchema(schemaId: string): Promise<ISubmission[]> {
    try {
      return await SubmissionModel.find({ schemaId }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Failed to get submissions by schema', error);
      throw new DatabaseError('Failed to fetch submissions');
    }
  }
}
