import Joi from "joi";

const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } });

export const signupSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(80).required(),
  email: emailSchema.required(),
  password: Joi.string().min(8).max(72).required(),
});

export const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().default(false),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});
