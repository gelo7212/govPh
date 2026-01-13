import Joi from 'joi';

/**
 * Validation schemas for SOS module
 */

export const initSOSSchema = Joi.object({
  sosId: Joi.string().required(),
  citizenId: Joi.string().required(),
  location: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    accuracy: Joi.number().optional(),
  }).optional(),
  address: Joi.object({
    city: Joi.string().max(100).optional(),
    barangay: Joi.string().max(100).optional(),
  }).optional(),
  type: Joi.string().optional(),
});

export const closeSOSSchema = Joi.object({
  closedBy: Joi.string().required(),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('active', 'assigned', 'responding', 'closed', 'cancelled', 'en_route', 'arrived', 'resolved', 'completed')
    .required(),
  updatedBy: Joi.string().required(),
  oldStatus: Joi.string()
    .valid('active', 'assigned', 'responding', 'closed', 'cancelled', 'en_route', 'arrived', 'resolved', 'completed')
    .required(),
});

export const updateLocationSchema = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  accuracy: Joi.number().optional(),
});

export const upsertRescuerLocationSchema = Joi.object({
  rescuerId: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  accuracy: Joi.number().optional(),
});

export default {
  initSOSSchema,
  closeSOSSchema,
  updateStatusSchema,
  updateLocationSchema,
  upsertRescuerLocationSchema,
};
