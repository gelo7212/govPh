import { SchemaModel } from '../schemas/schemas.mongo.schema';
import { SchemaNotFoundError, ValidationError, DatabaseError } from '../../errors';
import { createLogger } from '../../utils/logger';
import Joi from 'joi';

const logger = createLogger('ValidationsService');

export class ValidationsService {
  /**
   * Validate form data against schema
   */
  async validateFormData(
    schemaId: string,
    data: Record<string, any>
  ): Promise<any> {
    try {
      const schema = await SchemaModel.findById(schemaId);

      if (!schema) {
        throw new SchemaNotFoundError(schemaId);
      }

      // Build validation schema from form fields
      const validationObject: Record<string, any> = {};

      schema.fields.forEach((field: any) => {
        let fieldValidator: any;

        switch (field.type) {
          case 'text':
            fieldValidator = Joi.string();
            break;
          case 'email':
            fieldValidator = Joi.string().email();
            break;
          case 'tel':
            fieldValidator = Joi.string().pattern(/^\+?[0-9\s\-()]{7,}$/);
            break;
          case 'number':
            fieldValidator = Joi.number();
            break;
          case 'date':
            fieldValidator = Joi.date();
            break;
          case 'time':
            fieldValidator = Joi.string();
            break;
          case 'datetime':
            fieldValidator = Joi.date();
            break;
          case 'select':
          case 'radio':
            fieldValidator = Joi.string().valid(
              ...field.options.map((opt: any) => opt.value)
            );
            break;
          case 'checkbox':
            fieldValidator = Joi.array().items(Joi.string());
            break;
          case 'file':
          case 'image':
            fieldValidator = Joi.any();
            break;
          case 'section':
          case 'divider':
          case 'info':
            fieldValidator = Joi.any().optional();
            break;
          default:
            fieldValidator = Joi.any();
        }

        if (field.required) {
          fieldValidator = fieldValidator.required();
        } else {
          fieldValidator = fieldValidator.optional();
        }

        validationObject[field.id] = fieldValidator;
      });

      const joiSchema = Joi.object(validationObject);
      const { error, value } = joiSchema.validate(data, {
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string> = {};
        error.details.forEach((err: any) => {
          const fieldId = err.context.key;
          const field = schema.fields.find((f: any) => f.id === fieldId);
          const fieldLabel = field ? field.label : fieldId;
          details[fieldId] = `${fieldLabel}: ${err.message}`;
        });

        return {
          isValid: false,
          errors: details,
        };
      }

      return {
        isValid: true,
        data: value,
        errors: {},
      };
    } catch (error) {
      if (error instanceof SchemaNotFoundError) {
        throw error;
      }
      logger.error('Failed to validate form data', error);
      throw new DatabaseError('Failed to validate form data');
    }
  }

  /**
   * Validate field value against field definition
   */
  validateFieldValue(field: any, value: any): { valid: boolean; error?: string } {
    try {
      let fieldValidator: any;

      switch (field.type) {
        case 'text':
          fieldValidator = Joi.string();
          break;
        case 'email':
          fieldValidator = Joi.string().email();
          break;
        case 'tel':
          fieldValidator = Joi.string().pattern(/^\+?[0-9\s\-()]{7,}$/);
          break;
        case 'number':
          fieldValidator = Joi.number();
          break;
        case 'date':
          fieldValidator = Joi.date();
          break;
        default:
          return { valid: true };
      }

      if (field.required && !value) {
        return { valid: false, error: `${field.label} is required` };
      }

      if (value) {
        const { error } = fieldValidator.validate(value);
        if (error) {
          return { valid: false, error: error.message };
        }
      }

      return { valid: true };
    } catch (error) {
      logger.error('Failed to validate field value', error);
      return { valid: false, error: 'Validation error' };
    }
  }
}
