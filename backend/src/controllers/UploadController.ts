import type { Request } from "express";

import { uploadService } from "../services/UploadService";
import { ApiError } from "../utils/ApiError";
import { BaseController } from "./BaseController";

export class UploadController extends BaseController {
  init = this.handle(async (req, res) => {
    const data = await uploadService.initUpload(req.body);
    this.created(res, "Upload session created", data);
  });

  chunk = this.handle(async (req, res) => {
    const uploadId = String(req.params["uploadId"]);
    const offsetHeader = req.get("upload-offset");
    const offset = Number(offsetHeader);

    if (!Number.isInteger(offset) || offset < 0) {
      throw ApiError.badRequest("Upload-Offset header is required");
    }

    const buffer = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(req.body ?? []);

    if (buffer.length === 0) {
      throw ApiError.badRequest("Empty chunk body");
    }

    const data = await uploadService.appendChunk(uploadId, offset, buffer);
    this.ok(res, "Chunk stored", data);
  });

  complete = this.handle(async (req, res) => {
    const uploadId = String(req.params["uploadId"]);
    const data = await uploadService.completeUpload(uploadId);
    this.ok(res, "Upload complete", data);
  });

  direct = this.handle(async (req, res) => {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      throw ApiError.badRequest("Video file is required");
    }

    const data = await uploadService.saveDirectUpload({
      filename: file.originalname,
      mimeType: file.mimetype,
      tempPath: file.path,
    });
    this.created(res, "Video uploaded", data);
  });
}

export const uploadController = new UploadController();
