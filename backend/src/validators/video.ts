import Joi from "joi";

import { SHARE_PLATFORMS } from "../constants/roles";
import { objectIdParamSchema } from "./common";

export const listVideosSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(40),
});

export const videoIdParamSchema = objectIdParamSchema;

export const likeVideoSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
});

export const shareVideoSchema = Joi.object({
  platform: Joi.string()
    .valid(...SHARE_PLATFORMS)
    .required(),
});

export const commentSchema = Joi.object({
  body: Joi.string().trim().min(1).max(1000).required(),
});

const mediaUrl = Joi.string().trim().pattern(/^https?:\/\/.+/i).messages({
  "string.pattern.base": "must be a valid http(s) URL",
});

export const createVideoSchema = Joi.object({
  title: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().trim().min(2).max(1000).required(),
  url: mediaUrl.required(),
  thumbnailUrl: mediaUrl.optional(),
  likesCount: Joi.number().integer().min(0).optional(),
  sharesCount: Joi.number().integer().min(0).optional(),
  commentsCount: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().optional(),
});

export const updateVideoSchema = Joi.object({
  title: Joi.string().trim().min(2).max(160).optional(),
  description: Joi.string().trim().min(2).max(1000).optional(),
  url: mediaUrl.optional(),
  thumbnailUrl: mediaUrl.optional(),
  likesCount: Joi.number().integer().min(0).optional(),
  sharesCount: Joi.number().integer().min(0).optional(),
  commentsCount: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().optional(),
}).min(1);
