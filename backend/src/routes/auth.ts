import { Router } from "express";

import { authController } from "../controllers/AuthController";
import { authRateLimit } from "../middleware/authRateLimit";
import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  loginSchema,
  refreshSchema,
  signupSchema,
} from "../validators/auth";

const router: Router = Router();

router.post(
  "/signup",
  authRateLimit,
  validateBody(signupSchema),
  authController.signup,
);
router.post(
  "/login",
  authRateLimit,
  validateBody(loginSchema),
  authController.login,
);
router.post("/refresh", validateBody(refreshSchema), authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
