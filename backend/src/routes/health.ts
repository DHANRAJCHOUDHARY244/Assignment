import { Router } from "express";

import { healthController } from "../controllers/HealthController";

const router: Router = Router();

router.get("/", healthController.basicHealth);

export default router;
