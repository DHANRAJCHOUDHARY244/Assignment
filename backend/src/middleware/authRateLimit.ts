import { RATE_LIMIT } from "../constants/rateLimit";
import { createRateLimiter } from "./createRateLimiter";

export const authRateLimit = createRateLimiter({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX,
  msg: "Too many login or signup attempts. Please try again in 30 minutes.",
});
