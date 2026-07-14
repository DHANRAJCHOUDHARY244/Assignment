import { USER_ROLES, ROLE } from "@/constants/roles";

export type Role = (typeof USER_ROLES)[number];
export type RoleValue = (typeof ROLE)[keyof typeof ROLE];

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type AuthData = {
  user: User;
  accessToken: string;
};
