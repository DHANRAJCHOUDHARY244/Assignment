import type { Response } from "express";

import { API_STATUS, HTTP_STATUS, type HttpStatusCode } from "../constants/httpStatus";
import { ApiError } from "./ApiError";

export function throwError(
  message: string,
  code: HttpStatusCode = HTTP_STATUS.INTERNAL_ERROR,
): never {
  throw new ApiError(message, code);
}

export function sendSuccess(
  res: Response,
  msg = "Success",
  data?: unknown,
  code: HttpStatusCode = HTTP_STATUS.OK,
): void {
  res.status(code).json({
    status: API_STATUS.SUCCESS,
    code,
    msg,
    data,
  });
}

export function sendError(
  res: Response,
  msg: string,
  code: HttpStatusCode = HTTP_STATUS.INTERNAL_ERROR,
): void {
  res.status(code).json({
    status: API_STATUS.ERROR,
    code,
    msg,
  });
}
