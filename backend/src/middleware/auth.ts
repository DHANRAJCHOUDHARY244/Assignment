import type { NextFunction, Request, RequestHandler, Response } from "express";

import { HTTP_STATUS } from "../constants/httpStatus";
import { authService } from "../services/AuthService";
import { ApiError } from "../utils/ApiError";

export const authenticate: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      next(ApiError.unauthorized("Authentication required"));
      return;
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      next(ApiError.unauthorized("Authentication required"));
      return;
    }

    req.user = authService.verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    next(ApiError.unauthorized("Authentication required"));
    return;
  }

  if (req.user.role !== "admin") {
    next(new ApiError("Admin access required", HTTP_STATUS.FORBIDDEN));
    return;
  }

  next();
};
