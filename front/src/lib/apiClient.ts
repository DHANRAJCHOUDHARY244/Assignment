import { API_BASE_URL, API_PATHS, HTTP_METHOD } from "@/constants/api";
import {
  clearSession,
  getAccessToken,
  setAccessToken,
} from "@/lib/session";
import type {
  ApiErrorBody,
  RefreshResponse,
  RequestOptions,
} from "@/types";

export class ApiClient {
  private refreshing: Promise<string | null> | null = null;

  constructor(private readonly baseUrl: string) {}

  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshing) {
      this.refreshing = fetch(`${this.baseUrl}${API_PATHS.AUTH_REFRESH}`, {
        method: HTTP_METHOD.POST,
        credentials: "include",
        headers: { Accept: "application/json" },
      })
        .then(async (response) => {
          if (!response.ok) {
            clearSession();
            return null;
          }

          const json = (await response.json()) as RefreshResponse;
          const token = json.data?.accessToken ?? null;
          if (token) setAccessToken(token);
          return token;
        })
        .finally(() => {
          this.refreshing = null;
        });
    }

    return this.refreshing;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = HTTP_METHOD.GET,
      body,
      token = getAccessToken(),
      signal,
      skipAuthRefresh = false,
    } = options;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal,
    });

    if (
      response.status === 401 &&
      !skipAuthRefresh &&
      !path.includes("/auth/")
    ) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        return this.request<T>(path, {
          ...options,
          token: newToken,
          skipAuthRefresh: true,
        });
      }
    }

    if (!response.ok) {
      let message = `Request failed: ${response.status}`;
      try {
        const err = (await response.json()) as ApiErrorBody;
        message = err.msg ?? err.message ?? message;
      } catch {
        // ignore parse errors
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(path: string, token?: string | null): Promise<T> {
    return this.request<T>(path, { method: HTTP_METHOD.GET, token });
  }

  post<T>(path: string, body?: unknown, token?: string | null): Promise<T> {
    return this.request<T>(path, { method: HTTP_METHOD.POST, body, token });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
