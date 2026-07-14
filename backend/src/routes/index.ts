import { Router, type Application } from "express";

import { API_PREFIX, ROUTE_SLUGS } from "../constants/routes";
import healthRoutes from "./health";
import authRoutes from "./auth";
import videoRoutes from "./videos";
import adminVideoRoutes from "./adminVideos";
import adminUploadRoutes from "./adminUploads";
import adminUserRoutes from "./adminUsers";

const apiRouter: Router = Router();

apiRouter.use(`/${ROUTE_SLUGS.HEALTH}`, healthRoutes);
apiRouter.use(`/${ROUTE_SLUGS.AUTH}`, authRoutes);
apiRouter.use(`/${ROUTE_SLUGS.VIDEOS}`, videoRoutes);
apiRouter.use(`/${ROUTE_SLUGS.ADMIN_VIDEOS}`, adminVideoRoutes);
apiRouter.use(`/${ROUTE_SLUGS.ADMIN_UPLOADS}`, adminUploadRoutes);
apiRouter.use(`/${ROUTE_SLUGS.ADMIN_USERS}`, adminUserRoutes);

export function registerRoutes(app: Application): void {
  app.use(API_PREFIX, apiRouter);
}

export { apiRouter, API_PREFIX, ROUTE_SLUGS };
export default registerRoutes;
