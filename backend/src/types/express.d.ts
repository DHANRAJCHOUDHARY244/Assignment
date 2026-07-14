import type { UserRole } from "../constants/roles";

export type AuthUserPayload = {
  id: string;
  email: string;
  role: UserRole;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      validatedQuery?: Record<string, unknown>;
      validatedParams?: Record<string, unknown>;
    }
  }
}

export {};
