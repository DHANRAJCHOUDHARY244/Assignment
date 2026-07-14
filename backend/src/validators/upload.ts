import Joi from "joi";

import { UPLOAD } from "../constants/upload";

export const uploadIdParamSchema = Joi.object({
  uploadId: Joi.string().uuid().required(),
});

export const initUploadSchema = Joi.object({
  filename: Joi.string().trim().min(1).max(255).required(),
  totalSize: Joi.number()
    .integer()
    .min(1)
    .max(UPLOAD.MAX_BYTES)
    .required(),
  mimeType: Joi.string()
    .valid(...UPLOAD.VIDEO_MIMES)
    .required(),
});
