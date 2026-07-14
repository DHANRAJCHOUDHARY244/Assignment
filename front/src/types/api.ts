import type { ReactNode } from "react";

import { HTTP_METHOD } from "@/constants/api";
import type { AuthData, Role, User } from "@/types/auth";

export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];

export type ApiSuccess<T> = {
  status: string;
  code: number;
  msg: string;
  data: T;
};

export type ApiErrorBody = {
  msg?: string;
  message?: string;
};

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  skipAuthRefresh?: boolean;
};

export type RefreshResponse = {
  data?: {
    accessToken?: string;
  };
};

export type AuthResponse = ApiSuccess<AuthData>;

export type AuthGuardProps = {
  children: ReactNode;
  role?: Role;
};

export type { User, AuthData, Role };
