import Joi from 'joi';

/**
 * Validation schemas for SOS-related requests
 */

export const createSOSSchema = Joi.object({
  type: Joi.string()
    .valid('MEDICAL', 'FIRE', 'CRIME', 'ACCIDENT', 'DISASTER', 'OTHER')
    .required(),
  message: Joi.string().min(1).max(500).required(),
  silent: Joi.boolean().default(false),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    accuracy: Joi.number().min(0).optional(),
  }).optional(),
  address: Joi.object({
    city: Joi.string().max(100).optional(),
    barangay: Joi.string().max(100).optional(),
  }).optional(),
});

export const updateLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  accuracy: Joi.number().min(0).optional(),
});

export const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});

export const rescuerLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

export const closeSOSSchema = Joi.object({
  resolutionNote: Joi.string().max(1000).optional(),
});

export const dispatchAssignSchema = Joi.object({
  sosId: Joi.string().required(),
  rescuerId: Joi.string().required(),
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
      return res.status(400).json({ error: 'Validation failed', data: details });
    }

    req.body = value;
    next();
  };
};
