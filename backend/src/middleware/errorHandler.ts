import type { ErrorRequestHandler, RequestHandler } from "express";

import { API_STATUS, HTTP_STATUS } from "../constants/httpStatus";
import { logger } from "../helpers/logger";
import { ApiError } from "../utils/ApiError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const code =
    err instanceof ApiError
      ? err.code
      : typeof err.code === "number"
        ? err.code
        : typeof err.status === "number"
          ? err.status
          : typeof err.statusCode === "number"
            ? err.statusCode
            : HTTP_STATUS.INTERNAL_ERROR;

  const safeStatus =
    code >= 100 && code < 600 ? code : HTTP_STATUS.INTERNAL_ERROR;
  const isOperational =
    err instanceof ApiError
      ? err.isOperational
      : Boolean(err.isOperational);

  if (!isOperational || safeStatus >= HTTP_STATUS.INTERNAL_ERROR) {
    logger.error("Request failed", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      status: safeStatus,
    });
  }

  res.status(safeStatus).json({
    status: API_STATUS.ERROR,
    code: safeStatus,
    msg:
      isOperational || safeStatus < HTTP_STATUS.INTERNAL_ERROR
        ? (err.message as string)
        : "Internal Server Error",
  });
};

export const notFound: RequestHandler = (_req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: API_STATUS.ERROR,
    code: HTTP_STATUS.NOT_FOUND,
    msg: "Resource not found",
  });
};
