import Joi from 'joi';

export const messageBroadcastSchema = Joi.object({
  sosId: Joi.string().required(),
  message: Joi.object({
    id: Joi.string().required(),
    sosId: Joi.string().required(),
    senderType: Joi.string().valid('CITIZEN', 'SOS_ADMIN', 'RESCUER', 'SYSTEM').required(),
    senderId: Joi.string().allow(null).optional(),
    senderDisplayName: Joi.string().required(),
    contentType: Joi.string().valid('text', 'system').required(),
    content: Joi.string().required(),
    createdAt: Joi.date().required(),
  }).required(),
});
