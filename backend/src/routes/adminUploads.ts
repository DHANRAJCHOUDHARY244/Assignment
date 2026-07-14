import { Router, raw } from "express";
import multer from "multer";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { uploadController } from "../controllers/UploadController";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validate";
import { UPLOAD } from "../constants/upload";
import { ApiError } from "../utils/ApiError";
import {
  initUploadSchema,
  uploadIdParamSchema,
} from "../validators/upload";

const tmpDir = path.join(os.tmpdir(), "ass-uploads");
mkdirSync(tmpDir, { recursive: true });

const directUpload = multer({
  dest: tmpDir,
  limits: { fileSize: UPLOAD.DIRECT_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if ((UPLOAD.VIDEO_MIMES as readonly string[]).includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only mp4, webm, or mov videos are allowed"));
  },
});

const router: Router = Router();

router.use(authenticate, requireAdmin);

router.post("/init", validateBody(initUploadSchema), uploadController.init);

router.patch(
  "/:uploadId",
  validateParams(uploadIdParamSchema),
  raw({ type: "application/octet-stream", limit: UPLOAD.CHUNK_SIZE + 1024 }),
  uploadController.chunk,
);

router.post(
  "/:uploadId/complete",
  validateParams(uploadIdParamSchema),
  uploadController.complete,
);

router.post(
  "/direct",
  (req, res, next) => {
    directUpload.single("video")(req, res, (err) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        next(
          ApiError.badRequest(
            "File exceeds direct upload limit; use chunked upload for larger files",
          ),
        );
        return;
      }
      next(ApiError.badRequest(err.message));
    });
  },
  uploadController.direct,
);

export default router;
