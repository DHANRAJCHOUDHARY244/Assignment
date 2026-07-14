import type { HttpStatusCode } from "../constants/httpStatus";
import { HTTP_STATUS } from "../constants/httpStatus";

export class ApiError extends Error {
  readonly code: HttpStatusCode;
  readonly isOperational: boolean;

  constructor(
    message: string,
    code: HttpStatusCode = HTTP_STATUS.INTERNAL_ERROR,
    isOperational = true,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.isOperational = isOperational;
  }

  static badRequest(message: string): ApiError {
    return new ApiError(message, HTTP_STATUS.BAD_REQUEST);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(message = "Not found"): ApiError {
    return new ApiError(message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, HTTP_STATUS.CONFLICT);
  }

  static internal(message = "Internal Server Error"): ApiError {
    return new ApiError(message, HTTP_STATUS.INTERNAL_ERROR, false);
  }
}
