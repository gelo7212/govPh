import Joi from 'joi';

export const sosSchema = Joi.object({
  citizenId: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  notes: Joi.string().optional(),
}).unknown(true);

export const updateSOSSchema = Joi.object({
  status: Joi.string().valid('pending', 'assigned', 'resolved', 'cancelled').optional(),
  assignedRescuerId: Joi.string().optional(),
  notes: Joi.string().optional(),
}).unknown(true);

export const validateSOS = (data: any) => {
  return sosSchema.validate(data);
};

export const validateUpdateSOS = (data: any) => {
  return updateSOSSchema.validate(data);
};
