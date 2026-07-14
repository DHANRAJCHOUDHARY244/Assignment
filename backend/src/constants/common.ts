export const ENV = {
  DEV: "development",
  PROD: "production",
} as const;

export { API_STATUS, HTTP_STATUS } from "./httpStatus";
export type { ApiStatus, HttpStatusCode } from "./httpStatus";
export { API_PREFIX, ROUTE_SLUGS } from "./routes";
export type { RouteSlug } from "./routes";
