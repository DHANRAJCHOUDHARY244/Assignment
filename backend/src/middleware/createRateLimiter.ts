import rateLimit from "express-rate-limit";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  msg: string;
};

export function createRateLimiter({ windowMs, max, msg }: RateLimitOptions) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, msg },
  });
}
