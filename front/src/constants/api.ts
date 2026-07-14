export const API_BASE_URL =
  process.env["NEXT_PUBLIC_API_URL"]?.replace(/\/$/, "") ??
  "http://localhost:5050";

export const API_PATHS = {
  AUTH_SIGNUP: "/api/auth/signup",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_REFRESH: "/api/auth/refresh",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_ME: "/api/auth/me",
  VIDEOS: "/api/videos",
  ADMIN_VIDEOS: "/api/admin/videos",
  ADMIN_UPLOADS: "/api/admin/uploads",
  ADMIN_USERS: "/api/admin/users",
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  AUTH_USER: "authUser",
  LIKED_VIDEOS: "likedVideos",
} as const;

export const HTTP_METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

export const SHARE_PLATFORMS = [
  "copy",
  "whatsapp",
  "x",
  "facebook",
  "instagram",
] as const;
