import { STORAGE_KEYS } from "@/constants/api";
import type { User } from "@/types";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEYS.AUTH_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
}

export function clearStoredUser(): void {
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
}

export function clearSession(): void {
  clearAccessToken();
  clearStoredUser();
}
