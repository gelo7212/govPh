import Joi from "joi";

export const sendOtpSchema = Joi.object({
    phoneNumber: Joi.string().pattern(/^\+63\d{10}$/).required(), // +63XXXXXXXXX format
    context: Joi.string().valid('login', 'reset', 'registration', 'transaction', 'authentication').required(),
    // if context is registration firebaseId, else userId is required
    userId: Joi.string().when('context', {
        is: Joi.valid('login', 'reset', 'transaction', 'authentication'),
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    firebaseId: Joi.string().when('context', {
        is: Joi.valid('registration'),
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
});

export const verifyOtpSchema = Joi.object({
    phoneNumber: Joi.string().pattern(/^\+63\d{10}$/).required(), // +63XXXXXXXXX format
    code: Joi.string().length(6).pattern(/^\d+$/).required(),
    context: Joi.string().valid('login', 'reset', 'registration', 'transaction', 'authentication').required(),
    userId: Joi.string().when('context', {
        is: Joi.valid('login', 'reset', 'transaction', 'authentication'),
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    firebaseId: Joi.string().when('context', {
        is: Joi.valid('registration'),
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
});