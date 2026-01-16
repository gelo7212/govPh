import { SchemaModel, IFormSchema } from './schemas.mongo.schema';
import {
  SchemaNotFoundError,
  SchemaAlreadyPublishedError,
  DatabaseError,
} from '../../errors';
import { createLogger } from '../../utils/logger';

const logger = createLogger('SchemasService');

interface MappedSchema extends IFormSchema {
  id: string;
}

export class SchemasService {
  /**
   * Get all schemas with optional filtering
   */
  async getAllSchemas(
    createdBy?: string,
    status?: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<any> {
    try {
        const filter: any = {};
        if (status) {
            filter.status = status;
        }
        if (createdBy) {
            filter.createdBy = createdBy;
        }

        const schemas = await SchemaModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SchemaModel.countDocuments(filter);
        const mappedSchemas = [];
        for(const schema of schemas){
            const dto = await this.mapToSchemaDTO(schema);
            mappedSchemas.push(dto);
        }
        return {
            items: mappedSchemas,
            meta: {
            page: Math.floor(skip / limit) + 1,
            pageSize: limit,
            total,
            totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
      logger.error('Failed to get all schemas', error);
      throw new DatabaseError('Failed to fetch schemas');
    }
  }

  /**
   * Get schema by ID
   */
  async getSchemaById(id: string): Promise<IFormSchema> {
    try {
      const schema = await SchemaModel.findById(id);

      if (!schema) {
        throw new SchemaNotFoundError(id);
      }
      

      return await this.mapToSchemaDTO(schema);
    } catch (error) {
      if (error instanceof SchemaNotFoundError) {
        throw error;
      }
      logger.error('Failed to get schema by ID', error);
      throw new DatabaseError('Failed to fetch schema');
    }
  }

  /**
   * Create new schema
   */
  async createSchema(data: Partial<IFormSchema>): Promise<IFormSchema> {
    try {
      const schema = new SchemaModel({
        ...data,
        status: 'DRAFT',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await schema.save();
      logger.info(`Schema created: ${schema._id}`);

      return await this.mapToSchemaDTO(schema);
    } catch (error) {
      logger.error('Failed to create schema', error);
      throw new DatabaseError('Failed to create schema');
    }
  }

  /**
   * Update schema
   */
  async updateSchema(
    id: string,
    updates: Partial<IFormSchema>
  ): Promise<IFormSchema> {
    try {
      const schema = await SchemaModel.findById(id);

      if (!schema) {
        throw new SchemaNotFoundError(id);
      }

      // Don't allow updates if published
      if (schema.status === 'PUBLISHED') {
        throw new SchemaAlreadyPublishedError(id);
      }

      Object.assign(schema, updates, { updatedAt: new Date() });
      await schema.save();
      logger.info(`Schema updated: ${id}`);

      return await this.mapToSchemaDTO(schema);
    } catch (error) {
      if (
        error instanceof SchemaNotFoundError ||
        error instanceof SchemaAlreadyPublishedError
      ) {
        throw error;
      }
      logger.error('Failed to update schema', error);
      throw new DatabaseError('Failed to update schema');
    }
  }

  /**
   * Delete schema
   */
  async deleteSchema(id: string): Promise<void> {
    try {
      const schema = await SchemaModel.findById(id);

      if (!schema) {
        throw new SchemaNotFoundError(id);
      }

      await SchemaModel.findByIdAndDelete(id);
      logger.info(`Schema deleted: ${id}`);
    } catch (error) {
      if (error instanceof SchemaNotFoundError) {
        throw error;
      }
      logger.error('Failed to delete schema', error);
      throw new DatabaseError('Failed to delete schema');
    }
  }

  /**
   * Publish schema
   */
  async publishSchema(id: string): Promise<IFormSchema> {
    try {
      const schema = await SchemaModel.findById(id);

      if (!schema) {
        throw new SchemaNotFoundError(id);
      }

      if (schema.status === 'PUBLISHED') {
        throw new SchemaAlreadyPublishedError(id);
      }

      schema.status = 'PUBLISHED';
      schema.version = (schema.version || 1) + 1;
      schema.publishedAt = new Date();
      schema.updatedAt = new Date();

      await schema.save();
      logger.info(`Schema published: ${id}`);

      return await this.mapToSchemaDTO(schema);
    } catch (error) {
      if (
        error instanceof SchemaNotFoundError ||
        error instanceof SchemaAlreadyPublishedError
      ) {
        throw error;
      }
      logger.error('Failed to publish schema', error);
      throw new DatabaseError('Failed to publish schema');
    }
  }

  /**
   * Get schema by form key
   */
  async getSchemaByFormKey(formKey: string): Promise<IFormSchema | null> {
    try {
      const schema = await SchemaModel.findOne({ formKey });
      return schema;
    } catch (error) {
      logger.error('Failed to get schema by form key', error);
      throw new DatabaseError('Failed to fetch schema');
    }
  }

  private async mapToSchemaDTO(schema:IFormSchema): Promise<MappedSchema> {
    const mappedSchema: MappedSchema =  JSON.parse(JSON.stringify(schema));
    mappedSchema.id = schema._id?.toString() || '';
    return mappedSchema;
  }
}
