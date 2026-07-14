import { Router } from "express";

import { adminUserController } from "../controllers/AdminUserController";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  listUsersSchema,
  updateUserStatusSchema,
  userIdParamSchema,
} from "../validators/user";

const router: Router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(listUsersSchema), adminUserController.list);

router.patch(
  "/:id/status",
  validateParams(userIdParamSchema),
  validateBody(updateUserStatusSchema),
  adminUserController.updateStatus,
);

router.get(
  "/:id",
  validateParams(userIdParamSchema),
  adminUserController.getById,
);

export default router;
