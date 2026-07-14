import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS, type HttpStatusCode } from "../constants/httpStatus";
import { sendSuccess } from "../utils/response";

type AsyncRoute = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export abstract class BaseController {
  protected ok(
    res: Response,
    msg: string,
    data?: unknown,
    code: HttpStatusCode = HTTP_STATUS.OK,
  ): void {
    sendSuccess(res, msg, data, code);
  }

  protected created(res: Response, msg: string, data?: unknown): void {
    sendSuccess(res, msg, data, HTTP_STATUS.CREATED);
  }

  protected paramId(req: Request, key = "id"): string {
    const source = req.validatedParams ?? req.params;
    return String(source[key]);
  }

  protected queryNumber(req: Request, key: string, fallback: number): number {
    const source = req.validatedQuery ?? req.query;
    const value = source[key];
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    return Number(value);
  }

  protected handle =
    (fn: AsyncRoute): AsyncRoute =>
    async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
}
