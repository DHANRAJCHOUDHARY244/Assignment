import type { NextFunction, Request, RequestHandler, Response } from "express";

import { authService } from "../services/AuthService";

export const optionalAuthenticate: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const token = header.slice("Bearer ".length).trim();
      if (token) {
        req.user = authService.verifyAccessToken(token);
      }
    }
    next();
  } catch {
    next();
  }
};
