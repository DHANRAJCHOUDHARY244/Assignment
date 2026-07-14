import { Router } from "express";

import { adminVideoController } from "../controllers/AdminVideoController";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate";
import {
  createVideoSchema,
  listVideosSchema,
  updateVideoSchema,
  videoIdParamSchema,
} from "../validators/video";

const router: Router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(listVideosSchema), adminVideoController.list);

router.post("/", validateBody(createVideoSchema), adminVideoController.create);

router.patch(
  "/:id",
  validateParams(videoIdParamSchema),
  validateBody(updateVideoSchema),
  adminVideoController.update,
);

router.delete(
  "/:id",
  validateParams(videoIdParamSchema),
  adminVideoController.remove,
);

export default router;
