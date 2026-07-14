import Joi from "joi";

import { objectIdParamSchema } from "./common";

export const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
});

export const userIdParamSchema = objectIdParamSchema;

export const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid("active", "blocked").required(),
});
