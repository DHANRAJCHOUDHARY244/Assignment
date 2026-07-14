import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ObjectSchema } from "joi";

import { HTTP_STATUS } from "../constants/httpStatus";
import { ApiError } from "../utils/ApiError";

function validationError(message: string): ApiError {
  return new ApiError(message, HTTP_STATUS.BAD_REQUEST);
}

export function validateBody(schema: ObjectSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(validationError(error.details.map((d) => d.message).join(", ")));
      return;
    }

    req.body = value;
    next();
  };
}

export function validateQuery(schema: ObjectSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      next(validationError(error.details.map((d) => d.message).join(", ")));
      return;
    }

    req.validatedQuery = value as Record<string, unknown>;
    next();
  };
}

export function validateParams(schema: ObjectSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(validationError(error.details.map((d) => d.message).join(", ")));
      return;
    }

    req.validatedParams = value as Record<string, unknown>;
    next();
  };
}
