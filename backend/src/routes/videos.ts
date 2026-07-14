import { Router } from "express";

import { videoController } from "../controllers/VideoController";
import { authenticate } from "../middleware/auth";
import { optionalAuthenticate } from "../middleware/optionalAuth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate";
import {
  commentSchema,
  likeVideoSchema,
  listVideosSchema,
  shareVideoSchema,
  videoIdParamSchema,
} from "../validators/video";

const router: Router = Router();

router.get("/", validateQuery(listVideosSchema), videoController.list);

router.get(
  "/:id",
  validateParams(videoIdParamSchema),
  videoController.getById,
);

router.post(
  "/:id/like",
  optionalAuthenticate,
  validateParams(videoIdParamSchema),
  validateBody(likeVideoSchema),
  videoController.like,
);

router.post(
  "/:id/share",
  optionalAuthenticate,
  validateParams(videoIdParamSchema),
  validateBody(shareVideoSchema),
  videoController.share,
);

router.get(
  "/:id/comments",
  validateParams(videoIdParamSchema),
  validateQuery(listVideosSchema),
  videoController.listComments,
);

router.post(
  "/:id/comments",
  validateParams(videoIdParamSchema),
  authenticate,
  validateBody(commentSchema),
  videoController.addComment,
);

export default router;
