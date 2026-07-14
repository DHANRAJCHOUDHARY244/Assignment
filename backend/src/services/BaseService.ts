import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/httpStatus";
import { ApiError } from "../utils/ApiError";

export type PaginationInput = {
  page?: number | undefined;
  limit?: number | undefined;
  maxLimit?: number | undefined;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  skip: number;
};

export abstract class BaseService {
  protected fail(
    message: string,
    code: (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS] = HTTP_STATUS.BAD_REQUEST,
  ): never {
    throw new ApiError(message, code);
  }

  protected assertObjectId(
    id: string,
    message = "Invalid id",
  ): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.fail(message, HTTP_STATUS.BAD_REQUEST);
    }
    return new mongoose.Types.ObjectId(id);
  }

  protected paginate(input: PaginationInput = {}): PaginationMeta {
    const maxLimit = input.maxLimit ?? 100;
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(maxLimit, Math.max(1, input.limit ?? 40));
    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  protected isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
