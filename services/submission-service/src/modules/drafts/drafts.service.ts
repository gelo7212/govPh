import { DraftModel, IDraft } from './drafts.mongo.schema';
import {
  DraftNotFoundError,
  DatabaseError,
  ValidationError,
} from '../../errors';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DraftsService');

export class DraftsService {
  /**
   * Get all drafts with optional filtering
   */
  async getAllDrafts(
    schemaId?: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<any> {
    try {
      const filter: any = {};
      if (schemaId) filter.schemaId = schemaId;

      const drafts = await DraftModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await DraftModel.countDocuments(filter);

      return {
        items: drafts,
        meta: {
          page: Math.floor(skip / limit) + 1,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get all drafts', error);
      throw new DatabaseError('Failed to fetch drafts');
    }
  }

  /**
   * Get draft by ID
   */
  async getDraftById(id: string): Promise<IDraft> {
    try {
      const draft = await DraftModel.findById(id);

      if (!draft) {
        throw new DraftNotFoundError(id);
      }

      return draft;
    } catch (error) {
      if (error instanceof DraftNotFoundError) {
        throw error;
      }
      logger.error('Failed to get draft by ID', error);
      throw new DatabaseError('Failed to fetch draft');
    }
  }

  /**
   * Save draft (create or update)
   */
  async saveDraft(data: Partial<IDraft>): Promise<IDraft> {
    try {
      if (!data.schemaId || !data.formKey || !data.data) {
        throw new ValidationError('Missing required fields', {
          schemaId: !data.schemaId ? 'Required' : '',
          formKey: !data.formKey ? 'Required' : '',
          data: !data.data ? 'Required' : '',
        });
      }

      // Check if draft exists for this schema and user
      const existingDraft = await DraftModel.findOne({
        schemaId: data.schemaId,
        createdBy: data.createdBy,
      });

      if (existingDraft) {
        // Update existing draft
        Object.assign(existingDraft, {
          data: data.data,
          updatedAt: new Date(),
        });
        await existingDraft.save();
        logger.info(`Draft updated: ${existingDraft._id}`);
        return existingDraft;
      }

      // Create new draft
      const draft = new DraftModel({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      await draft.save();
      logger.info(`Draft created: ${draft._id}`);

      return draft;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('Failed to save draft', error);
      throw new DatabaseError('Failed to save draft');
    }
  }

  /**
   * Update draft
   */
  async updateDraft(id: string, updates: Partial<IDraft>): Promise<IDraft> {
    try {
      const draft = await DraftModel.findById(id);

      if (!draft) {
        throw new DraftNotFoundError(id);
      }

      Object.assign(draft, updates, { updatedAt: new Date() });
      await draft.save();
      logger.info(`Draft updated: ${id}`);

      return draft;
    } catch (error) {
      if (error instanceof DraftNotFoundError) {
        throw error;
      }
      logger.error('Failed to update draft', error);
      throw new DatabaseError('Failed to update draft');
    }
  }

  /**
   * Delete draft
   */
  async deleteDraft(id: string): Promise<void> {
    try {
      const draft = await DraftModel.findById(id);

      if (!draft) {
        throw new DraftNotFoundError(id);
      }

      await DraftModel.findByIdAndDelete(id);
      logger.info(`Draft deleted: ${id}`);
    } catch (error) {
      if (error instanceof DraftNotFoundError) {
        throw error;
      }
      logger.error('Failed to delete draft', error);
      throw new DatabaseError('Failed to delete draft');
    }
  }

  /**
   * Get draft by schema and user
   */
  async getDraftBySchemaAndUser(
    schemaId: string,
    userId: string
  ): Promise<IDraft | null> {
    try {
      return await DraftModel.findOne({
        schemaId,
        createdBy: userId,
      });
    } catch (error) {
      logger.error('Failed to get draft by schema and user', error);
      throw new DatabaseError('Failed to fetch draft');
    }
  }
}
