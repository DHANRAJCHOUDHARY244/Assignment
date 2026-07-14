export const API_PREFIX = "/api" as const;

export const ROUTE_SLUGS = {
  HEALTH: "health",
  AUTH: "auth",
  VIDEOS: "videos",
  ADMIN_VIDEOS: "admin/videos",
  ADMIN_UPLOADS: "admin/uploads",
  ADMIN_USERS: "admin/users",
} as const;

export type RouteSlug = (typeof ROUTE_SLUGS)[keyof typeof ROUTE_SLUGS];
