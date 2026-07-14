import { API_PATHS } from "@/constants/api";
import { apiClient } from "@/lib/apiClient";
import {
  clearSession,
  setAccessToken,
  setStoredUser,
} from "@/lib/session";
import type {
  ApiSuccess,
  AuthData,
  LoginPayload,
  SignupPayload,
} from "@/types";

export async function signup(payload: SignupPayload): Promise<AuthData> {
  const res = await apiClient.post<ApiSuccess<AuthData>>(
    API_PATHS.AUTH_SIGNUP,
    payload,
  );
  setAccessToken(res.data.accessToken);
  setStoredUser(res.data.user);
  return res.data;
}

export async function login(payload: LoginPayload): Promise<AuthData> {
  const res = await apiClient.post<ApiSuccess<AuthData>>(
    API_PATHS.AUTH_LOGIN,
    payload,
  );
  setAccessToken(res.data.accessToken);
  setStoredUser(res.data.user);
  return res.data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post(API_PATHS.AUTH_LOGOUT);
  } finally {
    clearSession();
  }
}
