import Joi from 'joi';

/**
 * Validation schemas for BFF Citizen SOS requests
 * These schemas validate the input before forwarding to SOS Service
 */

export const createSOSSchema = Joi.object({
  type: Joi.string()
    .valid('MEDICAL', 'FIRE', 'CRIME', 'ACCIDENT', 'DISASTER', 'OTHER')
    .required()
    .messages({
      'any.required': 'SOS type is required',
      'any.only': 'SOS type must be one of: MEDICAL, FIRE, CRIME, ACCIDENT, DISASTER, , OTHER',
    }),
  message: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'any.required': 'Message is required',
      'string.min': 'Message must be at least 1 character',
      'string.max': 'Message must not exceed 500 characters',
    }),
  silent: Joi.boolean().default(false).optional(),
  location: Joi.object({
    latitude: Joi.number()
      .min(-90)
        .max(90)
        .required()
        .messages({
            'any.required': 'Latitude is required',
            'number.min': 'Latitude must be between -90 and 90',
            'number.max': 'Latitude must be between -90 and 90',
        }),
    longitude: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            'any.required': 'Longitude is required',
            'number.min': 'Longitude must be between -180 and 180',
            'number.max': 'Longitude must be between -180 and 180',
        }),
    accuracy: Joi.number().min(0).optional(),
    }).optional(),
  address: Joi.object({
    city: Joi.string().max(100).optional(),
    barangay: Joi.string().max(100).optional(),
  }).optional()
});

export const updateLocationSchema = Joi.object({
  lat: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'any.required': 'Latitude is required',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
    }),
  lng: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'any.required': 'Longitude is required',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
    }),
  accuracy: Joi.number().min(0).optional(),
});

export const sendMessageSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'any.required': 'Message content is required',
      'string.min': 'Message must be at least 1 character',
      'string.max': 'Message must not exceed 1000 characters',
    }),
});

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details,
      });
    }
    next();
  };
};
